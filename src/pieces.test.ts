import { describe, expect, it } from "vitest";
import { CELEBRATE_DURATION_MS, CONFETTI_PIECES, CONFETTI_PIECE_COUNT } from "./pieces";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

// 紙吹雪の粒データが満たすべき不変条件。
// 見た目そのものはテストできないが、「静かに壊れる」種類のズレはここで止める。

const SECONDS = /^(-?\d+(?:\.\d+)?)s$/;

function seconds(value: string): number {
  const matched = SECONDS.exec(value);
  if (!matched) throw new Error(`秒の指定として読めません: ${value}`);
  return Number(matched[1]);
}

describe("紙吹雪の粒", () => {
  it("粒数の公開値が実データと一致する（e2e はこの値を import して数える）", () => {
    expect(CONFETTI_PIECE_COUNT).toBe(CONFETTI_PIECES.length);
    expect(CONFETTI_PIECE_COUNT).toBe(12);
  });

  it("tone が必ずパレットの範囲に収まる（範囲外だと色が undefined になり粒が透明になる）", () => {
    for (const piece of CONFETTI_PIECES) {
      expect(typeof DEFAULT_CELEBRATE_THEME.confettiColors[piece.tone]).toBe("string");
    }
  });

  it("パレットの4色すべてが実際に使われている（使われない色は設定漏れの兆候）", () => {
    const used = new Set(CONFETTI_PIECES.map((piece) => piece.tone));
    expect([...used].sort()).toEqual([0, 1, 2, 3]);
  });

  it("React の key（delay+x）が全粒で一意になる", () => {
    const keys = CONFETTI_PIECES.map((piece) => piece.delay + piece.x);
    expect(new Set(keys).size).toBe(CONFETTI_PIECES.length);
  });

  it("片付けまでの時間が、いちばん遅い粒が散り終わるまでを含んでいる", () => {
    const slowest = Math.max(...CONFETTI_PIECES.map((piece) => seconds(piece.delay)));
    // 印影 0.3s と紙吹雪（delay + 飛散 0.7s）のうち長い方より後に片付ける。
    expect(CELEBRATE_DURATION_MS).toBeGreaterThan(Math.max(0.3, slowest + 0.7) * 1000);
  });

  it("粒は中心から見て上下左右すべての向きに散る（一方向に偏らない）", () => {
    const rem = (value: string) => Number(value.replace("rem", ""));
    expect(CONFETTI_PIECES.some((p) => rem(p.x) < 0)).toBe(true);
    expect(CONFETTI_PIECES.some((p) => rem(p.x) > 0)).toBe(true);
    expect(CONFETTI_PIECES.some((p) => rem(p.y) < 0)).toBe(true);
    expect(CONFETTI_PIECES.some((p) => rem(p.y) > 0)).toBe(true);
  });

  it("丸い粒と角の粒が両方ある（メリハリの意匠が消えていない）", () => {
    expect(CONFETTI_PIECES.some((p) => p.round)).toBe(true);
    expect(CONFETTI_PIECES.some((p) => !p.round)).toBe(true);
  });
});
