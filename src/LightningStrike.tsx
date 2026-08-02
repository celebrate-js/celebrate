import { useState } from "react";
import { clsx } from "./clsx";
import { createLightningPath, createSeededLightningRandom, type LightningPath } from "./lightning";
import { StrokePath } from "./StrokePath";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface LightningStrikeProps {
  theme?: CelebrateTheme;
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
}

/**
 * 画面の上端から下端まで貫く稲光（④環境・演出・全画面）。
 * `rain` と同じく実体コンテンツを持つため、CelebrateProvider が
 * 変換されていない画面全体の入れ物にそのまま描画する
 * （isFullScreenContent("lightning") が true）。
 * 経路の描き下ろし自体は StrokePath（軸D=stroke-reveal）に委ねる。
 */
export function LightningStrike({ theme = DEFAULT_CELEBRATE_THEME, className, seed }: LightningStrikeProps) {
  const [path] = useState<LightningPath>(() =>
    createLightningPath(seed === undefined ? Math.random : createSeededLightningRandom(seed))
  );

  return (
    <span aria-hidden="true" data-lightning-strike="" className={clsx("celebrate-lightning-strike", className)}>
      <StrokePath
        lines={[
          {
            points: path.branchPoints,
            strokeWidth: 2.2,
            dashLength: 60,
            color: theme.stampColor,
            opacity: 0.8,
            glow: "electric",
            durationMs: 150,
            delayMs: 100,
          },
          {
            points: path.points,
            strokeWidth: 4,
            dashLength: 200,
            color: theme.stampColor,
            glow: "electric",
            durationMs: 200,
          },
        ]}
      />
      <span className="celebrate-lightning-strike-flash" />
    </span>
  );
}
