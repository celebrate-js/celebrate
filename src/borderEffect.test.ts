import { describe, expect, it } from "vitest";
import { BORDER_EFFECT_DURATIONS_MS, BORDER_EFFECTS, BORDER_EFFECT_KINDS } from "./borderEffect";

describe("BORDER_EFFECTS", () => {
  it("BORDER_EFFECT_KINDSの全kindがBORDER_EFFECTSとBORDER_EFFECT_DURATIONS_MSに存在する", () => {
    for (const kind of BORDER_EFFECT_KINDS) {
      expect(BORDER_EFFECTS[kind]).toBeDefined();
      expect(BORDER_EFFECT_DURATIONS_MS[kind]).toBeGreaterThan(0);
    }
  });

  it("glow/neon/fire/ice/electricはglow機構", () => {
    for (const kind of ["glow", "neon", "fire", "ice", "electric"] as const) {
      expect(BORDER_EFFECTS[kind].mechanism).toBe("glow");
    }
  });

  it("spin/rainbowはconicRing機構", () => {
    for (const kind of ["spin", "rainbow"] as const) {
      expect(BORDER_EFFECTS[kind].mechanism).toBe("conicRing");
    }
  });

  it("ring/ants/shineはclass機構で、それぞれ異なるclassNameを持つ", () => {
    const classNames = new Set<string>();
    for (const kind of ["ring", "ants", "shine"] as const) {
      const spec = BORDER_EFFECTS[kind];
      expect(spec.mechanism).toBe("class");
      if (spec.mechanism === "class") classNames.add(spec.className);
    }
    expect(classNames.size).toBe(3);
  });

  it("glow機構のpreset()を呼ぶと、対応するmechanismを自己申告するプリセットが返る", () => {
    const spec = BORDER_EFFECTS.neon;
    if (spec.mechanism !== "glow") throw new Error("expected glow");
    expect(spec.preset().mechanism).toBe("glow");
  });
});
