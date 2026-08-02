import { describe, expect, it } from "vitest";
import {
  createSeededSparkleRandom,
  createSparkleParticles,
  SPARKLE_PARTICLE_COUNT,
} from "./sparkle";
import {
  chooseSparkleSound,
  sparkleSoundIndex,
  SPARKLE_SOUND_PRESETS,
} from "./sparkleSound";

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
    const x = (p: (typeof particles)[number]) => Math.cos(p.angleRad) * p.speed;
    const y = (p: (typeof particles)[number]) => Math.sin(p.angleRad) * p.speed;
    expect(particles.some((p) => x(p) < 0)).toBe(true);
    expect(particles.some((p) => x(p) > 0)).toBe(true);
    expect(particles.some((p) => y(p) < 0)).toBe(true);
    expect(particles.some((p) => y(p) > 0)).toBe(true);
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

