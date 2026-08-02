import type { CSSProperties } from "react";
import { clsx } from "./clsx";
import { enterSettleStyle } from "./enterSettle";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface MedalBadgeProps {
  /** 中央に出す短い文字（例：「1」「★」）。既定は「★」。 */
  text?: string;
  theme?: CelebrateTheme;
  className?: string;
}

/** リボン付きのメダル。stamp より「授与された」感を強く出したい場面向け。 */
export function MedalBadge({ text = "★", theme = DEFAULT_CELEBRATE_THEME, className }: MedalBadgeProps) {
  return (
    <span
      data-medal-badge={text}
      className={clsx("celebrate-medal", "celebrate-enter-settle", className)}
      style={
        {
          "--celebrate-medal-color": theme.stampColor,
          "--celebrate-stamp-font": theme.stampFont,
          ...enterSettleStyle({ scaleFrom: 0.6, translateYFromRem: -0.6, durationMs: 400 }),
        } as CSSProperties
      }
    >
      {text}
    </span>
  );
}
