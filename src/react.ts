// @celebrate-js/celebrate/react — React バインディング。
//
// 2つの使い方がある：
//  1. 宣言的（その場に居座る）  <Celebrate variant="stamp" text="正" with={["confetti"]} />
//  2. 命令的（一瞬出て消える）  const celebrate = useCelebrate();
//                                celebrate("confetti");                  // 画面中央
//                                celebrate("confetti", { anchor: ref }); // その要素の位置
// 命令的な方は <CelebrateProvider> をアプリのルートに1回置くこと。

export { CelebrateProvider } from "./CelebrateProvider";
export type { CelebrateProviderProps } from "./CelebrateProvider";
export { activateContainerModifier } from "./containerModifier";
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
export { SakuraBurst } from "./SakuraBurst";
export type { SakuraBurstProps } from "./SakuraBurst";
export { GlyphBurst } from "./GlyphBurst";
export type { GlyphBurstProps } from "./GlyphBurst";
export { RadialBurst, RadialBurstLayer } from "./RadialBurst";
export type { RadialBurstProps, RadialOriginKeyframe } from "./RadialBurst";
export { StrokePath } from "./StrokePath";
export type { StrokePathProps, StrokeLine } from "./StrokePath";
export { ClipReveal } from "./ClipReveal";
export type { ClipRevealProps, ClipRevealEdge } from "./ClipReveal";
export { Sequence } from "./Sequence";
export type { SequenceProps, SequenceStep } from "./Sequence";
export { ParticleField } from "./ParticleField";
export type { ParticleFieldProps, ParticleSpec } from "./ParticleField";
export { BounceText } from "./BounceText";
export type { BounceTextProps } from "./BounceText";
export { MedalBadge } from "./MedalBadge";
export type { MedalBadgeProps } from "./MedalBadge";
export { CheckmarkBurst } from "./CheckmarkBurst";
export type { CheckmarkBurstProps } from "./CheckmarkBurst";
export { CrackerBurst } from "./CrackerBurst";
export type { CrackerBurstProps } from "./CrackerBurst";
export { PopupText } from "./PopupText";
export type { PopupTextProps } from "./PopupText";
export { ConfettiRain } from "./ConfettiRain";
export type { ConfettiRainProps } from "./ConfettiRain";
export { LightningStrike } from "./LightningStrike";
export type { LightningStrikeProps } from "./LightningStrike";
export { FloatDrift } from "./FloatDrift";
export type { FloatDriftProps } from "./FloatDrift";
export { FireworkBurst } from "./FireworkBurst";
export type { FireworkBurstProps } from "./FireworkBurst";
export { ShatterScreen } from "./ShatterScreen";
export type { ShatterScreenProps } from "./ShatterScreen";
export { useCelebrateBorder } from "./useCelebrateBorder";
export type {
  UseCelebrateBorderResult,
  CelebrateBorderOptions,
  BorderTrigger,
  BorderRawTrigger,
} from "./useCelebrateBorder";
export { useContainerModifier } from "./useContainerModifier";
export type { ContainerModifierSpec } from "./useContainerModifier";
export {
  CELEBRATE_VARIANT_NAMES,
  durationForCelebration,
  hasHapticForCelebration,
  hasSoundForCelebration,
  isFullScreenContent,
  renderCelebration,
} from "./recipes";
export type { CelebrateVariant, CelebrateVariantOptions } from "./recipes";
