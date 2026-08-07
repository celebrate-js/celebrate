// 既存の任意コンポーネントの「境界線」を直接装飾するエフェクト。
//
// これまでの variant は全て「アンカー点に何かを重ねて描く」か「画面全体に効果をかける」
// 方式だったが、ボーダー系はどちらとも違う第3の方式：呼び出し側が指す“既存の要素”に
// 直接作用する（useCelebrateBorder.ts 参照）。そのため celebrate() の variant 体系
// （CelebrateVariant）には含めず、別の小さな API として独立させている。
//
// アイコンライブラリ（lucide-react等）と同じ感覚で「名前で選ぶ」10種類を用意しているが、
// 実装の機構は3種類（RadialBurst/ParticleFieldと同じ「テンプレート+パラメータ」）に
// 集約されている：
//   - glow系（glow/neon/fire/ice/electric）：box-shadowのパルス/フリッカー。
//     色・タイミングのstopsをJS（borderGlow.ts）が Web Animations API で駆動する。
//   - conicRing系（spin/rainbow）：conic-gradientのリング。色の並び（stops）を
//     borderConicRing.ts が inline style で渡す。sweep=回り続ける／flash=一度だけ。
//   - class系（ring/ants/shine）：現状1種類ずつしかない、CSSクラス1つで完結する単純な効果。
import { electricPreset, firePreset, glowPreset, icePreset, neonPreset, type BorderGlowPreset } from "./borderGlow";
import { rainbowPreset, spinPreset, type BorderConicRingPreset } from "./borderConicRing";

export type BorderEffectKind =
  "glow" | "spin" | "ring" | "ants" | "shine" | "neon" | "rainbow" | "fire" | "ice" | "electric";

export const BORDER_EFFECT_DURATIONS_MS: Readonly<Record<BorderEffectKind, number>> = {
  glow: 900,
  spin: 1200,
  ring: 800,
  ants: 1200,
  shine: 700,
  neon: 1000,
  rainbow: 900,
  fire: 1100,
  ice: 1100,
  electric: 700,
};

/** 呼び出し側が要素に設定した `--celebrate-border-color` を使う（既定は accent色）。 */
const CALLER_COLOR = "var(--celebrate-border-color, var(--accent, #d64545))";

export type BorderEffectSpec =
  | { mechanism: "glow"; preset: () => BorderGlowPreset }
  | { mechanism: "conicRing"; preset: () => BorderConicRingPreset }
  | { mechanism: "class"; className: string };

/** kind → 実際にどの機構でどう発火するか。useCelebrateBorder.ts はこれを見て分岐する。 */
export const BORDER_EFFECTS: Readonly<Record<BorderEffectKind, BorderEffectSpec>> = {
  glow: { mechanism: "glow", preset: () => glowPreset(CALLER_COLOR) },
  neon: { mechanism: "glow", preset: () => neonPreset(CALLER_COLOR) },
  fire: { mechanism: "glow", preset: () => firePreset() },
  ice: { mechanism: "glow", preset: () => icePreset() },
  electric: { mechanism: "glow", preset: () => electricPreset() },
  spin: { mechanism: "conicRing", preset: () => spinPreset() },
  rainbow: { mechanism: "conicRing", preset: () => rainbowPreset() },
  ring: { mechanism: "class", className: "celebrate-border-ring" },
  ants: { mechanism: "class", className: "celebrate-border-ants" },
  shine: { mechanism: "class", className: "celebrate-border-shine" },
};

/** 用意されている全種類（カタログ表示・デモ向け）。 */
export const BORDER_EFFECT_KINDS: readonly BorderEffectKind[] = [
  "glow",
  "spin",
  "ring",
  "ants",
  "shine",
  "neon",
  "rainbow",
  "fire",
  "ice",
  "electric",
];
