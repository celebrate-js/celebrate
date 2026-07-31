export const SPARKLE_PARTICLE_COUNT = 32;
export const SPARKLE_DURATION_MS = 1300;

export type SparkleTone = 0 | 1 | 2 | 3;

export interface SparkleParticle {
  id: number;
  x: string;
  y: string;
  size: string;
  rotate: string;
  delay: string;
  tone: SparkleTone;
  shape: "diamond" | "dot";
}

export type SparkleRandom = () => number;

/** テストや再現可能なデモで使う決定的な乱数。 */
export function createSeededSparkleRandom(seed: number): SparkleRandom {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/**
 * 発火ごとのキラキラ粒子を生成する純関数。
 * Math.random は既定値にだけ置き、テストでは random を注入する。
 */
export function createSparkleParticles(
  random: SparkleRandom = Math.random
): readonly SparkleParticle[] {
  return Array.from({ length: SPARKLE_PARTICLE_COUNT }, (_, id) => {
    const angle = (Math.PI * 2 * id) / SPARKLE_PARTICLE_COUNT + (random() - 0.5) * 0.2;
    const distance = 2.8 + random() * 3.2;
    const size = 0.22 + random() * 0.3;
    return {
      id,
      x: `${(Math.cos(angle) * distance).toFixed(3)}rem`,
      y: `${(Math.sin(angle) * distance).toFixed(3)}rem`,
      size: `${size.toFixed(3)}rem`,
      rotate: `${Math.round(random() * 240 - 120)}deg`,
      delay: `${(random() * 0.09).toFixed(3)}s`,
      tone: Math.floor(random() * 4) as SparkleTone,
      shape: random() < 0.72 ? "diamond" : "dot",
    };
  });
}
