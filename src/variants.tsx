import type { ReactElement } from "react";
import { ConfettiBurst } from "./ConfettiBurst";
import { RecordBanner } from "./RecordBanner";
import { SparkleBurst } from "./SparkleBurst";
import { SPARKLE_DURATION_MS } from "./sparkle";
import { CELEBRATE_DURATION_MS } from "./pieces";
import { Stamp, type CelebrateSize } from "./Stamp";
import type { CelebrateTheme } from "./theme";

// 演出の種類（variant）と、その描画関数の対応表。
//
// 新しい演出（2048 のタイル合体演出など）を足すときは、ここに1行足すだけで
// 宣言的な <Celebrate> と命令的な celebrate() の両方から使えるようになる
// ＝出し方（インライン／オーバーレイ）と見た目（variant）を独立に増やせる構造。

/** 演出の種類。 */
export type CelebrateVariant = "stamp" | "confetti" | "record" | "sparkle";

/** variant ごとの見た目パラメータ（使わない variant では無視される）。 */
export interface CelebrateVariantOptions {
  /** `stamp` / `record`: 大きく出す文字。 */
  text?: string;
  /** `record`: 大きい文字の下に添える一言（例：「れんぞく 7問」）。 */
  note?: string;
  /** `stamp`: 印影の大きさ。 */
  size?: CelebrateSize;
  /** `stamp`: 紙吹雪も一緒に出す。 */
  confetti?: boolean;
  /** 意匠（色・角丸・書体）。省略時は Provider の theme → 既定 theme の順で解決される。 */
  theme?: CelebrateTheme;
  /** `sparkle`: 合成音を鳴らす。命令的APIでは既定true。 */
  sound?: boolean;
  /** `sparkle`: 再現可能なテスト・デモ用。 */
  seed?: number;
}

type VariantRenderer = (options: CelebrateVariantOptions) => ReactElement;

const RENDERERS: Record<CelebrateVariant, VariantRenderer> = {
  stamp: ({ text = "", size, confetti, theme }) => (
    <Stamp text={text} size={size} confetti={confetti} theme={theme} />
  ),
  // 紙吹雪だけを出す。粒は親の中心から散るので、大きさゼロの基準点を置く。
  confetti: ({ theme }) => (
    <span className="relative block w-0 h-0">
      <ConfettiBurst theme={theme} />
    </span>
  ),
  // 自己ベスト更新のような「一段上の出来事」を、画面の中央に大きく被せて祝う。
  record: ({ text = "", note, theme }) => <RecordBanner text={text} note={note} theme={theme} />,
  sparkle: ({ theme, seed }) => <SparkleBurst theme={theme} seed={seed} />,
};

export const CELEBRATION_DURATIONS_MS: Readonly<Record<CelebrateVariant, number>> = {
  stamp: CELEBRATE_DURATION_MS,
  confetti: CELEBRATE_DURATION_MS,
  record: CELEBRATE_DURATION_MS,
  sparkle: SPARKLE_DURATION_MS,
};

export function durationForCelebration(variant: CelebrateVariant): number {
  return CELEBRATION_DURATIONS_MS[variant];
}

/** variant を実際の要素に変換する。 */
export function renderCelebration(
  variant: CelebrateVariant,
  options: CelebrateVariantOptions
): ReactElement {
  return RENDERERS[variant](options);
}
