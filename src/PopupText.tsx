import type { CSSProperties } from "react";
import { clsx } from "./clsx";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface PopupTextProps {
  /** 浮かせる文字（例：「+1」）。 */
  text: string;
  theme?: CelebrateTheme;
  className?: string;
}

/** 「+1」のような短い文字が上へ浮かびながら消える（テキストチャネル）。 */
export function PopupText({ text, theme = DEFAULT_CELEBRATE_THEME, className }: PopupTextProps) {
  return (
    <span
      data-popup-text={text}
      className={clsx("celebrate-popup-text", className)}
      style={
        {
          "--celebrate-popup-color": theme.stampColor,
          "--celebrate-stamp-font": theme.stampFont,
        } as CSSProperties
      }
    >
      {text}
    </span>
  );
}
