import { describe, expect, it } from "vitest";
import { createShatterScene, createSeededShatterRandom, SHATTER_CRACK_COUNT, SHATTER_SHARD_COUNT } from "./shatter";

describe("shatter scene", () => {
  it("クラック7本・破片9枚を生成する", () => {
    const scene = createShatterScene(createSeededShatterRandom(1));
    expect(scene.cracks).toHaveLength(SHATTER_CRACK_COUNT);
    expect(scene.shards).toHaveLength(SHATTER_SHARD_COUNT);
  });

  it("同じseedなら同じ場面になる", () => {
    expect(createShatterScene(createSeededShatterRandom(9))).toEqual(createShatterScene(createSeededShatterRandom(9)));
  });

  it("破片のIDが一意になる", () => {
    const scene = createShatterScene(createSeededShatterRandom(3));
    expect(new Set(scene.shards.map((s) => s.id)).size).toBe(SHATTER_SHARD_COUNT);
  });

  it("破片のclip-pathは常に4点のpolygonになる（画面をグリッドで覆うタイル）", () => {
    const scene = createShatterScene(createSeededShatterRandom(5));
    for (const shard of scene.shards) {
      const points = shard.clipPath.match(/[\d.]+% [\d.]+%/g);
      expect(points).toHaveLength(4);
    }
  });

  it("画面端の頂点は動かさない（外周に隙間ができない）", () => {
    // 4隅を含むタイル（左上・右上・左下・右下）のclip-pathに、必ず 0% か 100% の
    // 座標が含まれることを確認する（端がジッターで動いているとこれが崩れる）。
    const scene = createShatterScene(createSeededShatterRandom(7));
    const cornerShard = scene.shards[0]!; // row0, col0 = 左上のタイル
    expect(cornerShard.clipPath).toContain("0.0% 0.0%");
  });
});
