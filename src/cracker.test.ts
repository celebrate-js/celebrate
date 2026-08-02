import { describe, expect, it } from "vitest";
import { createCrackerStreamers, createSeededCrackerRandom, CRACKER_STREAMER_COUNT } from "./cracker";
import { rollRewardTier } from "./rewardTier";

describe("cracker streamers", () => {
  it("14本を生成し、IDが一意になる", () => {
    const streamers = createCrackerStreamers(createSeededCrackerRandom(1));
    expect(streamers).toHaveLength(CRACKER_STREAMER_COUNT);
    expect(new Set(streamers.map((s) => s.id)).size).toBe(CRACKER_STREAMER_COUNT);
  });

  it("同じseedなら同じ飛び方になる", () => {
    expect(createCrackerStreamers(createSeededCrackerRandom(5))).toEqual(
      createCrackerStreamers(createSeededCrackerRandom(5))
    );
  });

  it("真上を中心にしたコーンに偏る（真下方向へは飛ばない）", () => {
    const streamers = createCrackerStreamers(createSeededCrackerRandom(3));
    const deg = (rad: number) => (rad * 180) / Math.PI;
    // -90deg（真上） ± 65deg の範囲（-155deg 〜 -25deg）に収まる。
    expect(streamers.every((s) => deg(s.angleRad) >= -155 && deg(s.angleRad) <= -25)).toBe(true);
  });

  it("speed・lengthは常に正の値（負の飛距離は物理的に意味がない）", () => {
    const streamers = createCrackerStreamers(createSeededCrackerRandom(11));
    expect(streamers.every((s) => s.speed > 0)).toBe(true);
    expect(streamers.every((s) => s.length > 0)).toBe(true);
  });
});

describe("rollRewardTier", () => {
  it("重みゼロの階級は選ばれない", () => {
    const result = rollRewardTier(
      [
        { chance: 1, with: ["confetti"] as const },
        { chance: 0, with: ["sparkle"] as const },
      ],
      () => 0.999999
    );
    expect(result.with).toEqual(["confetti"]);
  });

  it("乱数0でも1でも範囲外に落ちない", () => {
    const tiers = [{ chance: 0.5 }, { chance: 0.5 }] as const;
    expect(() => rollRewardTier(tiers, () => 0)).not.toThrow();
    expect(() => rollRewardTier(tiers, () => 0.999999)).not.toThrow();
  });

  it("重みの比率どおりに決定的な乱数で選ばれる", () => {
    const tiers = [
      { chance: 0.7, label: "normal" },
      { chance: 0.25, label: "rare" },
      { chance: 0.05, label: "jackpot" },
    ] as const;
    expect(rollRewardTier(tiers, () => 0).label).toBe("normal");
    expect(rollRewardTier(tiers, () => 0.8).label).toBe("rare");
    expect(rollRewardTier(tiers, () => 0.99).label).toBe("jackpot");
  });
});
