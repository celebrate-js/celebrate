import { createSeededRandom, type RandomFn } from "./random";

export const SPARKLE_PARTICLE_COUNT = 32;
export const SPARKLE_DURATION_MS = 1300;

export type SparkleTone = 0 | 1 | 2 | 3;

/** 1粒分のパラメータ。動き自体は`motionProfile.ts`の`radialMotion`に渡す（Tier3エンジンのプリセット）。 */
export interface SparkleParticle {
  id: number;
  /** ラジアン。放射状に飛ぶ方向。 */
  angleRad: number;
  /** rem/秒。 */
  speed: number;
  /** rem。 */
  size: number;
  /** 度。粒自体の固定的な向き（動きの回転とは別。見た目の変化）。 */
  rotateDeg: number;
  /** 秒。発火からの遅延。 */
  delaySeconds: number;
  tone: SparkleTone;
  shape: "diamond" | "dot";
}

export type SparkleRandom = RandomFn;

/** テストや再現可能なデモで使う決定的な乱数。 */
export const createSeededSparkleRandom = createSeededRandom;

/**
 * 発火ごとのキラキラ粒子を生成する純関数。
 * Math.random は既定値にだけ置き、テストでは random を注入する。
 */
export function createSparkleParticles(
  random: SparkleRandom = Math.random
): readonly SparkleParticle[] {
  const durationSeconds = SPARKLE_DURATION_MS / 1000;
  return Array.from({ length: SPARKLE_PARTICLE_COUNT }, (_, id) => {
    const angleRad = (Math.PI * 2 * id) / SPARKLE_PARTICLE_COUNT + (random() - 0.5) * 0.2;
    const distance = 2.8 + random() * 3.2;
    const size = 0.22 + random() * 0.3;
    return {
      id,
      angleRad,
      speed: distance / durationSeconds,
      size,
      rotateDeg: Math.round(random() * 240 - 120),
      delaySeconds: random() * 0.09,
      tone: Math.floor(random() * 4) as SparkleTone,
      shape: random() < 0.72 ? "diamond" : "dot",
    };
  });
}
