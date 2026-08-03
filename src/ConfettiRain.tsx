import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import { createRainPieces, createSeededRainRandom, type RainPiece } from "./rain";
import { ParticleField } from "./ParticleField";
import { fallMotion } from "./motionProfile";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface ConfettiRainProps {
  theme?: CelebrateTheme;
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
  /** 色パレットを上書きする（省略時は theme.confettiColors）。firework等と同じ形。 */
  colors?: readonly string[];
}

/**
 * 画面全体に紙吹雪が降る（④環境・演出フィードバック・全画面）。
 * `confetti` と違い1点から爆散するのではなく、画面幅いっぱいに降り注ぐ。
 * 実体は ParticleField + fallMotion（Tier3の構造テンプレート）のプリセット。
 * 横位置（vw）は画面幅に対する絶対位置のため、粒1つにつき1つの`ParticleField`を
 * 対応するvw位置のラッパーで包む（縦の落下・横揺れ・フェードはfallMotionが担う）。
 * `CelebrateProvider` が変換されていない overlay-root 直下に描画する（他の
 * variant のような中心寄せの transform を持たない）。
 */
export function ConfettiRain({ theme = DEFAULT_CELEBRATE_THEME, className, seed, colors }: ConfettiRainProps) {
  const [pieces] = useState<readonly RainPiece[]>(() =>
    createRainPieces(seed === undefined ? Math.random : createSeededRainRandom(seed))
  );
  const palette = colors ?? theme.confettiColors;

  return (
    <span aria-hidden="true" data-confetti-rain="" className={clsx("celebrate-rain", className)}>
      {pieces.map((piece) => (
        <span key={piece.id} className="celebrate-rain-drop" style={{ left: `${piece.leftVw}vw` } as CSSProperties}>
          <ParticleField
            particles={[
              {
                motion: fallMotion,
                params: { fallSpeed: piece.fallSpeed, durationSeconds: piece.durationSeconds },
                durationSeconds: piece.durationSeconds,
                delaySeconds: piece.delaySeconds,
                render: (
                  <span
                    data-rain-piece=""
                    className="celebrate-rain-piece"
                    style={
                      {
                        width: `${piece.size}rem`,
                        height: `${piece.size}rem`,
                        background: palette[piece.tone % palette.length],
                        transform: `rotate(${piece.rotateDeg}deg)`,
                      } as CSSProperties
                    }
                  />
                ),
              },
            ]}
          />
        </span>
      ))}
    </span>
  );
}
