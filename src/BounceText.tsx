import type { CSSProperties } from "react";
import { clsx } from "./clsx";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

// ②達成：正解・完了を示す短い一言（"Nice!" 等）を、その場でバウンドさせて見せる。

export interface BounceTextProps {
  text: string;
  theme?: CelebrateTheme;
  className?: string;
}

/** 文字がバウンドしながら一度だけ弾んで定位置に収まる（animate.css の tada 相当）。 */
export function BounceText({ text, theme = DEFAULT_CELEBRATE_THEME, className }: BounceTextProps) {
  return (
    <span
      data-bounce-text={text}
      className={clsx("celebrate-bounce-text", className)}
      style={
        {
          "--celebrate-bounce-color": theme.stampColor,
          "--celebrate-stamp-font": theme.stampFont,
        } as CSSProperties
      }
    >
      {text}
    </span>
  );
}
