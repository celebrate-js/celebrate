import { clsx } from "./clsx";
import { StrokePath } from "./StrokePath";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface CheckmarkBurstProps {
  theme?: CelebrateTheme;
  className?: string;
}

// 円の外周（半径23の円周 ≈ 144.5）を、開始角度をずらした2本の弧に分けて
// dasharrayぶんだけ隙間なく描き切る（1本のpath dで単純に円を表せないSVGの制約への定石）。
const CHECKMARK_CIRCLE_D = "M26,3 A23,23 0 1,1 25.99,3 Z";
const CHECKMARK_CIRCLE_DASH_LENGTH = 145;
const CHECKMARK_CHECK_D = "M14 27l7 7 17-17";
const CHECKMARK_CHECK_DASH_LENGTH = 36;

/**
 * 円が描かれてからチェックが描き込まれる（「正解・完了」の定番表現）。
 * 実装は StrokePath（軸D=stroke-reveal。lightning・shatterのヒビと同じ仕組み）に委ねる。
 */
export function CheckmarkBurst({ theme = DEFAULT_CELEBRATE_THEME, className }: CheckmarkBurstProps) {
  return (
    <span aria-hidden="true" data-checkmark-burst="" className={clsx("celebrate-checkmark", className)}>
      <StrokePath
        viewBox="0 0 52 52"
        className="celebrate-checkmark-svg"
        lines={[
          {
            d: CHECKMARK_CIRCLE_D,
            strokeWidth: 2.5,
            dashLength: CHECKMARK_CIRCLE_DASH_LENGTH,
            color: theme.stampColor,
            durationMs: 450,
          },
          {
            d: CHECKMARK_CHECK_D,
            strokeWidth: 3.5,
            dashLength: CHECKMARK_CHECK_DASH_LENGTH,
            color: theme.stampColor,
            durationMs: 300,
            delayMs: 350,
          },
        ]}
      />
    </span>
  );
}
