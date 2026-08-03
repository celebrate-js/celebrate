import type { CSSProperties } from "react";
import { clsx } from "./clsx";
import { enterSettleStyle } from "./enterSettle";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

// 印影スタンプ。「正」「合格」のような短い文字が、押されたように現れる。
// 枠の色・角丸・書体は theme から受け取る（意匠はアプリのもの・kanbun は朱色の落款）。
//
// 紙吹雪などを重ねたい場合は options.with（renderers.tsx の合成）を使う。
// このコンポーネント自身は単体の見た目にだけ責任を持つ。

/** 印影の大きさ。`md`＝結果パネルの脇／`lg`＝クリア画面の主役。 */
export type CelebrateSize = "md" | "lg";

export interface StampProps {
  /** 印影の文字（「正」「合格」など）。 */
  text: string;
  size?: CelebrateSize;
  theme?: CelebrateTheme;
  className?: string;
}

// 想定している文字数（「正」「合格」のような1〜2文字）。呼び出し側は自由文字列を
// 渡せるため、想定より長い文字列が来ても円の外にはみ出さないよう、文字数に応じて
// フォントサイズを縮める（2文字までは既存の見た目を変えない）。
const DESIGN_CHAR_COUNT = 2;
const MIN_FONT_SCALE = 0.45;

function stampFontSizeRem(text: string, baseRem: number): number {
  if (text.length <= DESIGN_CHAR_COUNT) return baseRem;
  const scale = Math.max(MIN_FONT_SCALE, Math.sqrt(DESIGN_CHAR_COUNT / text.length));
  return baseRem * scale;
}

const BASE_FONT_SIZE_REM: Record<CelebrateSize, number> = { md: 1.1, lg: 1.6 };

/** 印影スタンプ。 */
export function Stamp({
  text,
  size = "md",
  theme = DEFAULT_CELEBRATE_THEME,
  className,
}: StampProps) {
  const fontSizeRem = stampFontSizeRem(text, BASE_FONT_SIZE_REM[size]);
  return (
    <div
      // 正解演出が実際に出たことを e2e が機械的に確認するための目印（見た目には影響しない）。
      data-seal-stamp={text}
      className={clsx("celebrate-stamp", "celebrate-enter-settle", size === "lg" && "celebrate-stamp--lg", className)}
      style={
        {
          "--celebrate-stamp-color": theme.stampColor,
          "--celebrate-stamp-radius": theme.stampRadius,
          "--celebrate-stamp-font": theme.stampFont,
          ...enterSettleStyle({ scaleFrom: 1.7, rotateFromDeg: -14, rotateToDeg: -6, durationMs: 300 }),
        } as CSSProperties
      }
    >
      <span className="celebrate-stamp-text" style={{ fontSize: `${fontSizeRem}rem` }}>
        {text}
      </span>
    </div>
  );
}
