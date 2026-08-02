import { describe, expect, it } from "vitest";
import { electricPreset, firePreset, glowPreset, icePreset, neonPreset } from "./borderGlow";

describe("borderGlow presets", () => {
  it("全プリセットが自己申告のmechanismを持つ", () => {
    expect(glowPreset("#f00").mechanism).toBe("glow");
    expect(neonPreset("#f00").mechanism).toBe("glow");
    expect(firePreset().mechanism).toBe("glow");
    expect(icePreset().mechanism).toBe("glow");
    expect(electricPreset().mechanism).toBe("glow");
  });

  it("stopsのoffsetは0から1の範囲で単調非減少", () => {
    for (const preset of [glowPreset("#f00"), neonPreset("#f00"), firePreset(), icePreset(), electricPreset()]) {
      let prev = -1;
      for (const stop of preset.stops) {
        expect(stop.offset).toBeGreaterThanOrEqual(0);
        expect(stop.offset).toBeLessThanOrEqual(1);
        expect(stop.offset).toBeGreaterThanOrEqual(prev);
        prev = stop.offset;
      }
    }
  });

  it("色パラメータがboxShadowの中に反映される", () => {
    const preset = glowPreset("#123456");
    expect(preset.stops.some((s) => s.boxShadow.includes("#123456"))).toBe(true);
  });

  it("fire/ice/electricは2色パラメータをそれぞれ反映する", () => {
    const fire = firePreset(["#aaa000", "#bbb000"]);
    expect(fire.stops.some((s) => s.boxShadow.includes("#aaa000"))).toBe(true);
    expect(fire.stops.some((s) => s.boxShadow.includes("#bbb000"))).toBe(true);

    const ice = icePreset(["#ccc000", "#ddd000"]);
    expect(ice.stops.some((s) => s.boxShadow.includes("#ccc000"))).toBe(true);
    expect(ice.stops.some((s) => s.boxShadow.includes("#ddd000"))).toBe(true);
  });

  it("electricだけ既定でsteps()の離散イージングを持つ", () => {
    expect(electricPreset().easing).toContain("steps");
    expect(glowPreset("#f00").easing).toBeUndefined();
  });

  it("色を省略すると既定色にフォールバックする", () => {
    expect(firePreset().stops.some((s) => s.boxShadow.includes("#ffcf5c"))).toBe(true);
    expect(icePreset().stops.some((s) => s.boxShadow.includes("#eaffff"))).toBe(true);
  });
});
