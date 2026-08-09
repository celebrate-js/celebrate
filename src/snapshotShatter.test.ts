import { describe, expect, it } from "vitest";
import {
  createSeededSnapshotShatterRandom,
  createSnapshotShatterScene,
  SNAPSHOT_SHATTER_SHARD_COUNT,
} from "./snapshotShatterScene";

describe("snapshot shatter scene", () => {
  it("4x3セルを各2枚に割った24枚の三角形を生成する", () => {
    expect(createSnapshotShatterScene(320, 180, createSeededSnapshotShatterRandom(1)).shards).toHaveLength(
      SNAPSHOT_SHATTER_SHARD_COUNT
    );
  });

  it("同じseedなら同じメッシュになる", () => {
    expect(createSnapshotShatterScene(320, 180, createSeededSnapshotShatterRandom(4))).toEqual(
      createSnapshotShatterScene(320, 180, createSeededSnapshotShatterRandom(4))
    );
  });

  it("各破片は対象画像の中にある3点の三角形である", () => {
    const scene = createSnapshotShatterScene(320, 180, createSeededSnapshotShatterRandom(7));
    for (const shard of scene.shards) {
      expect(shard.points).toHaveLength(3);
      for (const point of shard.points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(320);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(180);
      }
    }
  });
});
