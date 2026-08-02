import { describe, expect, it } from "vitest";
import {
  intensityToScale,
  intensityToDurationMultiplier,
  intensityToGainMultiplier,
  intensityToHapticMultiplier,
} from "./intensity";

describe("intensity 変換", () => {
  it("intensity=1 は通常運転に近い値を返す", () => {
    expect(intensityToScale(1)).toBeCloseTo(1, 1);
    expect(intensityToDurationMultiplier(1)).toBeCloseTo(1, 1);
    expect(intensityToGainMultiplier(1)).toBeCloseTo(1, 1);
    expect(intensityToHapticMultiplier(1)).toBeCloseTo(1, 1);
  });

  it("intensityが大きいほど値が増える（単調増加）", () => {
    expect(intensityToScale(10)).toBeGreaterThan(intensityToScale(1));
    expect(intensityToDurationMultiplier(10)).toBeGreaterThan(intensityToDurationMultiplier(1));
    expect(intensityToGainMultiplier(10)).toBeGreaterThan(intensityToGainMultiplier(1));
    expect(intensityToHapticMultiplier(10)).toBeGreaterThan(intensityToHapticMultiplier(1));
  });

  it("どれだけ大きいintensityでも頭打ちになる（画面が壊れるほど巨大化しない）", () => {
    expect(intensityToScale(1_000_000)).toBeLessThanOrEqual(2.4);
    expect(intensityToDurationMultiplier(1_000_000)).toBeLessThanOrEqual(1.6);
    expect(intensityToGainMultiplier(1_000_000)).toBeLessThanOrEqual(1.8);
    expect(intensityToHapticMultiplier(1_000_000)).toBeLessThanOrEqual(1.8);
  });

  it("0や負のintensityを渡しても例外にならない（下限でクランプ）", () => {
    expect(() => intensityToScale(0)).not.toThrow();
    expect(() => intensityToScale(-5)).not.toThrow();
    expect(intensityToScale(0)).toBeGreaterThan(0);
  });
});
