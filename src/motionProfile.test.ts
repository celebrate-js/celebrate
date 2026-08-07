import { describe, expect, it } from "vitest";
import {
  radialMotion,
  ballisticMotion,
  fallMotion,
  staticScaleMotion,
  orbitTwinkleMotion,
  MOTION_PROFILES,
} from "./motionProfile";

describe("radialMotion", () => {
  it("t=0では原点・不透明・無回転", () => {
    const state = radialMotion(0, { angleRad: 0, speed: 5, durationSeconds: 1 });
    expect(state).toEqual({ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 });
  });

  it("durationSeconds経過でopacityが0になる（それ以上進んでも0未満にはならない）", () => {
    const params = { angleRad: 0, speed: 5, durationSeconds: 1 };
    expect(radialMotion(1, params).opacity).toBeCloseTo(0, 10);
    expect(radialMotion(5, params).opacity).toBeCloseTo(0, 10);
  });

  it("等速直線運動（重力なし）：速度*時間の距離だけ進む", () => {
    const state = radialMotion(2, { angleRad: Math.PI / 2, speed: 3, durationSeconds: 10 });
    expect(state.x).toBeCloseTo(0, 10);
    expect(state.y).toBeCloseTo(6, 10);
  });
});

describe("ballisticMotion", () => {
  it("放物線：重力によってyがballisticPositionAtと同じ式で進む", () => {
    const params = { angleRad: -Math.PI / 4, speed: 6, gravity: 12, durationSeconds: 2 };
    const state = ballisticMotion(1, params);
    const vy = Math.sin(params.angleRad) * params.speed;
    expect(state.y).toBeCloseTo(vy * 1 + 0.5 * params.gravity * 1, 10);
  });

  it("進行につれてscaleが縮み、rotateが増える", () => {
    const params = { angleRad: 0, speed: 1, gravity: 1, durationSeconds: 2 };
    const early = ballisticMotion(0.2, params);
    const late = ballisticMotion(1.8, params);
    expect(late.scale).toBeLessThan(early.scale);
    expect(late.rotate).toBeGreaterThan(early.rotate);
  });
});

describe("fallMotion", () => {
  it("startX省略時は0起点、swayAmplitude省略時は横揺れ無し", () => {
    const state = fallMotion(0.5, { fallSpeed: 4, durationSeconds: 2 });
    expect(state.x).toBe(0);
  });

  it("fallSpeed*tだけ下に落ちる", () => {
    const state = fallMotion(1.5, { fallSpeed: 4, durationSeconds: 3 });
    expect(state.y).toBeCloseTo(6, 10);
  });

  it("progress85%まではopacity1、その先で1へ向けて消える", () => {
    const params = { fallSpeed: 1, durationSeconds: 10 };
    expect(fallMotion(8, params).opacity).toBe(1); // progress=0.8
    expect(fallMotion(10, params).opacity).toBeCloseTo(0, 10); // progress=1.0
  });
});

describe("staticScaleMotion", () => {
  it("t=0でscaleFrom、durationSeconds経過でscaleToになる", () => {
    const params = { scaleFrom: 0.5, scaleTo: 2, durationSeconds: 1 };
    expect(staticScaleMotion(0, params).scale).toBeCloseTo(0.5, 10);
    expect(staticScaleMotion(1, params).scale).toBeCloseTo(2, 10);
  });

  it("その場に留まる（x/yは常に0）", () => {
    const state = staticScaleMotion(0.5, { scaleFrom: 1, scaleTo: 2, durationSeconds: 1 });
    expect(state.x).toBe(0);
    expect(state.y).toBe(0);
  });
});

describe("orbitTwinkleMotion", () => {
  it("radiusを保った円周上を周回する", () => {
    const params = { radius: 5, angularSpeed: 1, startAngleRad: 0 };
    const state = orbitTwinkleMotion(1, params);
    expect(Math.hypot(state.x, state.y)).toBeCloseTo(5, 10);
  });

  it("t=0はstartAngleRadの位置から始まる", () => {
    const state = orbitTwinkleMotion(0, { radius: 2, angularSpeed: 1, startAngleRad: Math.PI / 2 });
    expect(state.x).toBeCloseTo(0, 10);
    expect(state.y).toBeCloseTo(2, 10);
  });
});

describe("MOTION_PROFILES（名前付きレジストリ）", () => {
  it("5種類の名前がそれぞれの実体関数と一致する", () => {
    expect(MOTION_PROFILES.radial).toBe(radialMotion);
    expect(MOTION_PROFILES.ballistic).toBe(ballisticMotion);
    expect(MOTION_PROFILES.fall).toBe(fallMotion);
    expect(MOTION_PROFILES.staticScale).toBe(staticScaleMotion);
    expect(MOTION_PROFILES.orbitTwinkle).toBe(orbitTwinkleMotion);
  });
});
