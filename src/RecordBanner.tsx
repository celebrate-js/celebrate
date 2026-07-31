import type { CSSProperties } from "react";
import { clsx } from "@tools/ui";
import { ConfettiBurst } from "./ConfettiBurst";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

// 自己ベスト更新の全画面イベント（`record` variant の中身）。
//
// 「印影が押されて居座る」stamp と違い、こちらは画面の中央に一瞬だけ被さって消える
// ワンショット専用の演出（useCelebrate() から出す）。記録の更新という
// 「ふだんの正解より一段上の出来事」を、面の大きさと色で他と区別する。

export interface RecordBannerProps {
  /** 大きく出す言葉（例：「新記録」）。 */
  text: string;
  /** その下に添える一言（例：「れんぞく 7問」）。 */
  note?: string;
  theme?: CelebrateTheme;
  className?: string;
}

/** 自己ベスト更新を祝う帯（＋紙吹雪）。 */
export function RecordBanner({
  text,
  note,
  theme = DEFAULT_CELEBRATE_THEME,
  className,
}: RecordBannerProps) {
  return (
    <div
      // 演出が実際に出たことを e2e が機械的に確認するための目印（見た目には影響しない）。
      data-record-banner={text}
      className={clsx(
        "relative flex flex-col items-center gap-1 px-8 py-4",
        "border-[0.19rem] border-[var(--celebrate-record-color)] text-[var(--celebrate-record-color)]",
        "rounded-[var(--celebrate-stamp-radius)] bg-[var(--celebrate-record-bg)]",
        "animate-[celebrate-record-in_0.35s_ease-out]",
        className
      )}
      style={
        {
          "--celebrate-record-color": theme.recordColor ?? theme.stampColor,
          "--celebrate-record-bg": theme.recordBackground ?? "transparent",
          "--celebrate-stamp-radius": theme.stampRadius,
          "--celebrate-stamp-font": theme.stampFont,
        } as CSSProperties
      }
    >
      <span className="font-[family-name:var(--celebrate-stamp-font)] text-[1.9rem] font-bold leading-none tracking-[0.18em]">
        {text}
      </span>
      {note && (
        <span className="font-[family-name:var(--celebrate-stamp-font)] text-fs-sm font-bold leading-none">
          {note}
        </span>
      )}
      <ConfettiBurst theme={theme} />
    </div>
  );
}
