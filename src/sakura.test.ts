import { describe, expect, it } from "vitest";
import { createSakuraPetals, createSeededSakuraRandom, SAKURA_PETAL_COUNT } from "./sakura";

describe("sakura petals", () => {
  it("既定枚数を生成し、IDが一意になる", () => {
    const petals = createSakuraPetals(createSeededSakuraRandom(1));
    expect(petals).toHaveLength(SAKURA_PETAL_COUNT);
    expect(new Set(petals.map((p) => p.id)).size).toBe(SAKURA_PETAL_COUNT);
  });

  it("同じseedなら同じ舞い方になる", () => {
    expect(createSakuraPetals(createSeededSakuraRandom(6))).toEqual(createSakuraPetals(createSeededSakuraRandom(6)));
  });

  it("異なるseedなら舞い方が変わる", () => {
    expect(createSakuraPetals(createSeededSakuraRandom(1))).not.toEqual(
      createSakuraPetals(createSeededSakuraRandom(2))
    );
  });

  it("fallSpeed・sizeは常に正の値（上に落ちる花びらは物理的に意味がない）", () => {
    const petals = createSakuraPetals(createSeededSakuraRandom(4));
    expect(petals.every((p) => p.fallSpeed > 0)).toBe(true);
    expect(petals.every((p) => p.size > 0)).toBe(true);
    expect(petals.every((p) => p.durationSeconds > 0)).toBe(true);
  });

  it("fallSpeedはfallY(5.5〜8)をdurationSecondsで割った値と一致する", () => {
    const [petal] = createSakuraPetals(createSeededSakuraRandom(2));
    const impliedFallY = petal!.fallSpeed * petal!.durationSeconds;
    expect(impliedFallY).toBeGreaterThanOrEqual(5.5);
    expect(impliedFallY).toBeLessThanOrEqual(8);
  });
});
