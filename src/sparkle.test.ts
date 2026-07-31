import { describe, expect, it } from "vitest";
import {
  createSeededSparkleRandom,
  createSparkleParticles,
  SPARKLE_DURATION_MS,
  SPARKLE_PARTICLE_COUNT,
} from "./sparkle";
import {
  chooseSparkleSound,
  sparkleSoundIndex,
  SPARKLE_SOUND_PRESETS,
} from "./sparkleSound";
import {
  CELEBRATION_DURATIONS_MS,
  durationForCelebration,
} from "./variants";
import { CELEBRATE_DURATION_MS } from "./pieces";

describe("sparkle particles", () => {
  it("32個を生成し、IDが一意になる", () => {
    const particles = createSparkleParticles(createSeededSparkleRandom(42));
    expect(particles).toHaveLength(SPARKLE_PARTICLE_COUNT);
    expect(SPARKLE_PARTICLE_COUNT).toBe(32);
    expect(new Set(particles.map((particle) => particle.id)).size).toBe(32);
  });

  it("同じseedなら同じ散り方になる", () => {
    expect(createSparkleParticles(createSeededSparkleRandom(7))).toEqual(
      createSparkleParticles(createSeededSparkleRandom(7))
    );
  });

  it("全方位へ散り、toneはパレット範囲内に収まる", () => {
    const particles = createSparkleParticles(createSeededSparkleRandom(99));
    const value = (cssValue: string) => Number(cssValue.replace("rem", ""));
    expect(particles.some((particle) => value(particle.x) < 0)).toBe(true);
    expect(particles.some((particle) => value(particle.x) > 0)).toBe(true);
    expect(particles.some((particle) => value(particle.y) < 0)).toBe(true);
    expect(particles.some((particle) => value(particle.y) > 0)).toBe(true);
    expect(particles.every((particle) => particle.tone >= 0 && particle.tone <= 3)).toBe(true);
  });
});

describe("sparkle sound", () => {
  it("10種類のプリセットを持つ", () => {
    expect(SPARKLE_SOUND_PRESETS).toHaveLength(10);
  });

  it("乱数の境界を必ず0〜9へ収める", () => {
    expect(sparkleSoundIndex(-1)).toBe(0);
    expect(sparkleSoundIndex(0)).toBe(0);
    expect(sparkleSoundIndex(0.999999)).toBe(9);
    expect(sparkleSoundIndex(1)).toBe(9);
    expect(sparkleSoundIndex(Number.NaN)).toBe(0);
  });

  it("注入した乱数で選択を再現できる", () => {
    expect(chooseSparkleSound(() => 0.51)).toBe(SPARKLE_SOUND_PRESETS[5]);
  });
});

describe("variant duration", () => {
  it("sparkleだけ固有durationで、既存variantの時間は変わらない", () => {
    expect(durationForCelebration("sparkle")).toBe(SPARKLE_DURATION_MS);
    expect(CELEBRATION_DURATIONS_MS.stamp).toBe(CELEBRATE_DURATION_MS);
    expect(CELEBRATION_DURATIONS_MS.confetti).toBe(CELEBRATE_DURATION_MS);
    expect(CELEBRATION_DURATIONS_MS.record).toBe(CELEBRATE_DURATION_MS);
  });
});
