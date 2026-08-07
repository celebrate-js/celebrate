import { describe, expect, it } from "vitest";
import { createRainPieces, createSeededRainRandom, RAIN_PIECE_COUNT } from "./rain";

describe("rain pieces", () => {
  it("既定枚数を生成し、IDが一意になる", () => {
    const pieces = createRainPieces(createSeededRainRandom(1));
    expect(pieces).toHaveLength(RAIN_PIECE_COUNT);
    expect(new Set(pieces.map((p) => p.id)).size).toBe(RAIN_PIECE_COUNT);
  });

  it("同じseedなら同じ降り方になる", () => {
    expect(createRainPieces(createSeededRainRandom(8))).toEqual(createRainPieces(createSeededRainRandom(8)));
  });

  it("leftVwは0〜100の範囲（画面幅いっぱいに降る）", () => {
    const pieces = createRainPieces(createSeededRainRandom(3));
    expect(pieces.every((p) => p.leftVw >= 0 && p.leftVw <= 100)).toBe(true);
  });

  it("toneは0〜3の4値のみ", () => {
    const pieces = createRainPieces(createSeededRainRandom(5));
    expect(pieces.every((p) => [0, 1, 2, 3].includes(p.tone))).toBe(true);
  });

  it("fallSpeed・sizeは常に正の値", () => {
    const pieces = createRainPieces(createSeededRainRandom(9));
    expect(pieces.every((p) => p.fallSpeed > 0)).toBe(true);
    expect(pieces.every((p) => p.size > 0)).toBe(true);
  });
});
