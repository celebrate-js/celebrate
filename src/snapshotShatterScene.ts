import { createSeededRandom, type RandomFn } from "./random";

export interface SnapshotPoint {
  x: number;
  y: number;
}

export interface SnapshotShard {
  /** 切り抜く三角形。3点はキャンバス上のCSS pixel座標。 */
  points: readonly [SnapshotPoint, SnapshotPoint, SnapshotPoint];
  /** 破片ごとの回転中心。 */
  center: SnapshotPoint;
  /** 終端時の移動量。 */
  fallX: number;
  fallY: number;
  rotateDeg: number;
  /** 0〜0.16。すべての破片が同時には落ちないようにする遅延割合。 */
  delay: number;
}

export interface SnapshotCrack {
  points: readonly SnapshotPoint[];
  delay: number;
}

export interface SnapshotShatterScene {
  shards: readonly SnapshotShard[];
  cracks: readonly SnapshotCrack[];
}

export const SNAPSHOT_SHATTER_COLUMNS = 4;
export const SNAPSHOT_SHATTER_ROWS = 3;
export const SNAPSHOT_SHATTER_SHARD_COUNT = SNAPSHOT_SHATTER_COLUMNS * SNAPSHOT_SHATTER_ROWS * 2;
export const SNAPSHOT_SHATTER_DURATION_MS = 1150;

function pointAt(points: readonly SnapshotPoint[], row: number, column: number, columns: number): SnapshotPoint {
  return points[row * (columns + 1) + column]!;
}

function centroid(points: readonly [SnapshotPoint, SnapshotPoint, SnapshotPoint]): SnapshotPoint {
  return {
    x: (points[0].x + points[1].x + points[2].x) / 3,
    y: (points[0].y + points[1].y + points[2].y) / 3,
  };
}

function createVertices(
  width: number,
  height: number,
  columns: number,
  rows: number,
  random: RandomFn
): readonly SnapshotPoint[] {
  const vertices: SnapshotPoint[] = [];
  const cellWidth = width / columns;
  const cellHeight = height / rows;

  for (let row = 0; row <= rows; row++) {
    for (let column = 0; column <= columns; column++) {
      const edge = row === 0 || row === rows || column === 0 || column === columns;
      vertices.push({
        x: column * cellWidth + (edge ? 0 : (random() - 0.5) * cellWidth * 0.3),
        y: row * cellHeight + (edge ? 0 : (random() - 0.5) * cellHeight * 0.3),
      });
    }
  }
  return vertices;
}

function createCracks(width: number, height: number, random: RandomFn): readonly SnapshotCrack[] {
  const origin = { x: width * (0.42 + random() * 0.16), y: height * (0.38 + random() * 0.18) };
  const radius = Math.hypot(width, height);

  return Array.from({ length: 8 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 8 + (random() - 0.5) * 0.28;
    const points: SnapshotPoint[] = [origin];
    for (let step = 1; step <= 4; step++) {
      const distance = (radius * step) / 4;
      points.push({
        x: origin.x + Math.cos(angle) * distance + (random() - 0.5) * width * 0.07,
        y: origin.y + Math.sin(angle) * distance + (random() - 0.5) * height * 0.07,
      });
    }
    return { points, delay: index * 0.012 + random() * 0.026 };
  });
}

/**
 * 一枚のスナップショットを隙間なく覆う三角形メッシュと、初期のひびを生成する。
 * 描画側がこのmeshをclipして同じビットマップを描くため、最初のフレームは元の絵と完全に一致する。
 */
export function createSnapshotShatterScene(
  width: number,
  height: number,
  random: RandomFn = Math.random,
  columns = SNAPSHOT_SHATTER_COLUMNS,
  rows = SNAPSHOT_SHATTER_ROWS
): SnapshotShatterScene {
  const safeColumns = Math.max(1, Math.floor(columns));
  const safeRows = Math.max(1, Math.floor(rows));
  const vertices = createVertices(width, height, safeColumns, safeRows, random);
  const shards: SnapshotShard[] = [];
  const impact = { x: width * 0.5, y: height * 0.47 };

  for (let row = 0; row < safeRows; row++) {
    for (let column = 0; column < safeColumns; column++) {
      const topLeft = pointAt(vertices, row, column, safeColumns);
      const topRight = pointAt(vertices, row, column + 1, safeColumns);
      const bottomRight = pointAt(vertices, row + 1, column + 1, safeColumns);
      const bottomLeft = pointAt(vertices, row + 1, column, safeColumns);
      const triangles: readonly (readonly [SnapshotPoint, SnapshotPoint, SnapshotPoint])[] =
        (row + column) % 2 === 0
          ? [
              [topLeft, topRight, bottomRight],
              [topLeft, bottomRight, bottomLeft],
            ]
          : [
              [topLeft, topRight, bottomLeft],
              [topRight, bottomRight, bottomLeft],
            ];

      for (const points of triangles) {
        const center = centroid(points);
        const horizontalDirection = Math.sign(center.x - impact.x) || (random() < 0.5 ? -1 : 1);
        const distanceFromImpact = Math.hypot(center.x - impact.x, center.y - impact.y) / Math.hypot(width, height);
        shards.push({
          points,
          center,
          fallX: horizontalDirection * (width * (0.08 + random() * 0.16)),
          fallY: height * (0.42 + row * 0.12 + random() * 0.24),
          rotateDeg: (random() - 0.5) * 64,
          delay: Math.min(0.16, distanceFromImpact * 0.13 + random() * 0.035),
        });
      }
    }
  }

  return { shards, cracks: createCracks(width, height, random) };
}

export { createSeededRandom as createSeededSnapshotShatterRandom };
