import type { CSSProperties } from "react";
import { clsx } from "./clsx";
import { CONFETTI_PIECES, CONFETTI_DURATION_SECONDS, type ConfettiPiece } from "./pieces";
import { ParticleField, type ParticleSpec } from "./ParticleField";
import { radialMotion, type RadialMotionParams } from "./motionProfile";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

// 紙吹雪。親要素の中心から粒が散る一度きりの演出。
// 位置の基準は親（`position: relative` な要素）なので、単体でも印影の上に重ねても使える。
// 実体は ParticleField + radialMotion（Tier3の構造テンプレート）のプリセット。

export interface ConfettiBurstProps {
  theme?: CelebrateTheme;
  className?: string;
}

function toParticleSpec(piece: ConfettiPiece, index: number, theme: CelebrateTheme): ParticleSpec<RadialMotionParams> {
  return {
    motion: radialMotion,
    params: { angleRad: piece.angleRad, speed: piece.speed, durationSeconds: CONFETTI_DURATION_SECONDS },
    durationSeconds: CONFETTI_DURATION_SECONDS,
    delaySeconds: piece.delaySeconds,
    render: (
      <span
        key={index}
        // 演出が実際に出たことを e2e が機械的に数えるための目印（見た目には影響しない）。
        data-confetti-piece=""
        className={clsx("celebrate-confetti-piece", piece.round && "celebrate-confetti-piece--round")}
        style={
          {
            width: `${piece.size}rem`,
            height: `${piece.size}rem`,
            background: theme.confettiColors[piece.tone],
            borderRadius: piece.round ? "999px" : theme.pieceRadius,
            transform: `rotate(${piece.rotateDeg}deg)`,
          } as CSSProperties
        }
      />
    ),
  };
}

/** 中心から粒が散る紙吹雪（ワンショット）。 */
export function ConfettiBurst({ theme = DEFAULT_CELEBRATE_THEME, className }: ConfettiBurstProps) {
  return (
    <span aria-hidden="true" className={clsx("celebrate-confetti-burst", className)}>
      <ParticleField particles={CONFETTI_PIECES.map((piece, i) => toParticleSpec(piece, i, theme))} />
    </span>
  );
}
