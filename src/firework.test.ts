import { describe, expect, it } from "vitest";
import {
  createFireworkShells,
  createSeededFireworkRandom,
  FIREWORK_SHELL_COUNT,
  FIREWORK_PARTICLES_PER_SHELL,
  STAR_PARTICLE_COUNT,
  starRadiusMultiplier,
} from "./firework";

describe("firework shells", () => {
  it("shellの数・shellあたりの粒数が既定通り", () => {
    const shells = createFireworkShells(createSeededFireworkRandom(1));
    expect(shells).toHaveLength(FIREWORK_SHELL_COUNT);
    shells.forEach((shell) => expect(shell.particles).toHaveLength(FIREWORK_PARTICLES_PER_SHELL));
  });

  it("同じseed・同じstyleなら同じ結果になる", () => {
    expect(createFireworkShells(createSeededFireworkRandom(7), "peony")).toEqual(
      createFireworkShells(createSeededFireworkRandom(7), "peony")
    );
  });

  it("shellごとにIDが一意で、時間差（delaySeconds）が単調に増える", () => {
    const shells = createFireworkShells(createSeededFireworkRandom(3));
    expect(new Set(shells.map((s) => s.id)).size).toBe(FIREWORK_SHELL_COUNT);
    for (let i = 1; i < shells.length; i++) {
      expect(shells[i]!.delaySeconds).toBeGreaterThan(shells[i - 1]!.delaySeconds);
    }
  });

  it("ringスタイルは角度ジッターが無く均等な輪になる（重力もゼロ）", () => {
    const [shell] = createFireworkShells(createSeededFireworkRandom(2), "ring");
    const particles = shell!.particles;
    const expectedStep = (Math.PI * 2) / FIREWORK_PARTICLES_PER_SHELL;
    particles.forEach((p, i) => {
      expect(p.angleRad).toBeCloseTo(expectedStep * i, 10);
      expect(p.gravity).toBe(0);
    });
  });

  it("willowスタイルはpeonyより平均して重力が大きい（枝垂れる）", () => {
    const willow = createFireworkShells(createSeededFireworkRandom(4), "willow");
    const peony = createFireworkShells(createSeededFireworkRandom(4), "peony");
    const avgGravity = (shells: typeof willow) =>
      shells.flatMap((s) => s.particles.map((p) => p.gravity)).reduce((a, b) => a + b, 0) /
      (FIREWORK_SHELL_COUNT * FIREWORK_PARTICLES_PER_SHELL);
    expect(avgGravity(willow)).toBeGreaterThan(avgGravity(peony));
  });

  it("scaleを2倍にすると破裂位置・粒サイズも概ね2倍になる", () => {
    const base = createFireworkShells(createSeededFireworkRandom(9), "peony", 1);
    const scaled = createFireworkShells(createSeededFireworkRandom(9), "peony", 2);
    expect(scaled[0]!.offsetXRem).toBeCloseTo(base[0]!.offsetXRem * 2, 10);
    expect(scaled[0]!.offsetYRem).toBeCloseTo(base[0]!.offsetYRem * 2, 10);
    expect(scaled[0]!.particles[0]!.size).toBeCloseTo(base[0]!.particles[0]!.size * 2, 10);
  });

  it("speed・durationSeconds・sizeは常に正の値", () => {
    const shells = createFireworkShells(createSeededFireworkRandom(5));
    const particles = shells.flatMap((s) => s.particles);
    expect(particles.every((p) => p.speed > 0)).toBe(true);
    expect(particles.every((p) => p.durationSeconds > 0)).toBe(true);
    expect(particles.every((p) => p.size > 0)).toBe(true);
  });
});

describe("firework shells（追加style: kiku/star/senrin/hachi）", () => {
  it("kiku/star/senrin/hachiも同じseedなら同じ結果になる", () => {
    (["kiku", "star", "senrin", "hachi"] as const).forEach((style) => {
      expect(createFireworkShells(createSeededFireworkRandom(6), style)).toEqual(
        createFireworkShells(createSeededFireworkRandom(6), style)
      );
    });
  });

  it("starスタイルは専用の粒数（STAR_PARTICLE_COUNT）を使い、角度ジッターが無い（輪郭が乱れない）", () => {
    const [shell] = createFireworkShells(createSeededFireworkRandom(2), "star");
    expect(shell!.particles).toHaveLength(STAR_PARTICLE_COUNT);
    const expectedStep = (Math.PI * 2) / STAR_PARTICLE_COUNT;
    shell!.particles.forEach((p, i) => {
      expect(p.angleRad).toBeCloseTo(expectedStep * i, 10);
    });
  });

  it("starスタイルは角度によって破裂距離（＝speed）が均一ではない（星形のシルエット）", () => {
    const [shell] = createFireworkShells(createSeededFireworkRandom(2), "star");
    const speeds = shell!.particles.map((p) => p.speed);
    // 全部同じ距離（＝ringのような均等な輪）にはならず、頂点と谷で差がある。
    expect(Math.max(...speeds)).toBeGreaterThan(Math.min(...speeds) * 1.5);
  });

  describe("starRadiusMultiplier（星形の半径プロファイル：区分線形で頂点と谷を作る）", () => {
    it("頂点（0°, 72°, 144°, ...）では最大値1になる", () => {
      for (let i = 0; i < 5; i++) {
        expect(starRadiusMultiplier((Math.PI * 2 * i) / 5)).toBeCloseTo(1, 10);
      }
    });

    it("谷（頂点の中間、36°, 108°, ...）では最小値（内側比率）になる", () => {
      const innerRatio = starRadiusMultiplier(Math.PI / 5); // 36° = 頂点0°と72°のちょうど中間
      for (let i = 0; i < 5; i++) {
        const valleyAngle = (Math.PI * 2 * i) / 5 + Math.PI / 5;
        expect(starRadiusMultiplier(valleyAngle)).toBeCloseTo(innerRatio, 10);
      }
      expect(innerRatio).toBeLessThan(1);
      expect(innerRatio).toBeGreaterThan(0);
    });

    it("頂点と谷の間は単調に変化する（区分線形。cos波のような中間での揺り戻しが無い）", () => {
      const samples = Array.from({ length: 19 }, (_, i) => starRadiusMultiplier((Math.PI / 5) * (i / 18)));
      for (let i = 1; i < samples.length; i++) {
        expect(samples[i]!).toBeLessThanOrEqual(samples[i - 1]! + 1e-10);
      }
    });

    it("角度は2πで周期的", () => {
      const angle = 1.234;
      expect(starRadiusMultiplier(angle)).toBeCloseTo(starRadiusMultiplier(angle + Math.PI * 2), 10);
    });
  });

  it("senrinスタイルは粒ごとにoriginOffsetを持ち、クラスタごとに値が異なる", () => {
    const [shell] = createFireworkShells(createSeededFireworkRandom(4), "senrin");
    const offsets = shell!.particles.map((p) => `${p.originOffsetXRem},${p.originOffsetYRem}`);
    expect(new Set(offsets).size).toBeGreaterThan(1);
    shell!.particles.forEach((p) => {
      expect(p.originOffsetXRem).toBeDefined();
      expect(p.originOffsetYRem).toBeDefined();
    });
  });

  it("senrin以外のスタイルはoriginOffsetを持たない", () => {
    const [shell] = createFireworkShells(createSeededFireworkRandom(4), "peony");
    shell!.particles.forEach((p) => {
      expect(p.originOffsetXRem).toBeUndefined();
      expect(p.originOffsetYRem).toBeUndefined();
    });
  });

  it("hachiスタイルもspeed/sizeは常に正の値", () => {
    const shells = createFireworkShells(createSeededFireworkRandom(8), "hachi");
    const particles = shells.flatMap((s) => s.particles);
    expect(particles.every((p) => p.speed > 0)).toBe(true);
    expect(particles.every((p) => p.size > 0)).toBe(true);
  });
});
