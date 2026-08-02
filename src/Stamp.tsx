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

/** 印影スタンプ。 */
export function Stamp({
  text,
  size = "md",
  theme = DEFAULT_CELEBRATE_THEME,
  className,
}: StampProps) {
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
      <span className={clsx("celebrate-stamp-text", size === "lg" && "celebrate-stamp-text--lg")}>
        {text}
      </span>
    </div>
  );
}
