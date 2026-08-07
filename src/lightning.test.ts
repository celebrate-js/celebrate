import { describe, expect, it } from "vitest";
import { createLightningPath, createSeededLightningRandom } from "./lightning";

function parsePoints(points: string): { x: number; y: number }[] {
  return points.split(" ").map((pair) => {
    const [x, y] = pair.split(",").map(Number);
    return { x: x!, y: y! };
  });
}

describe("lightning path", () => {
  it("同じseedなら同じ経路になる", () => {
    expect(createLightningPath(createSeededLightningRandom(1))).toEqual(
      createLightningPath(createSeededLightningRandom(1))
    );
  });

  it("異なるseedなら経路が変わる", () => {
    expect(createLightningPath(createSeededLightningRandom(1))).not.toEqual(
      createLightningPath(createSeededLightningRandom(2))
    );
  });

  it("本体（points）は上端(y=0)から下端(y=100)まで9点で貫く", () => {
    const { points } = createLightningPath(createSeededLightningRandom(4));
    const parsed = parsePoints(points);
    expect(parsed).toHaveLength(9);
    expect(parsed[0]!.y).toBe(0);
    expect(parsed[parsed.length - 1]!.y).toBe(100);
  });

  it("本体の各点は画面端(0〜100)からはみ出さない中心寄りの範囲に収まる", () => {
    const { points } = createLightningPath(createSeededLightningRandom(7));
    const xs = parsePoints(points).map((p) => p.x);
    // centerX(25〜75) ± spread/2(11) の理論上の最大範囲。
    expect(xs.every((x) => x >= 25 - 11 && x <= 75 + 11)).toBe(true);
  });

  it("branchPointsは2点（枝分かれの開始と先端）", () => {
    const { branchPoints } = createLightningPath(createSeededLightningRandom(2));
    expect(parsePoints(branchPoints)).toHaveLength(2);
  });
});
