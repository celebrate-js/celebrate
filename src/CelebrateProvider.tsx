import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { clsx } from "./clsx";
import { CelebrateContext, type CelebrateFn, type CelebrateOptions } from "./context";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";
import {
  containerModifierClassNames,
  durationForCelebration,
  isFullScreenContent,
  playHapticsForCelebration,
  playSoundsForCelebration,
  renderCelebration,
  type CelebrateVariant,
  type CelebrateVariantOptions,
} from "./recipes";
import { activateContainerModifier } from "./containerModifier";
import { intensityToScale } from "./intensity";

// アプリのルートに1回だけ置く Provider 兼オーバーレイ容器。
//
// useCelebrate() で発火した演出はここが document.body へポータル描画し、
// variant ごとの duration 後に自分で片付ける（呼び出し側は消す責任を持たない＝撃ちっぱなし）。
// 画面全体の中央に出す「グローバル版」と、ref で渡した要素の中心に出す「ローカル版」の
// 違いは "どの座標に置くか" だけなので、内部では中心座標1つに正規化して扱う。
//
// 同時に何件でも重ねて出せる（配列で保持し、それぞれが自分の duration で個別に片付く）。
// ポップイットのように多数のボタンを連打・同時押しする使い方を想定しており、
// 「後発が先発を打ち切る」動きは意図しないタイミングで前の演出が消えて見える原因になる
// ため採用しない。
interface ActiveCelebration {
  id: number;
  content: CelebrateVariant | ReactNode;
  options: CelebrateVariantOptions;
  /** 画面座標での中心（px）。null＝ビューポート中央。 */
  center: { x: number; y: number } | null;
}

export interface CelebrateProviderProps {
  children: ReactNode;
  /** アプリ既定の意匠。個々の呼び出しで theme を渡せば上書きできる。 */
  theme?: CelebrateTheme;
  /**
   * 画面全体エフェクト（rain/lightning/shatter等）や中央寄せの基準を、viewport全体
   * ではなくこの要素の内側に閉じ込める。「このカードの中だけ雨を降らせる」のような
   * ローカルなスコープが必要な場合に渡す。渡す場合、この要素自身に
   * `position: relative`（か absolute/fixed）を呼び出し側で設定しておくこと
   * （celebrate 側はこの要素いっぱいに絶対配置で重ねるだけで、位置の基準は作らない）。
   * 省略時は従来通り document.body へ portal し、viewport全体を使う。
   */
  container?: RefObject<HTMLElement | null>;
}

export function CelebrateProvider({ children, theme, container }: CelebrateProviderProps) {
  const [activeList, setActiveList] = useState<readonly ActiveCelebration[]>([]);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  // <html>への class 付け外し自体は containerModifier.ts（shake/hitstop/vignetteと
  // useContainerModifier()フックが共有する ref カウント実装）に任せてあるので、
  // ここでは「アンマウント時に解除関数を呼ぶ」ためだけに保持する。
  const containerModifierReleasers = useRef(new Set<() => void>());
  const appTheme = theme ?? DEFAULT_CELEBRATE_THEME;

  // 演出の途中でアンマウントされてもタイマー・<html>への class を残さない。
  useEffect(() => {
    const timerMap = timers.current;
    const releasers = containerModifierReleasers.current;
    return () => {
      for (const timer of timerMap.values()) clearTimeout(timer);
      timerMap.clear();
      for (const release of releasers) release();
      releasers.clear();
    };
  }, []);

  // container が渡されていれば、overlay-root は document.body ではなくその要素へ
  // portal する（position: fixed ではなく absolute に切り替えて、viewport全体ではなく
  // container の内側だけに閉じ込める。CSS 側は celebrate-overlay-root--scoped 参照）。
  // ref は初回レンダー時点でまだ解決していないことがあるため、effect で同期する。
  useEffect(() => {
    setPortalTarget(container?.current ?? document.body);
  }, [container]);

  const celebrate = useCallback<CelebrateFn>((content: CelebrateVariant | ReactNode, options: CelebrateOptions = {}) => {
    const { anchor, ...variantOptions } = options;
    // 基準要素の位置は発火した瞬間に測る（演出は1秒で消えるため追従は不要）。
    // container が指定されている場合、overlay-root は viewport ではなく container 基準の
    // 絶対配置になるため、中心座標も container の左上を原点にした相対座標に直す。
    const rect = anchor?.current?.getBoundingClientRect() ?? null;
    const containerRect = container?.current?.getBoundingClientRect() ?? null;
    const center = rect
      ? {
          x: rect.left + rect.width / 2 - (containerRect?.left ?? 0),
          y: rect.top + rect.height / 2 - (containerRect?.top ?? 0),
        }
      : null;
    const id = nextId.current++;
    const durationMs = durationForCelebration(content, variantOptions);

    playSoundsForCelebration(content, variantOptions);
    playHapticsForCelebration(content, variantOptions);

    const releases = containerModifierClassNames(content, variantOptions).map((className) =>
      activateContainerModifier(className, durationMs)
    );
    for (const release of releases) containerModifierReleasers.current.add(release);

    setActiveList((prev) => [...prev, { id, content, options: variantOptions, center }]);
    const timer = setTimeout(() => {
      setActiveList((prev) => prev.filter((item) => item.id !== id));
      timers.current.delete(id);
      for (const release of releases) containerModifierReleasers.current.delete(release);
    }, durationMs);
    timers.current.set(id, timer);
  }, [container]);

  const value = useMemo(() => ({ celebrate, theme: appTheme }), [celebrate, appTheme]);

  return (
    <CelebrateContext.Provider value={value}>
      {children}
      {portalTarget &&
        createPortal(
          // トースト（z-index 1000 前後）より上。演出は見せるだけなので操作は一切拾わない。
          // celebrate-overlay-root 自体には transform を持たせない（rain のような
          // 画面全体コンテンツを、変換されていない直下にそのまま描画するため）。
          // container が指定されている場合は position: fixed（viewport基準）ではなく
          // absolute（container基準）に切り替える（--scoped 参照）。
          <div className={clsx("celebrate-overlay-root", container && "celebrate-overlay-root--scoped")}>
            {activeList.map((active) =>
              isFullScreenContent(active.content) ? (
                <div key={active.id} className="celebrate-fullscreen-layer">
                  {renderCelebration(active.content, {
                    ...active.options,
                    theme: active.options.theme ?? appTheme,
                  })}
                </div>
              ) : (
                <div
                  key={active.id}
                  className="celebrate-overlay-anchor"
                  style={{
                    ...(active.center
                      ? { left: `${active.center.x}px`, top: `${active.center.y}px` }
                      : { left: "50%", top: "50%" }),
                    // intensity（コンボ数など）が指定されていれば中心寄せの平行移動に
                    // scale を重ねる。CSS 側は静的な class ではなく、この inline transform
                    // が唯一の出所（instance ごとに値が変わるため class では表現できない）。
                    transform: `translate(-50%, -50%) scale(${
                      active.options.intensity === undefined ? 1 : intensityToScale(active.options.intensity)
                    })`,
                  }}
                >
                  {renderCelebration(active.content, {
                    ...active.options,
                    theme: active.options.theme ?? appTheme,
                  })}
                </div>
              )
            )}
          </div>,
          portalTarget
        )}
    </CelebrateContext.Provider>
  );
}
