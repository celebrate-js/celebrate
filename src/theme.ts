// 演出の見た目パラメータ（色・角丸・書体）。
//
// celebrate は「決まった瞬間の演出」だけを担当し、意匠そのものは呼び出し側のアプリが決める。
// kanbun なら朱色の落款、2048 ならタイル色、といったアプリ固有の色を props / Provider から
// 受け取るため、パッケージ側に per-app トークンをベタ書きしない（SSOT は各アプリの theme）。

/** 紙吹雪の粒が参照する色は4色。粒データ側は「何色目か」だけを持つ（`ConfettiPiece.tone`）。 */
export type ConfettiPalette = readonly [string, string, string, string];

export interface CelebrateTheme {
  /** 印影の枠線と文字の色。 */
  stampColor: string;
  /** 印影の角丸。 */
  stampRadius: string;
  /** 印影の書体（font-family）。 */
  stampFont: string;
  /** 角ばった紙吹雪の粒の角丸（丸い粒は常に真円）。 */
  pieceRadius: string;
  /** 紙吹雪の粒の色パレット。 */
  confettiColors: ConfettiPalette;
  /**
   * 記録更新の帯（`record` variant）の文字・枠の色。省略時は `stampColor`。
   * 「ふだんの正解（印影）」と「記録更新」を色で区別したいアプリだけ渡す（後方互換の任意項目）。
   */
  recordColor?: string;
  /** 記録更新の帯の地色。省略時は透明（盤面がそのまま透ける）。 */
  recordBackground?: string;
}

/**
 * アプリが theme を渡さなかったときの既定。
 * 共通 DS トークン（`--accent` / `--r-*`）だけで構成し、per-app トークンには依存しない。
 */
export const DEFAULT_CELEBRATE_THEME: CelebrateTheme = {
  stampColor: "var(--accent)",
  stampRadius: "var(--r-lg)",
  stampFont: "inherit",
  pieceRadius: "var(--r-sm)",
  confettiColors: [
    "var(--accent)",
    "var(--accent-weak)",
    "var(--accent)",
    "var(--ink-2)",
  ],
};
