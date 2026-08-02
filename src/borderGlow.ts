// ボーダーの「box-shadowパルス/フリッカー」系（軸A=external-decorate）を1つの
// 機構に統合したもの。glow/neon/fire/ice/electric は実装上すべてこれで、
// 違うのは色と、box-shadowが時間軸上でどう変化するか（stops）だけだった。
//
// CSSの@keyframesは「ステップ数・タイミング」を実行時パラメータ化できない
// （% の刻みはCSS記述時に決め打ちする必要がある）ため、これは静的CSSではなく
// Web Animations API（Element.animate）で駆動する＝stopsは呼び出し時に渡す
// ただのデータになる。ここが RadialBurst / StrokePath と違い唯一 JS 駆動である理由。
//
// fire/ice/electric は元々ここの色を呼び出し側から変えられなかった（CSS内に
// 直接色をベタ書きしていた）。この統合により、全プリセットが色パラメータを
// 受け取れるようになっている（既定値は元の見た目と同じ色）。

export interface BorderGlowStop {
  /** 0〜1（アニメーション全体に対する位置）。 */
  offset: number;
  boxShadow: string;
}

export interface BorderGlowPreset {
  /** どの機構か（プリセット自身が自己申告する）。celebrateBorder()がこれで分岐する。 */
  mechanism: "glow";
  stops: readonly BorderGlowStop[];
  durationMs: number;
  /** 既定 "ease-out"。electricだけ steps() で離散的なジッターにする。 */
  easing?: string;
}

/** 指定した要素へ box-shadow アニメーションを1回再生する。 */
export function playBorderGlow(el: HTMLElement, preset: BorderGlowPreset): Animation {
  return el.animate(
    preset.stops.map((stop) => ({ offset: stop.offset, boxShadow: stop.boxShadow })),
    { duration: preset.durationMs, easing: preset.easing ?? "ease-out", fill: "forwards" }
  );
}

const NONE = "none";

/** glow：1回だけ膨らんで消えるシンプルなパルス。単色。 */
export function glowPreset(color: string): BorderGlowPreset {
  return {
    mechanism: "glow",
    durationMs: 900,
    stops: [
      { offset: 0, boxShadow: `0 0 0 0 ${color}` },
      { offset: 1, boxShadow: `0 0 0 0.9rem transparent` },
    ],
  };
}

/** neon：ネオンサインのようにチカチカ明滅してから消える。単色。 */
export function neonPreset(color: string): BorderGlowPreset {
  const dim = `0 0 0.15rem ${color}, 0 0 0.5rem ${color}`;
  const bright = `0 0 0.2rem ${color}, 0 0 0.7rem ${color}`;
  return {
    mechanism: "glow",
    durationMs: 1000,
    stops: [
      { offset: 0, boxShadow: NONE },
      { offset: 0.06, boxShadow: dim },
      { offset: 0.08, boxShadow: NONE },
      { offset: 0.1, boxShadow: dim },
      { offset: 0.14, boxShadow: bright },
      { offset: 0.75, boxShadow: bright },
      { offset: 0.78, boxShadow: NONE },
      { offset: 0.82, boxShadow: bright },
      { offset: 1, boxShadow: NONE },
    ],
  };
}

/** fire：暖色のゆらめきが枠を包む。2色（芯の色・外側の色）。 */
export function firePreset(colors: readonly [string, string] = ["#ffcf5c", "#ff8a3d"]): BorderGlowPreset {
  const [core, outer] = colors;
  return {
    mechanism: "glow",
    durationMs: 1100,
    stops: [
      { offset: 0, boxShadow: `0 0 0.1rem ${core}` },
      { offset: 0.15, boxShadow: `0 0 0.25rem ${core}, 0 0 0.6rem ${outer}` },
      { offset: 0.35, boxShadow: `0 0 0.15rem ${core}, 0 0 0.4rem ${outer}` },
      { offset: 0.55, boxShadow: `0 0 0.3rem ${core}, 0 0 0.75rem ${outer}` },
      { offset: 1, boxShadow: `0 0 0 transparent` },
    ],
  };
}

/** ice：寒色の静かな輝きがゆっくり消える。2色（芯の色・外側の色）。 */
export function icePreset(colors: readonly [string, string] = ["#eaffff", "#7fd9ff"]): BorderGlowPreset {
  const [core, outer] = colors;
  return {
    mechanism: "glow",
    durationMs: 1100,
    stops: [
      { offset: 0, boxShadow: `0 0 0.15rem ${core}, 0 0 0.5rem ${outer}` },
      { offset: 0.5, boxShadow: `0 0 0.2rem ${core}, 0 0 0.7rem ${outer}` },
      { offset: 1, boxShadow: `0 0 0 transparent` },
    ],
  };
}

/** electric：稲妻のように鋭く不規則にチカチカする（neonより速い離散ジャンプ）。2色。 */
export function electricPreset(colors: readonly [string, string] = ["#9fd8ff", "#cdeaff"]): BorderGlowPreset {
  const [a, b] = colors;
  return {
    mechanism: "glow",
    durationMs: 700,
    easing: "steps(1, end)",
    stops: [
      { offset: 0, boxShadow: NONE },
      { offset: 0.08, boxShadow: `0 0 0.5rem ${a}` },
      { offset: 0.16, boxShadow: NONE },
      { offset: 0.24, boxShadow: `0 0 0.6rem ${b}` },
      { offset: 0.3, boxShadow: NONE },
      { offset: 0.4, boxShadow: `0 0 0.5rem ${a}` },
      { offset: 0.46, boxShadow: NONE },
      { offset: 0.6, boxShadow: `0 0 0.6rem ${b}` },
      { offset: 0.68, boxShadow: NONE },
      { offset: 1, boxShadow: NONE },
    ],
  };
}
