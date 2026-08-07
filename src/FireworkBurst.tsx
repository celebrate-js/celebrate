import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import { createFireworkShells, createSeededFireworkRandom, type FireworkShell, type FireworkStyle } from "./firework";
import { ParticleField, type ParticleSpec } from "./ParticleField";
import { ballisticMotion, type BallisticMotionParams } from "./motionProfile";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

export interface FireworkBurstProps {
  theme?: CelebrateTheme;
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
  /** 花火の種類。既定 "peony"（丸く均等に広がる定番）。 */
  style?: FireworkStyle;
  /** 大きさの倍率。既定1。 */
  scale?: number;
  /** 色パレットを上書きする（省略時は theme.confettiColors）。 */
  colors?: readonly string[];
}

/**
 * 複数の破裂点が時間差で咲く花火（③報酬・大当たり感）。
 * shellごとに1つの`ParticleField`（+ballisticMotion）を、shellの破裂位置へ
 * ラッパーでオフセットして配置する（構造は`RadialBurst`の`layers`と同じ
 * 「入れ子＝複数インスタンスの時間差重ね合わせ」）。
 *
 *   <FireworkBurst style="willow" scale={1.6} colors={["#ffd166", "#06d6a0"]} />
 */
export function FireworkBurst({
  theme = DEFAULT_CELEBRATE_THEME,
  className,
  seed,
  style = "peony",
  scale = 1,
  colors,
}: FireworkBurstProps) {
  const [shells] = useState<readonly FireworkShell[]>(() =>
    createFireworkShells(seed === undefined ? Math.random : createSeededFireworkRandom(seed), style, scale)
  );
  const palette = colors ?? theme.confettiColors;

  return (
    <span aria-hidden="true" data-firework-burst={style} className={clsx("celebrate-firework", className)}>
      {shells.map((shell) => (
        <span
          key={shell.id}
          data-firework-shell=""
          className="celebrate-firework-shell"
          style={
            {
              transform: `translate(calc(-50% + ${shell.offsetXRem}rem), calc(-50% + ${shell.offsetYRem}rem))`,
            } as CSSProperties
          }
        >
          <span
            className="celebrate-firework-flash"
            style={{ animationDelay: `${shell.delaySeconds}s` } as CSSProperties}
          />
          <ParticleField
            particles={shell.particles.map((particle): ParticleSpec<BallisticMotionParams> => ({
              motion: ballisticMotion,
              params: {
                angleRad: particle.angleRad,
                speed: particle.speed,
                gravity: particle.gravity,
                durationSeconds: particle.durationSeconds,
              },
              durationSeconds: particle.durationSeconds,
              delaySeconds: particle.delaySeconds,
              render: (
                <span
                  className="celebrate-firework-particle"
                  style={
                    {
                      width: `${particle.size}rem`,
                      height: `${particle.size}rem`,
                      background: palette[particle.tone % palette.length],
                    } as CSSProperties
                  }
                />
              ),
            }))}
          />
        </span>
      ))}
    </span>
  );
}
