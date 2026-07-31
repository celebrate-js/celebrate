import { useState, type CSSProperties } from "react";
import { clsx } from "@tools/ui";
import {
  createSeededSparkleRandom,
  createSparkleParticles,
  type SparkleParticle,
} from "./sparkle";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface SparkleBurstProps {
  theme?: CelebrateTheme;
  className?: string;
  /** 再現可能なテスト・デモ用。省略時は発火ごとに新しい散り方になる。 */
  seed?: number;
}

export function SparkleBurst({
  theme = DEFAULT_CELEBRATE_THEME,
  className,
  seed,
}: SparkleBurstProps) {
  const [particles] = useState<readonly SparkleParticle[]>(() =>
    createSparkleParticles(
      seed === undefined ? Math.random : createSeededSparkleRandom(seed)
    )
  );

  return (
    <span
      aria-hidden="true"
      data-sparkle-burst=""
      className={clsx(
        "celebrate-sparkle-burst relative block w-0 h-0 pointer-events-none",
        className
      )}
    >
      <span
        data-sparkle-flash=""
        className="celebrate-sparkle-flash absolute top-1/2 left-1/2 rounded-full border-2 border-[var(--celebrate-sparkle-color)]"
        style={
          {
            "--celebrate-sparkle-color": theme.stampColor,
          } as CSSProperties
        }
      />
      {particles.map((particle) => (
        <span
          key={particle.id}
          data-sparkle-particle=""
          className={clsx(
            "celebrate-sparkle-particle absolute top-1/2 left-1/2",
            "w-[var(--celebrate-sparkle-size)] h-[var(--celebrate-sparkle-size)]",
            "bg-[var(--celebrate-sparkle-particle-color)]",
            particle.shape === "dot" ? "rounded-full" : "rounded-[var(--celebrate-piece-radius)]"
          )}
          style={
            {
              "--celebrate-sparkle-x": particle.x,
              "--celebrate-sparkle-y": particle.y,
              "--celebrate-sparkle-size": particle.size,
              "--celebrate-sparkle-rotate": particle.rotate,
              "--celebrate-sparkle-particle-color": theme.confettiColors[particle.tone],
              "--celebrate-piece-radius": theme.pieceRadius,
              animationDelay: particle.delay,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
