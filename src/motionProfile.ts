// MotionProfile：粒子1つの「時刻→状態」を返す純粋関数。
//
// これまでの sparkle.ts / cracker.ts / rain.ts / sakura.ts は、それぞれ独自に
// 「発火時に最終的な移動量を計算し、CSSのtranslateで2点間をtweenする」方式だった。
// 新しい軸（マスク・リビール、任意コンポーネント、経路移動…）が会話のたびに見つかったことから
// 分かる通り、「軸を全部先に洗い出してから閉じたenumで実装する」のは無理がある。
//
// 代わりに、MotionProfile を**関数の型**として定義する：名前付きプリセット
// （burst/ballistic/fall/...）はこの型を満たす普通の関数でしかなく、呼び出し側は
// レジストリにない独自の動きを、同じ型の関数を1個渡すだけで足せる。
// 「閉じたunionを拡張する」のではなく「型を満たす値を増やす」ので、コア側の変更が要らない。

export interface ParticleState {
  /** 原点からの相対位置（rem）。 */
  x: number;
  y: number;
  scale: number;
  opacity: number;
  /** 度（deg）。 */
  rotate: number;
}

/** 経過秒数とパラメータから、その瞬間の状態を返す。rAFで毎フレーム呼ばれる想定。 */
export type MotionProfile<P = unknown> = (elapsedSeconds: number, params: P) => ParticleState;

// ==== 名前付きプリセット（あくまで「型を満たす関数の一例」。他に何を足してもいい） ====

export interface RadialMotionParams {
  angleRad: number;
  /** rem/秒。 */
  speed: number;
  durationSeconds: number;
}

/** 等速直進・重力なし（sparkle/confetti/pop相当）。 */
export const radialMotion: MotionProfile<RadialMotionParams> = (t, p) => {
  const progress = Math.min(1, t / p.durationSeconds);
  return {
    x: Math.cos(p.angleRad) * p.speed * t,
    y: Math.sin(p.angleRad) * p.speed * t,
    scale: 1,
    opacity: 1 - progress,
    rotate: 0,
  };
};

export interface BallisticMotionParams {
  angleRad: number;
  speed: number;
  /** rem/秒²。正の値で下方向。 */
  gravity: number;
  durationSeconds: number;
}

/** 初速+重力の放物運動（cracker/firework相当）。閉じた式なので誤差が蓄積しない。 */
export const ballisticMotion: MotionProfile<BallisticMotionParams> = (t, p) => {
  const progress = Math.min(1, t / p.durationSeconds);
  const vx = Math.cos(p.angleRad) * p.speed;
  const vy = Math.sin(p.angleRad) * p.speed;
  return {
    x: vx * t,
    y: vy * t + 0.5 * p.gravity * t * t,
    scale: 1 - progress * 0.4,
    opacity: 1 - progress,
    rotate: progress * 180,
  };
};

export interface FallMotionParams {
  /** rem/秒。 */
  fallSpeed: number;
  startX?: number;
  swayAmplitude?: number;
  swayFrequency?: number;
  durationSeconds: number;
}

/** 重力のみ・横揺れ任意（rain/sakura相当）。 */
export const fallMotion: MotionProfile<FallMotionParams> = (t, p) => {
  const progress = Math.min(1, t / p.durationSeconds);
  const sway = (p.swayAmplitude ?? 0) * Math.sin(t * (p.swayFrequency ?? 2) * Math.PI);
  return {
    x: (p.startX ?? 0) + sway,
    y: p.fallSpeed * t,
    scale: 1,
    opacity: progress > 0.85 ? (1 - progress) / 0.15 : 1,
    rotate: progress * 90,
  };
};

export interface StaticScaleParams {
  scaleFrom: number;
  scaleTo: number;
  durationSeconds: number;
}

/** その場でscale+opacityのみ（pop/ripple/ring/flash相当）。 */
export const staticScaleMotion: MotionProfile<StaticScaleParams> = (t, p) => {
  const progress = Math.min(1, t / p.durationSeconds);
  return {
    x: 0,
    y: 0,
    scale: p.scaleFrom + (p.scaleTo - p.scaleFrom) * progress,
    opacity: 1 - progress,
    rotate: 0,
  };
};

export interface OrbitTwinkleParams {
  radius: number;
  /** ラジアン/秒。 */
  angularSpeed: number;
  startAngleRad: number;
  twinkleFrequency?: number;
}

/** その場で明滅しながら周回する（ミラーボール相当。bounded-repeatと組み合わせる）。 */
export const orbitTwinkleMotion: MotionProfile<OrbitTwinkleParams> = (t, p) => {
  const angle = p.startAngleRad + p.angularSpeed * t;
  const twinkle = 0.5 + 0.5 * Math.sin(t * (p.twinkleFrequency ?? 3) * Math.PI * 2);
  return {
    x: Math.cos(angle) * p.radius,
    y: Math.sin(angle) * p.radius,
    scale: 0.6 + twinkle * 0.4,
    opacity: twinkle,
    rotate: 0,
  };
};

/** 名前で引ける既定セット。呼び出し側はこれを使ってもいいし、同じ型の関数を自作してもいい。 */
export const MOTION_PROFILES = {
  radial: radialMotion,
  ballistic: ballisticMotion,
  fall: fallMotion,
  staticScale: staticScaleMotion,
  orbitTwinkle: orbitTwinkleMotion,
} as const;

export type MotionProfileName = keyof typeof MOTION_PROFILES;
