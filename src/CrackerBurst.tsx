import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import { createCrackerStreamers, createSeededCrackerRandom, CRACKER_DURATION_MS, type CrackerStreamer } from "./cracker";
import { ParticleField, type ParticleSpec } from "./ParticleField";
import { radialMotion, type RadialMotionParams } from "./motionProfile";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface CrackerBurstProps {
  theme?: CelebrateTheme;
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
  /** 色パレットを上書きする（省略時は theme.confettiColors）。firework等と同じ形。 */
  colors?: readonly string[];
}

function toParticleSpec(streamer: CrackerStreamer, palette: readonly string[]): ParticleSpec<RadialMotionParams> {
  const durationSeconds = CRACKER_DURATION_MS / 1000;
  return {
    motion: radialMotion,
    params: { angleRad: streamer.angleRad, speed: streamer.speed, durationSeconds },
    durationSeconds,
    delaySeconds: streamer.delaySeconds,
    render: (
      <span
        data-cracker-streamer=""
        className="celebrate-cracker-streamer"
        style={
          {
            width: "0.18rem",
            height: `${streamer.length}rem`,
            background: palette[streamer.tone % palette.length],
            borderRadius: "999px",
            transform: `rotate(${streamer.rotateDeg + streamer.curlDeg}deg)`,
          } as CSSProperties
        }
      />
    ),
  };
}

/** クラッカー（パーティーポッパー）。斜め上へ紙テープが勢いよく飛ぶワンショット。 */
export function CrackerBurst({ theme = DEFAULT_CELEBRATE_THEME, className, seed, colors }: CrackerBurstProps) {
  const [streamers] = useState<readonly CrackerStreamer[]>(() =>
    createCrackerStreamers(seed === undefined ? Math.random : createSeededCrackerRandom(seed))
  );
  const palette = colors ?? theme.confettiColors;

  return (
    <span aria-hidden="true" data-cracker-burst="" className={clsx("celebrate-cracker-burst", className)}>
      <ParticleField particles={streamers.map((s) => toParticleSpec(s, palette))} />
    </span>
  );
}
