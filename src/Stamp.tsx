import type { CSSProperties } from "react";
import { clsx } from "@tools/ui";
import { ConfettiBurst } from "./ConfettiBurst";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

// 印影スタンプ。「正」「合格」のような短い文字が、押されたように現れる。
// 枠の色・角丸・書体は theme から受け取る（意匠はアプリのもの・kanbun は朱色の落款）。

/** 印影の大きさ。`md`＝結果パネルの脇／`lg`＝クリア画面の主役。 */
export type CelebrateSize = "md" | "lg";

export interface StampProps {
  /** 印影の文字（「正」「合格」など）。 */
  text: string;
  size?: CelebrateSize;
  /** 紙吹雪を重ねる。 */
  confetti?: boolean;
  theme?: CelebrateTheme;
  className?: string;
}

/** 印影スタンプ（＋任意で紙吹雪）。 */
export function Stamp({
  text,
  size = "md",
  confetti,
  theme = DEFAULT_CELEBRATE_THEME,
  className,
}: StampProps) {
  return (
    <div
      // 正解演出が実際に出たことを e2e が機械的に確認するための目印（見た目には影響しない）。
      data-seal-stamp={text}
      className={clsx(
        "relative flex-none flex items-center justify-center",
        "border-[0.19rem] border-[var(--celebrate-stamp-color)] text-[var(--celebrate-stamp-color)]",
        "rounded-[var(--celebrate-stamp-radius)] -rotate-6",
        "animate-[celebrate-stamp-in_0.3s_ease]",
        size === "lg" ? "w-[4.75rem] h-[4.75rem]" : "w-12 h-12",
        className
      )}
      style={
        {
          "--celebrate-stamp-color": theme.stampColor,
          "--celebrate-stamp-radius": theme.stampRadius,
          "--celebrate-stamp-font": theme.stampFont,
        } as CSSProperties
      }
    >
      <span
        className={clsx(
          "font-[family-name:var(--celebrate-stamp-font)] font-bold leading-none",
          size === "lg" ? "text-[1.6rem]" : "text-[1.1rem]"
        )}
      >
        {text}
      </span>
      {confetti && <ConfettiBurst theme={theme} />}
    </div>
  );
}
