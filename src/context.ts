import { createContext, useContext } from "react";
import type { ReactNode, RefObject } from "react";
import type { CelebrateTheme } from "./theme";
import type { CelebrateVariant, CelebrateVariantOptions, UniversalCelebrateOptions, VariantOptionsMap } from "./recipes";

// Provider が配る中身を宣言的 <Celebrate> と命令的 useCelebrate() の両方から参照するため、
// context だけを独立したファイルに置く（Provider と Celebrate の相互 import を避ける）。

export interface CelebrateOptions extends CelebrateVariantOptions {
  /**
   * 演出の基準にする要素。
   * 省略＝画面全体の中央（グローバル）。渡す＝その要素の中心にオーバーレイする（ローカル）。
   */
  anchor?: RefObject<HTMLElement | null>;
}

type AnchorOption = Pick<CelebrateOptions, "anchor">;

/**
 * 演出を発火する関数。登録済みの名前・生の ReactNode のどちらも渡せる。
 *
 * - 第一引数が `celebrate("pop", ...)` のように文字列リテラルで書かれていて、どのvariantか
 *   コンパイル時に分かる場合、第二引数はそのvariantが実際に効果を持つoptionだけに絞り込まれる
 *   （`VariantOptionsMap` 参照）。効果のないoptionを渡すとコンパイルエラーになる。
 * - 第一引数が `useState<CelebrateVariant>` 等の変数の場合はこの絞り込みができないため、
 *   1つ目のoverloadに `V extends CelebrateVariant` としてそのまま渡り、`VariantOptionsMap[V]`
 *   はvariantの和集合全体になる（＝結果的に緩い絞り込みになる。呼び出し側が動的にvariantを
 *   切り替えるデモのPlaygroundのようなケースの逃げ道）。
 * - 第一引数が既知のvariant名ではない生の ReactNode・文字列の場合は2つ目のoverloadになる。
 *   この場合recipeが存在しないため、variant固有のoption（text/colors/scale等）は渡しても
 *   一切効果がなく、渡せるのはuniversalなoptionだけ。
 */
export type CelebrateFn = {
  <V extends CelebrateVariant>(
    variant: V,
    options?: UniversalCelebrateOptions & AnchorOption & VariantOptionsMap[V]
  ): void;
  (content: ReactNode, options?: UniversalCelebrateOptions & AnchorOption): void;
};

export interface CelebrateContextValue {
  celebrate: CelebrateFn;
  /** アプリ既定の意匠。<Celebrate> / celebrate() が theme を省略したときに使われる。 */
  theme: CelebrateTheme;
}

export const CelebrateContext = createContext<CelebrateContextValue | null>(null);

/**
 * 演出を発火する関数を返す。`CelebrateProvider` の内側でだけ使える。
 *
 *   const celebrate = useCelebrate();
 *   celebrate("stamp", { text: "正", with: ["confetti"] });     // 画面中央
 *   celebrate("confetti", { anchor: tileRef });                 // その要素の位置
 */
export function useCelebrate(): CelebrateFn {
  const ctx = useContext(CelebrateContext);
  // 置き忘れは静かに「演出が出ない」バグになるため、その場で落として気づかせる（fail fast）。
  if (!ctx) throw new Error("useCelebrate は <CelebrateProvider> の内側で使ってください");
  return ctx.celebrate;
}

/** Provider があればその theme を、無ければ null を返す（宣言的 <Celebrate> 用）。 */
export function useCelebrateTheme(): CelebrateTheme | null {
  return useContext(CelebrateContext)?.theme ?? null;
}
