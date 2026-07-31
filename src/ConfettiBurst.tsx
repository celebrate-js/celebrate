import type { CSSProperties } from "react";
import { clsx } from "@tools/ui";
import { CONFETTI_PIECES } from "./pieces";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

// 紙吹雪。親要素の中心から粒が散る一度きりの演出。
// 位置の基準は親（`position: relative` な要素）なので、単体でも印影の上に重ねても使える。

export interface ConfettiBurstProps {
  theme?: CelebrateTheme;
  className?: string;
}

/** 中心から粒が散る紙吹雪（ワンショット）。 */
export function ConfettiBurst({ theme = DEFAULT_CELEBRATE_THEME, className }: ConfettiBurstProps) {
  return (
    <span aria-hidden="true" className={clsx("absolute inset-0 pointer-events-none", className)}>
      {CONFETTI_PIECES.map((piece) => (
        <span
          key={piece.delay + piece.x}
          // 演出が実際に出たことを e2e が機械的に数えるための目印（見た目には影響しない）。
          data-confetti-piece=""
          className={clsx(
            "absolute top-1/2 left-1/2",
            "w-[var(--celebrate-piece-size)] h-[var(--celebrate-piece-size)]",
            "animate-[celebrate-confetti-burst_0.7s_ease-out_forwards]",
            "bg-[var(--celebrate-piece-color)]",
            piece.round ? "rounded-full" : "rounded-[var(--celebrate-piece-radius)]"
          )}
          style={
            {
              "--celebrate-cx": piece.x,
              "--celebrate-cy": piece.y,
              "--celebrate-cr": piece.rotate,
              "--celebrate-piece-size": piece.size,
              "--celebrate-piece-color": theme.confettiColors[piece.tone],
              "--celebrate-piece-radius": theme.pieceRadius,
              animationDelay: piece.delay,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
