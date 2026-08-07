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
export function withOriginOffset(
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
export function withFlicker(motion: MotionProfile<BallisticMotionParams>): MotionProfile<BallisticMotionParams> {
  return (t, p) => {
    const state = motion(t, p);
    return { ...state, opacity: state.opacity * (0.55 + 0.45 * Math.sin(t * 45)) };
  };
}

// 菊（kiku）：外向きの線の尾で描くため、ballisticMotion既定の「飛びながら回転する」演出（rotate）を
// 打ち消す（線が回転すると尾の向きが角度からずれて見た目が崩れるため）。
export function withoutSpin(motion: MotionProfile<BallisticMotionParams>): MotionProfile<BallisticMotionParams> {
  return (t, p) => ({ ...motion(t, p), rotate: 0 });
}

// 柳（willow）：粒を点ではなく線として描き（particleRender参照）、その線の向きを
// 「その瞬間の速度ベクトル」に毎フレーム合わせる。重力で下向きの速度成分が増えるにつれ
// 線が自然に下を向いていくため、静止画のシルエットではなく「垂れ下がっていく尾」に見える
// （angleRad固定の向きだと、実際は弧を描いて落ちているのに線の向きだけ直線的で不自然になる）。
export function withVelocityAlignedRotation(
  motion: MotionProfile<BallisticMotionParams>
): MotionProfile<BallisticMotionParams> {
  return (t, params) => {
    const state = motion(t, params);
    const vx = Math.cos(params.angleRad) * params.speed;
    const vy = Math.sin(params.angleRad) * params.speed + params.gravity * t;
    return { ...state, rotate: (Math.atan2(vy, vx) * 180) / Math.PI };
  };
}

// 型物・星形（star）：広がりきったところで動きを止め、星のシルエットのまま少し留まってから
// 消える（他のstyleと同じ「広がりながら線形にフェード」だと、輪郭が崩れきる前に薄くなって
// 星形と分かりづらい）。位置の計算に使う経過時間をfreezeProgress以降で頭打ちにして広がりを止め、
// opacityはholdProgressまで1のまま、そこから最後に向けてフェードする。rotateも0で固定する
// （中心から各頂点へ伸びる線として描く前提のため、kikuのwithoutSpinと同じ理由）。
export function withHoldThenFade(
  motion: MotionProfile<BallisticMotionParams>,
  freezeProgress = 0.4,
  holdProgress = 0.6
): MotionProfile<BallisticMotionParams> {
  return (t, params) => {
    const progress = Math.min(1, t / params.durationSeconds);
    const positionT = Math.min(t, params.durationSeconds * freezeProgress);
    const state = motion(positionT, params);
    const opacity = progress < holdProgress ? 1 : 1 - (progress - holdProgress) / (1 - holdProgress);
    return { ...state, opacity, rotate: 0 };
  };
}

function resolveMotion(style: FireworkStyle, particle: FireworkParticle): MotionProfile<BallisticMotionParams> {
  if (style === "senrin")
    return withOriginOffset(ballisticMotion, particle.originOffsetXRem ?? 0, particle.originOffsetYRem ?? 0);
  if (style === "hachi") return withFlicker(ballisticMotion);
  if (style === "kiku") return withoutSpin(ballisticMotion);
  if (style === "willow") return withVelocityAlignedRotation(ballisticMotion);
  if (style === "star") return withHoldThenFade(ballisticMotion);
  return ballisticMotion;
}

function particleRender(style: FireworkStyle, particle: FireworkParticle, color: string) {
  if (style === "kiku") {
    // 点ではなく、粒が飛ぶ方向（外向きの角度）に沿った細い線として描く。
    // rotateはFireworkBurst側でwithoutSpinにより常に0固定なので、ここで直接向きを決める。
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
  if (style === "willow") {
    // 柳：粒の代わりに線を描く。この要素自体には向きを持たせず（transformを何も指定しない）、
    // withVelocityAlignedRotationが親（ParticleFieldのwrapper）にセットする速度ベクトル由来の
    // rotateにそのまま従わせる（angle=0＝ローカルの+x方向を向く前提で、線を横向きに描く）。
    return (
      <span
        data-firework-particle-streak=""
        className="celebrate-firework-particle celebrate-firework-particle--streak"
        style={{ width: `${particle.size * 3.6}rem`, height: "0.075rem", background: color } as CSSProperties}
      />
    );
  }
  if (style === "star") {
    // 型物・星形：点を散らすだけだと頂点と谷の差が分かりにくいため、kikuと同じ「外向きの線」
    // として描く。ただし長さをparticle.speed（＝到達距離。starRadiusMultiplierにより
    // 頂点で長く・谷で短くなっている）に比例させることで、線の長さの違いそのもので
    // 星の輪郭（長い槍・短い谷の交互）が見えるようにする。
    const rotateDeg = (particle.angleRad * 180) / Math.PI + 90;
    const spokeLengthRem = particle.speed * particle.durationSeconds;
    return (
      <span
        data-firework-particle-streak=""
        className="celebrate-firework-particle celebrate-firework-particle--streak"
        style={
          {
            width: "0.07rem",
            height: `${spokeLengthRem}rem`,
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
