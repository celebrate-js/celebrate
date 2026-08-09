import { createSeededRandom, type RandomFn } from "./random";

// 互換性のために公開している、CSS clip-path用の破片形状生成ユーティリティ。
// 標準のshatter演出はShatterScreen/SnapshotShatterが画面の撮影画素を描画する。

export interface CrackLine {
  /** SVG polyline の points（0〜100 の相対座標）。 */
  points: string;
  delay: string;
}

export interface Shard {
  id: number;
  /** CSS の clip-path にそのまま渡せる polygon() 文字列。 */
  clipPath: string;
  fallX: string;
  fallY: string;
  rotate: string;
  delay: string;
}

export interface ShatterScene {
  cracks: readonly CrackLine[];
  shards: readonly Shard[];
}

const GRID = 3; // 3x3 の破片（= 4x4 の頂点グリッド）。
const CRACK_COUNT = 7;

export const SHATTER_SHARD_COUNT = GRID * GRID;
export const SHATTER_CRACK_COUNT = CRACK_COUNT;
// DOMのviewport撮影（html2canvas）に要する時間を含める。撮影後に2200msの破片アニメーションを
// 最後まで表示できるよう、カタログ側の自動片付けは余裕を持たせる。
export const SHATTER_DURATION_MS = 10000;

interface Vertex {
  x: number;
  y: number;
}

function createVertexGrid(random: RandomFn): Vertex[] {
  const vertices: Vertex[] = [];
  for (let row = 0; row <= GRID; row++) {
    for (let col = 0; col <= GRID; col++) {
      const isEdge = row === 0 || row === GRID || col === 0 || col === GRID;
      const baseX = (col / GRID) * 100;
      const baseY = (row / GRID) * 100;
      // 画面端の頂点は動かさない＝タイル同士の外周が必ず画面いっぱいを覆う。
      const jitterX = isEdge ? 0 : (random() - 0.5) * 9;
      const jitterY = isEdge ? 0 : (random() - 0.5) * 9;
      vertices.push({ x: baseX + jitterX, y: baseY + jitterY });
    }
  }
  return vertices;
}

function vertexAt(vertices: readonly Vertex[], row: number, col: number): Vertex {
  return vertices[row * (GRID + 1) + col]!;
}

function fmt(v: Vertex): string {
  return `${v.x.toFixed(1)}% ${v.y.toFixed(1)}%`;
}

/** 中心から画面外へ向かう、ジグザグなヒビを複数本生成する。 */
function createCracks(random: RandomFn): readonly CrackLine[] {
  return Array.from({ length: CRACK_COUNT }, (_, id) => {
    const angle = (Math.PI * 2 * id) / CRACK_COUNT + (random() - 0.5) * 0.4;
    const steps = 4;
    const points: string[] = ["50,50"];
    for (let i = 1; i <= steps; i++) {
      const distance = (i / steps) * 70;
      const wobble = (random() - 0.5) * 10;
      const x = 50 + Math.cos(angle) * distance + wobble;
      const y = 50 + Math.sin(angle) * distance + wobble;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return {
      points: points.join(" "),
      // ヒビは中心から少しずつ時間差で伸びる＝「広がっていく」感じを出す。
      delay: `${(id * 0.02 + random() * 0.03).toFixed(3)}s`,
    };
  });
}

/** グリッドタイルを、崩れ落ちる破片（shard）に変換する。 */
function createShards(random: RandomFn, vertices: readonly Vertex[]): readonly Shard[] {
  const shards: Shard[] = [];
  let id = 0;
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const corners = [
        vertexAt(vertices, row, col),
        vertexAt(vertices, row, col + 1),
        vertexAt(vertices, row + 1, col + 1),
        vertexAt(vertices, row + 1, col),
      ];
      // 下の段ほど大きく落ち、上の段ほど少し遅れて崩れる（重力で下から崩れる感じ）。
      const fallDistance = 8 + row * 6 + random() * 6;
      shards.push({
        id: id++,
        clipPath: `polygon(${corners.map(fmt).join(", ")})`,
        fallX: `${((random() - 0.5) * 6).toFixed(2)}vw`,
        fallY: `${fallDistance.toFixed(2)}vh`,
        rotate: `${Math.round((random() - 0.5) * 40)}deg`,
        delay: `${(0.45 + (GRID - 1 - row) * 0.03 + random() * 0.12).toFixed(3)}s`,
      });
    }
  }
  return shards;
}

/** CSS clip-pathで使える破片形状を生成する。 */
export function createShatterScene(random: RandomFn = Math.random): ShatterScene {
  const vertices = createVertexGrid(random);
  return {
    cracks: createCracks(random),
    shards: createShards(random, vertices),
  };
}

export { createSeededRandom as createSeededShatterRandom };
