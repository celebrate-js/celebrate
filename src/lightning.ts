import { createSeededRandom, type RandomFn } from "./random";

// 画面上から下まで貫く稲光のジグザグ経路。SVG の viewBox を 0..100（%相当）に
// 統一しておくことで、preserveAspectRatio="none" と組み合わせれば
// コンテナの実サイズ（＝ビューポート）に関わらずそのまま伸縮する。

export interface LightningPath {
  /** SVG polyline の points 属性にそのまま渡せる文字列。 */
  points: string;
  /** 枝分かれ（本体より薄く短い）の points。 */
  branchPoints: string;
}

const STEP_COUNT = 8;

function zigzag(random: RandomFn, centerX: number, spread: number): string {
  const points: string[] = [];
  for (let i = 0; i <= STEP_COUNT; i++) {
    const y = (i / STEP_COUNT) * 100;
    const x = centerX + (random() - 0.5) * spread;
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

/** 画面幅のどのあたりに落ちるかも含めて、稲光1本分の経路を生成する。 */
export function createLightningPath(random: RandomFn = Math.random): LightningPath {
  const centerX = 25 + random() * 50; // 画面端に寄りすぎないよう 25%〜75% に収める。
  const points = zigzag(random, centerX, 22);
  const branchStart = 30 + random() * 30;
  const branchDir = random() < 0.5 ? -1 : 1;
  const branchPoints = [
    `${centerX.toFixed(1)},${branchStart.toFixed(1)}`,
    `${(centerX + branchDir * (10 + random() * 12)).toFixed(1)},${(branchStart + 12 + random() * 10).toFixed(1)}`,
  ].join(" ");
  return { points, branchPoints };
}

export { createSeededRandom as createSeededLightningRandom };
