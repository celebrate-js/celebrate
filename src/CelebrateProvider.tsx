import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CelebrateContext, type CelebrateFn, type CelebrateOptions } from "./context";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";
import {
  durationForCelebration,
  renderCelebration,
  type CelebrateVariant,
  type CelebrateVariantOptions,
} from "./variants";
import { playSparkleSound } from "./sparkleSound";

// アプリのルートに1回だけ置く Provider 兼オーバーレイ容器。
//
// useCelebrate() で発火した演出はここが document.body へポータル描画し、
// variant ごとの duration 後に自分で片付ける（呼び出し側は消す責任を持たない＝撃ちっぱなし）。
// 画面全体の中央に出す「グローバル版」と、ref で渡した要素の中心に出す「ローカル版」の
// 違いは "どの座標に置くか" だけなので、内部では中心座標1つに正規化して扱う。
//
// 同時に見せるのは常に1件だけ（新しい celebrate() が前の演出を打ち切って置き換える）。
// 連続正解のたびに自己ベストを更新するケース（kanbun のレ点順番パズル）のように、
// 前の演出の CELEBRATE_DURATION_MS が終わる前に次の celebrate() が呼ばれることがある。
// 以前は呼ぶたびに配列へ積んでいたため、そういう場面では全画面オーバーレイが積み重なって
// 常時どれかが表示され続け、「新記録演出が消えない」ように見えるバグになっていた
// （個々のタイマーは正しく1.2秒で片付いていたが、次々に新しい演出が割り込むせいで
// 画面上に空白の瞬間が生まれなかった）。1件だけを保持し、新しい呼び出しで置き換えることで
// 常にどこかのタイミングで消える隙間ができる。
interface ActiveCelebration {
  id: number;
  variant: CelebrateVariant;
  options: CelebrateVariantOptions;
  /** 画面座標での中心（px）。null＝ビューポート中央。 */
  center: { x: number; y: number } | null;
}

export interface CelebrateProviderProps {
  children: ReactNode;
  /** アプリ既定の意匠。個々の呼び出しで theme を渡せば上書きできる。 */
  theme?: CelebrateTheme;
}

export function CelebrateProvider({ children, theme }: CelebrateProviderProps) {
  const [active, setActive] = useState<ActiveCelebration | null>(null);
  const nextId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appTheme = theme ?? DEFAULT_CELEBRATE_THEME;

  // 演出の途中でアンマウントされてもタイマーを残さない。
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const celebrate = useCallback<CelebrateFn>((variant, options: CelebrateOptions = {}) => {
    const { anchor, ...variantOptions } = options;
    // 基準要素の位置は発火した瞬間に測る（演出は1秒で消えるため追従は不要）。
    const rect = anchor?.current?.getBoundingClientRect() ?? null;
    const center = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
    const id = nextId.current++;

    // 前の演出がまだ表示中でも打ち切って置き換える（積み上げない＝常に1件だけ）。
    if (timer.current) clearTimeout(timer.current);
    if (variant === "sparkle" && variantOptions.sound !== false) {
      playSparkleSound();
    }
    setActive({ id, variant, options: variantOptions, center });
    timer.current = setTimeout(() => {
      setActive((prev) => (prev?.id === id ? null : prev));
      timer.current = null;
    }, durationForCelebration(variant));
  }, []);

  const value = useMemo(() => ({ celebrate, theme: appTheme }), [celebrate, appTheme]);

  return (
    <CelebrateContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          // トースト（z-1000）より上。演出は見せるだけなので操作は一切拾わない。
          <div className="fixed inset-0 z-[1100] pointer-events-none overflow-hidden">
            {active && (
              <div
                key={active.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={
                  active.center
                    ? { left: `${active.center.x}px`, top: `${active.center.y}px` }
                    : { left: "50%", top: "50%" }
                }
              >
                {renderCelebration(active.variant, {
                  ...active.options,
                  theme: active.options.theme ?? appTheme,
                })}
              </div>
            )}
          </div>,
          document.body
        )}
    </CelebrateContext.Provider>
  );
}
