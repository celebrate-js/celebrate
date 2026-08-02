import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import {
  createSeededSparkleRandom,
  createSparkleParticles,
  SPARKLE_DURATION_MS,
  type SparkleParticle,
} from "./sparkle";
import { ParticleField, type ParticleSpec } from "./ParticleField";
import { radialMotion, type RadialMotionParams } from "./motionProfile";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface SparkleBurstProps {
  theme?: CelebrateTheme;
  className?: string;
  /** 再現可能なテスト・デモ用。省略時は発火ごとに新しい散り方になる。 */
  seed?: number;
}

function toParticleSpec(particle: SparkleParticle, theme: CelebrateTheme): ParticleSpec<RadialMotionParams> {
  const durationSeconds = SPARKLE_DURATION_MS / 1000;
  return {
    motion: radialMotion,
    params: { angleRad: particle.angleRad, speed: particle.speed, durationSeconds },
    durationSeconds,
    delaySeconds: particle.delaySeconds,
    render: (
      <span
        data-sparkle-particle=""
        className={clsx("celebrate-sparkle-particle", particle.shape === "dot" && "celebrate-sparkle-particle--dot")}
        style={
          {
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
            background: theme.confettiColors[particle.tone],
            borderRadius: particle.shape === "dot" ? "999px" : theme.pieceRadius,
            transform: `rotate(${particle.rotateDeg}deg)`,
          } as CSSProperties
        }
      />
    ),
  };
}

/** `confetti`/`cracker`/`rain`/`firework`/`sakura`と同じく、実体は`ParticleField`にプリセットを渡しているだけ。 */
export function SparkleBurst({ theme = DEFAULT_CELEBRATE_THEME, className, seed }: SparkleBurstProps) {
  const [particles] = useState<readonly SparkleParticle[]>(() =>
    createSparkleParticles(seed === undefined ? Math.random : createSeededSparkleRandom(seed))
  );

  return (
    <span aria-hidden="true" data-sparkle-burst="" className={clsx("celebrate-sparkle-burst", className)}>
      <span
        data-sparkle-flash=""
        className="celebrate-sparkle-flash"
        style={{ "--celebrate-sparkle-color": theme.stampColor } as CSSProperties}
      />
      <ParticleField particles={particles.map((p) => toParticleSpec(p, theme))} />
    </span>
  );
}
