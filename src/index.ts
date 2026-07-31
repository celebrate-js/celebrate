// @tools/celebrate — 「決まった瞬間」の演出（印影スタンプ・紙吹雪・キラキラ）。
//
// スタイルは "@tools/celebrate/celebrate.css"（アプリ側で1回だけ import する）。
//
// 2つの使い方がある：
//  1. 宣言的（その場に居座る）  <Celebrate variant="stamp" text="正" confetti />
//  2. 命令的（一瞬出て消える）  const celebrate = useCelebrate();
//                                celebrate("confetti");                  // 画面中央
//                                celebrate("confetti", { anchor: ref }); // その要素の位置
// 命令的な方は <CelebrateProvider> をアプリのルートに1回置くこと。

export { CelebrateProvider } from "./CelebrateProvider";
export type { CelebrateProviderProps } from "./CelebrateProvider";
export { useCelebrate } from "./context";
export type { CelebrateFn, CelebrateOptions } from "./context";
export { Celebrate } from "./Celebrate";
export type { CelebrateProps } from "./Celebrate";
export { Stamp } from "./Stamp";
export type { StampProps, CelebrateSize } from "./Stamp";
export { ConfettiBurst } from "./ConfettiBurst";
export type { ConfettiBurstProps } from "./ConfettiBurst";
export { RecordBanner } from "./RecordBanner";
export type { RecordBannerProps } from "./RecordBanner";
export { SparkleBurst } from "./SparkleBurst";
export type { SparkleBurstProps } from "./SparkleBurst";
export {
  createSeededSparkleRandom,
  createSparkleParticles,
  SPARKLE_DURATION_MS,
  SPARKLE_PARTICLE_COUNT,
} from "./sparkle";
export type { SparkleParticle, SparkleRandom, SparkleTone } from "./sparkle";
export {
  chooseSparkleSound,
  playSparkleSound,
  sparkleSoundIndex,
  SPARKLE_SOUND_PRESETS,
} from "./sparkleSound";
export type { SparkleSoundPreset } from "./sparkleSound";
export { DEFAULT_CELEBRATE_THEME } from "./theme";
export type { CelebrateTheme, ConfettiPalette } from "./theme";
export { CONFETTI_PIECES, CONFETTI_PIECE_COUNT, CELEBRATE_DURATION_MS } from "./pieces";
export type { ConfettiPiece } from "./pieces";
export {
  CELEBRATION_DURATIONS_MS,
  durationForCelebration,
} from "./variants";
export type { CelebrateVariant, CelebrateVariantOptions } from "./variants";
