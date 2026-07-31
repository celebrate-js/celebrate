import { useCelebrateTheme } from "./context";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";
import { renderCelebration, type CelebrateVariant, type CelebrateVariantOptions } from "./variants";
import type { CelebrateSize } from "./Stamp";

// 宣言的な演出（その場に居座る版）。
//
// 「結果パネルの中に印影が押されたまま残る」のように、演出が画面の一部として
// レイアウトに参加する場合はこちらを使う（オーバーレイではないので余白を押し出す）。
// 一瞬だけ出して消えるワンショットは useCelebrate() の命令的 API を使う。

export interface CelebrateProps extends CelebrateVariantOptions {
  variant: CelebrateVariant;
}

export type { CelebrateVariant, CelebrateSize, CelebrateTheme };

/** 指定した variant の演出をその場に描画する。 */
export function Celebrate({ variant, theme, ...options }: CelebrateProps) {
  const providerTheme = useCelebrateTheme();
  return renderCelebration(variant, {
    ...options,
    theme: theme ?? providerTheme ?? DEFAULT_CELEBRATE_THEME,
  });
}
