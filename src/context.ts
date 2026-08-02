import { createContext, useContext } from "react";
import type { ReactNode, RefObject } from "react";
import type { CelebrateTheme } from "./theme";
import type { CelebrateVariant, CelebrateVariantOptions } from "./recipes";

// Provider が配る中身を宣言的 <Celebrate> と命令的 useCelebrate() の両方から参照するため、
// context だけを独立したファイルに置く（Provider と Celebrate の相互 import を避ける）。

export interface CelebrateOptions extends CelebrateVariantOptions {
  /**
   * 演出の基準にする要素。
   * 省略＝画面全体の中央（グローバル）。渡す＝その要素の中心にオーバーレイする（ローカル）。
   */
  anchor?: RefObject<HTMLElement | null>;
}

/** 演出を発火する関数。登録済みの名前・生の ReactNode のどちらも渡せる。 */
export type CelebrateFn = (content: CelebrateVariant | ReactNode, options?: CelebrateOptions) => void;

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
