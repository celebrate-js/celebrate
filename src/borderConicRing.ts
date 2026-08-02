// ボーダーの「conic-gradientのリング」系（軸A=external-decorate）を1つの機構に
// 統合したもの。spin/rainbow は実装上どちらも ::before を conic-gradient +
// mask-composite でリング状にくり抜く同じ仕組みで、違うのは色の並びと
// 「回り続けるか（sweep）／一度だけ現れて消えるか（flash）」だけだった。
//
// 色の並びは stops（CSSのconic-gradientにそのまま渡せる文字列）としてデータ化し、
// CSS側は --celebrate-border-conic-stops カスタムプロパティで受け取る
// （celebrate.css の .celebrate-border-conic-ring 参照）。

export type BorderConicRingMode = "sweep" | "flash";

export interface BorderConicRingPreset {
  /** どの機構か（プリセット自身が自己申告する）。celebrateBorder()がこれで分岐する。 */
  mechanism: "conicRing";
  /** conic-gradient の色並び。そのままCSSの値として使われる。 */
  stops: string;
  mode: BorderConicRingMode;
  durationMs: number;
}

export function spinPreset(stops: string = "#ff5f6d, #ffc371, #47cf73, #4aa8ff, #ff5f6d"): BorderConicRingPreset {
  return { mechanism: "conicRing", stops, mode: "sweep", durationMs: 1200 };
}

export function rainbowPreset(
  stops: string = "#ff5f6d, #ffc371, #f4e04d, #47cf73, #4aa8ff, #a56bff, #ff5f6d"
): BorderConicRingPreset {
  return { mechanism: "conicRing", stops, mode: "flash", durationMs: 900 };
}
