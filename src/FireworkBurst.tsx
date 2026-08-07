import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import {
  createFireworkShells,
  createSeededFireworkRandom,
  type FireworkShell,
  type FireworkStyle,
  type FireworkParticle,
} from "./firework";
import { ParticleField, type ParticleSpec } from "./ParticleField";
import { ballisticMotion, type BallisticMotionParams, type MotionProfile } from "./motionProfile";
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

// 千輪（senrin）：粒ごとの小爆発中心のオフセットを、弾道計算の結果にそのまま足し込む。
function withOriginOffset(
  motion: MotionProfile<BallisticMotionParams>,
  offsetXRem: number,
  offsetYRem: number
): MotionProfile<BallisticMotionParams> {
  return (t, p) => {
    const state = motion(t, p);
    return { ...state, x: state.x + offsetXRem, y: state.y + offsetYRem };
  };
}

// 蜂（hachi）：飛んでいる間ずっとopacityにsin波の明滅を掛け合わせ、チカチカさせる。
function withFlicker(motion: MotionProfile<BallisticMotionParams>): MotionProfile<BallisticMotionParams> {
  return (t, p) => {
    const state = motion(t, p);
    return { ...state, opacity: state.opacity * (0.55 + 0.45 * Math.sin(t * 45)) };
  };
}

// 菊（kiku）：外向きの線の尾で描くため、ballisticMotion既定の「飛びながら回転する」演出（rotate）を
// 打ち消す（線が回転すると尾の向きが角度からずれて見た目が崩れるため）。
function withoutSpin(motion: MotionProfile<BallisticMotionParams>): MotionProfile<BallisticMotionParams> {
  return (t, p) => ({ ...motion(t, p), rotate: 0 });
}

function resolveMotion(style: FireworkStyle, particle: FireworkParticle): MotionProfile<BallisticMotionParams> {
  if (style === "senrin")
    return withOriginOffset(ballisticMotion, particle.originOffsetXRem ?? 0, particle.originOffsetYRem ?? 0);
  if (style === "hachi") return withFlicker(ballisticMotion);
  if (style === "kiku") return withoutSpin(ballisticMotion);
  return ballisticMotion;
}

function particleRender(style: FireworkStyle, particle: FireworkParticle, color: string) {
  if (style === "kiku") {
    // 点ではなく、粒が飛ぶ方向（外向きの角度）に沿った細い線として描く。
    const rotateDeg = (particle.angleRad * 180) / Math.PI + 90;
    return (
      <span
        data-firework-particle-streak=""
        className="celebrate-firework-particle celebrate-firework-particle--streak"
        style={
          {
            width: "0.09rem",
            height: `${particle.size * 3.2}rem`,
            background: color,
            transform: `rotate(${rotateDeg}deg)`,
          } as CSSProperties
        }
      />
    );
  }
  return (
    <span
      className="celebrate-firework-particle"
      style={{ width: `${particle.size}rem`, height: `${particle.size}rem`, background: color } as CSSProperties}
    />
  );
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
              motion: resolveMotion(style, particle),
              params: {
                angleRad: particle.angleRad,
                speed: particle.speed,
                gravity: particle.gravity,
                durationSeconds: particle.durationSeconds,
              },
              durationSeconds: particle.durationSeconds,
              delaySeconds: particle.delaySeconds,
              render: particleRender(style, particle, palette[particle.tone % palette.length]!),
            }))}
          />
        </span>
      ))}
    </span>
  );
}
