import type { CSSProperties } from "react";
import { clsx } from "./clsx";
import { enterSettleStyle } from "./enterSettle";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

// 自己ベスト更新の全画面イベント（`record` variant の中身）。
//
// 「印影が押されて居座る」stamp と違い、こちらは画面の中央に一瞬だけ被さって消える
// ワンショット専用の演出（useCelebrate() から出す）。記録の更新という
// 「ふだんの正解より一段上の出来事」を、面の大きさと色で他と区別する。
//
// 紙吹雪を重ねたい場合は options.with（renderers.tsx の合成）を使う。
// 以前はここで無条件に ConfettiBurst を描いていたが、それだと「record だけ強制」
// という非対称なルールになるため、他の variant と同じく呼び出し側の選択に揃えた。

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
      className={clsx("celebrate-record-banner", "celebrate-enter-settle", className)}
      style={
        {
          "--celebrate-record-color": theme.recordColor ?? theme.stampColor,
          "--celebrate-record-bg": theme.recordBackground ?? "transparent",
          "--celebrate-stamp-radius": theme.stampRadius,
          "--celebrate-stamp-font": theme.stampFont,
          ...enterSettleStyle({ scaleFrom: 0.6, easing: "overshoot", durationMs: 350 }),
        } as CSSProperties
      }
    >
      <span className="celebrate-record-banner-text">{text}</span>
      {note && <span className="celebrate-record-banner-note">{note}</span>}
    </div>
  );
}
