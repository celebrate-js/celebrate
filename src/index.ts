// @celebrate-js/celebrate — 「決まった瞬間」の演出（印影スタンプ・紙吹雪・桜吹雪・キラキラ・…）。
//
// スタイルは "@celebrate-js/celebrate/celebrate.css"（アプリ側で1回だけ import する）。
//
// このエントリポイント（"."）は React に依存しない純粋な部分だけを公開する
// （variant の種類・duration・theme の型・粒データの生成）。
// React コンポーネント（<Celebrate>, <CelebrateProvider>, useCelebrate() など）は
// "@celebrate-js/celebrate/react" から import する。

export { DEFAULT_CELEBRATE_THEME } from "./theme";
export type { CelebrateTheme, ConfettiPalette } from "./theme";
export { CONFETTI_PIECES, CONFETTI_PIECE_COUNT, CELEBRATE_DURATION_MS } from "./pieces";
export type { ConfettiPiece } from "./pieces";
export {
  createSeededSparkleRandom,
  createSparkleParticles,
  SPARKLE_DURATION_MS,
  SPARKLE_PARTICLE_COUNT,
} from "./sparkle";
export type { SparkleParticle, SparkleRandom, SparkleTone } from "./sparkle";
export { chooseSparkleSound, playSparkleSound, sparkleSoundIndex, SPARKLE_SOUND_PRESETS } from "./sparkleSound";
export type { SparkleSoundPreset } from "./sparkleSound";
export { POP_DURATION_MS } from "./pop";
export { createSakuraPetals, createSeededSakuraRandom, SAKURA_PETAL_COUNT, SAKURA_DURATION_MS } from "./sakura";
export type { SakuraPetal } from "./sakura";
export { createGlyphParticles, GLYPH_BURST_PARTICLE_COUNT, GLYPH_BURST_DURATION_MS } from "./glyphParticles";
export type { GlyphParticle } from "./glyphParticles";
export {
  RIPPLE_DURATION_MS,
  RING_DURATION_MS,
  BOUNCE_DURATION_MS,
  MEDAL_DURATION_MS,
  FLASH_DURATION_MS,
  CHECKMARK_DURATION_MS,
  SHAKE_DURATION_MS,
  HITSTOP_DURATION_MS,
  POPUP_DURATION_MS,
  VIGNETTE_DURATION_MS,
  LIGHTNING_DURATION_MS,
  FLOAT_DURATION_MS,
} from "./durations";
export { createSeededRandom } from "./random";
export type { RandomFn } from "./random";
export {
  createCrackerStreamers,
  createSeededCrackerRandom,
  CRACKER_STREAMER_COUNT,
  CRACKER_DURATION_MS,
} from "./cracker";
export type { CrackerStreamer } from "./cracker";
export { createRainPieces, createSeededRainRandom, RAIN_PIECE_COUNT, RAIN_DURATION_MS } from "./rain";
export type { RainPiece } from "./rain";
export { createLightningPath, createSeededLightningRandom } from "./lightning";
export type { LightningPath } from "./lightning";
export {
  createFireworkShells,
  createSeededFireworkRandom,
  FIREWORK_SHELL_COUNT,
  FIREWORK_PARTICLES_PER_SHELL,
  FIREWORK_DURATION_MS,
} from "./firework";
export type { FireworkShell, FireworkParticle, FireworkStyle } from "./firework";
export {
  createShatterScene,
  createSeededShatterRandom,
  SHATTER_CRACK_COUNT,
  SHATTER_SHARD_COUNT,
  SHATTER_DURATION_MS,
} from "./shatter";
export type { ShatterScene, CrackLine, Shard } from "./shatter";
export { RADIAL_BURST_PRESETS } from "./radialLayers";
export type { RadialBurstShape, RadialLayer, RadialBurstPreset, RadialBurstPresetName } from "./radialLayers";
export { ballisticPositionAt } from "./ballistic";
export type { BallisticParams, BallisticPosition } from "./ballistic";
export {
  MOTION_PROFILES,
  radialMotion,
  ballisticMotion,
  fallMotion,
  staticScaleMotion,
  orbitTwinkleMotion,
} from "./motionProfile";
export type {
  MotionProfile,
  MotionProfileName,
  ParticleState,
  RadialMotionParams,
  BallisticMotionParams,
  FallMotionParams,
  StaticScaleParams,
  OrbitTwinkleParams,
} from "./motionProfile";
export { rollRewardTier } from "./rewardTier";
export type { RewardTier } from "./rewardTier";
export { enterSettleStyle } from "./enterSettle";
export type { EnterSettleOptions } from "./enterSettle";
export { BORDER_EFFECT_DURATIONS_MS, BORDER_EFFECT_KINDS } from "./borderEffect";
export type { BorderEffectKind, BorderEffectSpec } from "./borderEffect";
// playBorderGlow（生のDOM要素へWeb Animations APIで書き込む関数）は公開しない。
// DOM操作は useCelebrateBorder フックの中に閉じ込め、呼び出し側は
// celebrateBorder(name | spec) だけを触る（celebrateBorder(neonPreset("#f00")) のように、
// プリセット関数の戻り値はそのままフックに渡せる）。
export { glowPreset, neonPreset, firePreset, icePreset, electricPreset } from "./borderGlow";
export type { BorderGlowPreset, BorderGlowStop } from "./borderGlow";
export { spinPreset, rainbowPreset } from "./borderConicRing";
export type { BorderConicRingPreset, BorderConicRingMode } from "./borderConicRing";
export {
  intensityToScale,
  intensityToDurationMultiplier,
  intensityToGainMultiplier,
  intensityToHapticMultiplier,
} from "./intensity";
