import { createSeededRandom, type RandomFn } from "./random";

// 画面全体に降る紙吹雪（confetti の「中心から爆散」と違い、上から画面幅いっぱいに降る）。
// 実体は ParticleField + fallMotion（Tier3の構造テンプレート）のプリセット。
// 横位置（vw）は画面幅に対する絶対位置なので、粒ごとの中心相対オフセットを前提とする
// ParticleField本体の外側（呼び出し側のラッパーspan）でCSSのleftとして直接持たせる。

export interface RainPiece {
  id: number;
  /** 画面横位置（vw、0〜100）。 */
  leftVw: number;
  rotateDeg: number;
  /** rem。 */
  size: number;
  delaySeconds: number;
  durationSeconds: number;
  /** rem/秒。典型的な画面の高さぶん降り切る速さになるよう逆算する。 */
  fallSpeed: number;
  tone: 0 | 1 | 2 | 3;
}

export const RAIN_PIECE_COUNT = 28;
export const RAIN_DURATION_MS = 1500;

/** 落下距離の目安（rem）。実際のviewport高さは環境依存だが、典型的な高さの近似値。 */
const FALL_DISTANCE_REM = 60;

export function createRainPieces(random: RandomFn = Math.random): readonly RainPiece[] {
  return Array.from({ length: RAIN_PIECE_COUNT }, (_, id) => {
    const durationSeconds = 1 + random() * 0.7;
    return {
      id,
      leftVw: random() * 100,
      rotateDeg: Math.round(random() * 360),
      size: 0.4 + random() * 0.35,
      delaySeconds: random() * 0.3,
      durationSeconds,
      fallSpeed: FALL_DISTANCE_REM / durationSeconds,
      tone: Math.floor(random() * 4) as 0 | 1 | 2 | 3,
    };
  });
}

export { createSeededRandom as createSeededRainRandom };
