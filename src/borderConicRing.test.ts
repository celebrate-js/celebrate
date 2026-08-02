import { describe, expect, it } from "vitest";
import { rainbowPreset, spinPreset } from "./borderConicRing";

describe("borderConicRing presets", () => {
  it("spinはsweepモード、rainbowはflashモード", () => {
    expect(spinPreset().mode).toBe("sweep");
    expect(rainbowPreset().mode).toBe("flash");
  });

  it("全プリセットが自己申告のmechanismを持つ", () => {
    expect(spinPreset().mechanism).toBe("conicRing");
    expect(rainbowPreset().mechanism).toBe("conicRing");
  });

  it("stopsを渡すとそのまま反映される（呼び出し側が自由な色並びを指定できる）", () => {
    const custom = spinPreset("#111, #222");
    expect(custom.stops).toBe("#111, #222");
  });

  it("省略時は既定の色並みを使う", () => {
    expect(spinPreset().stops.length).toBeGreaterThan(0);
    expect(rainbowPreset().stops.length).toBeGreaterThan(0);
    expect(spinPreset().stops).not.toBe(rainbowPreset().stops);
  });
});
