import type { ReactNode } from "react";
import { useCelebrateTheme } from "./context";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";
import { renderCelebration } from "./recipes";
import type { CelebrateVariant, CelebrateVariantOptions } from "./recipes";
import type { CelebrateSize } from "./Stamp";

// 宣言的な演出（その場に居座る版）。
//
// 「結果パネルの中に印影が押されたまま残る」のように、演出が画面の一部として
// レイアウトに参加する場合はこちらを使う（オーバーレイではないので余白を押し出す）。
// 一瞬だけ出して消えるワンショットは useCelebrate() の命令的 API を使う。
//
// 【celebrate()との違い】ここは見た目（renderCelebration）だけを描画し、
// 効果音・振動は鳴らさない。CelebrateProvider の celebrate() は発火の瞬間に
// playSoundsForCelebration/playHapticsForCelebration を呼ぶが、<Celebrate> は
// 親の再レンダーのたびに何度も描画されうる（結果パネルが再レンダーされる等）ため、
// そのたびに音・振動が再生されると煩わしい。「その場に居座る」用途では
// 通常、最初に表示された瞬間だけ鳴らしたいはずなので、鳴らすタイミングは
// 呼び出し側（celebrate()を呼んだ張本人）が制御すべきという判断で、意図的に鳴らさない。

export interface CelebrateProps extends CelebrateVariantOptions {
  variant: CelebrateVariant | ReactNode;
}

export type { CelebrateVariant, CelebrateSize, CelebrateTheme };

/** 指定した variant の演出をその場に描画する（音・振動は鳴らさない。上記コメント参照）。 */
export function Celebrate({ variant, theme, ...options }: CelebrateProps) {
  const providerTheme = useCelebrateTheme();
  return renderCelebration(variant, {
    ...options,
    theme: theme ?? providerTheme ?? DEFAULT_CELEBRATE_THEME,
  });
}
