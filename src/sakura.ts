import { createSeededRandom, type RandomFn } from "./random";

// 桜吹雪の花びら。confetti（中心から爆散）と違い、上から下へゆっくり舞い落ちる
// 一度きりの演出。実体は ParticleField + fallMotion（Tier3の構造テンプレート）。
// 花びらの形（長円を斜めに切った形）は固定のCSS（`.celebrate-sakura-petal`）で表現する。

export interface SakuraPetal {
  id: number;
  /** 開始位置（横方向、中心からの相対、rem）。 */
  startX: number;
  /** 落下中の横揺れ幅（rem）。 */
  swayAmplitude: number;
  /** rem/秒。 */
  fallSpeed: number;
  /** rem。 */
  size: number;
  delaySeconds: number;
  durationSeconds: number;
}

export const SAKURA_PETAL_COUNT = 14;
export const SAKURA_DURATION_MS = 2000;

/** 舞い落ちる花びらを生成する純関数。 */
export function createSakuraPetals(random: RandomFn = Math.random): readonly SakuraPetal[] {
  return Array.from({ length: SAKURA_PETAL_COUNT }, (_, id) => {
    const durationSeconds = 1.3 + random() * 0.7;
    const fallY = 5.5 + random() * 2.5;
    return {
      id,
      startX: (random() - 0.5) * 6.5,
      swayAmplitude: (random() - 0.5) * 3.5,
      fallSpeed: fallY / durationSeconds,
      size: 0.55 + random() * 0.3,
      delaySeconds: random() * 0.6,
      durationSeconds,
    };
  });
}

export { createSeededRandom as createSeededSakuraRandom };
