import { useCallback, useEffect, useRef, type RefObject } from "react";
import { BORDER_EFFECT_DURATIONS_MS, BORDER_EFFECTS, type BorderEffectKind } from "./borderEffect";
import { playBorderGlow, type BorderGlowPreset } from "./borderGlow";
import type { BorderConicRingPreset } from "./borderConicRing";
import { intensityToDurationMultiplier } from "./intensity";

// 既存のコンポーネント（カード・ボタンなど）自身の境界線を、押した瞬間だけ光らせる／
// 回転させるためのフック。celebrate() のオーバーレイ方式と違い、ref で渡した
// “本物のDOM要素” に直接作用する。
//
//   const { ref, celebrateBorder } = useCelebrateBorder<HTMLDivElement>();
//   <div ref={ref} className="card" onClick={() => celebrateBorder("spin")}>...</div>
//
// DOM操作（classList/style/Web Animations API）は全てこのフックの中に閉じ込める。
// 呼び出し側が生のDOM要素を掴んで playBorderGlow() 等を自分で呼ぶ必要はない。
// Tier1のカタログ名だけでなく、Tier3の生プリセットもこのフック経由で渡せる。
// celebrate()が「名前 か 生のReactNodeを直接」渡せるのと同じ形に揃えてあるので、
// ラッパーオブジェクトは要らない（プリセット自身が`mechanism`を持っている）：
//
//   celebrateBorder(neonPreset("#ff0000"));
//   celebrateBorder(spinPreset("#fff, #000"));

const CONIC_RING_CLASS = "celebrate-border-conic-ring";
const CLASS_MECHANISM_CLASS_NAMES = ["celebrate-border-ring", "celebrate-border-ants", "celebrate-border-shine"];
// conicRing/class機構（CSS駆動）は全部この1つのCSSカスタムプロパティを介して
// durationをスケールする（celebrate.css内の各animationのdurationがcalc(Xs * var(...))を参照）。
// glow機構（WAAPI駆動）だけは自分でdurationMsを直接渡すため、これとは別経路で同じ倍率をかける。
const DURATION_SCALE_PROPERTY = "--celebrate-border-duration-scale";

export interface CelebrateBorderOptions {
  /** 演出の強度。durationに対数カーブで反映される（celebrate()のintensityと同じ設計）。 */
  intensity?: number;
}

/** Tier3：生のプリセットを直接渡す場合の形（celebrate()のReactNodeに相当）。 */
export type BorderRawTrigger = BorderGlowPreset | BorderConicRingPreset;

/** カタログの名前（Tier1）か、生のプリセット（Tier3）のどちらかを渡せる。 */
export type BorderTrigger = BorderEffectKind | BorderRawTrigger;

export interface UseCelebrateBorderResult<T extends HTMLElement> {
  ref: RefObject<T | null>;
  /** 対象要素の境界線エフェクトを発火する（既定 "glow"）。 */
  celebrateBorder: (trigger?: BorderTrigger, options?: CelebrateBorderOptions) => void;
}

/** カタログ名（thunk入りのBORDER_EFFECTS）と生トリガーの両方を、同じ形に正規化する。 */
type ResolvedTrigger = BorderGlowPreset | BorderConicRingPreset | { mechanism: "class"; className: string; durationMs: number };

function resolveTrigger(trigger: BorderTrigger): ResolvedTrigger {
  if (typeof trigger !== "string") return trigger;
  const spec = BORDER_EFFECTS[trigger];
  if (spec.mechanism === "class") {
    return { mechanism: "class", className: spec.className, durationMs: BORDER_EFFECT_DURATIONS_MS[trigger] };
  }
  return spec.preset();
}

export function useCelebrateBorder<T extends HTMLElement = HTMLElement>(): UseCelebrateBorderResult<T> {
  const ref = useRef<T>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animation = useRef<Animation | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      animation.current?.cancel();
    };
  }, []);

  const celebrateBorder = useCallback((trigger: BorderTrigger = "glow", options?: CelebrateBorderOptions) => {
    const el = ref.current;
    if (!el) return;
    if (timer.current) clearTimeout(timer.current);
    animation.current?.cancel();

    // 連打で同じ trigger が続けて発火してもアニメーションが再スタートするよう、
    // 一度クラスを外して強制リフローしてから付け直す。
    el.classList.remove(CONIC_RING_CLASS, `${CONIC_RING_CLASS}--sweep`, `${CONIC_RING_CLASS}--flash`);
    el.classList.remove(...CLASS_MECHANISM_CLASS_NAMES);
    void el.offsetWidth;

    const resolved = resolveTrigger(trigger);
    const durationScale = options?.intensity === undefined ? 1 : intensityToDurationMultiplier(options.intensity);
    const durationMs = resolved.durationMs * durationScale;

    if (resolved.mechanism === "glow") {
      animation.current = playBorderGlow(el, { ...resolved, durationMs });
      timer.current = setTimeout(() => {
        timer.current = null;
      }, durationMs);
      return;
    }

    // conicRing/class機構はCSS駆動なので、durationはJSから直接渡さずこのカスタム
    // プロパティ経由でスケールする（celebrate.cssの各animationがcalc()で参照する）。
    el.style.setProperty(DURATION_SCALE_PROPERTY, String(durationScale));

    if (resolved.mechanism === "conicRing") {
      el.style.setProperty("--celebrate-border-conic-stops", resolved.stops);
      const modeClass = `${CONIC_RING_CLASS}--${resolved.mode}`;
      el.classList.add(CONIC_RING_CLASS, modeClass);
      timer.current = setTimeout(() => {
        el.classList.remove(CONIC_RING_CLASS, modeClass);
        timer.current = null;
      }, durationMs);
      return;
    }

    el.classList.add(resolved.className);
    timer.current = setTimeout(() => {
      el.classList.remove(resolved.className);
      timer.current = null;
    }, durationMs);
  }, []);

  return { ref, celebrateBorder };
}
