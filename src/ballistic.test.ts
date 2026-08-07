import { describe, expect, it } from "vitest";
import { ballisticPositionAt } from "./ballistic";

describe("ballisticPositionAt", () => {
  it("t=0では発射位置（原点）のまま", () => {
    const pos = ballisticPositionAt({ angleRad: -Math.PI / 4, speed: 10, gravity: 20 }, 0);
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
  });

  it("重力ゼロ・水平発射なら等速直線運動（xだけ増え、yは動かない）", () => {
    const pos = ballisticPositionAt({ angleRad: 0, speed: 5, gravity: 0 }, 2);
    expect(pos.x).toBeCloseTo(10, 10);
    expect(pos.y).toBeCloseTo(0, 10);
  });

  it("真下方向（角度90deg）・初速ゼロなら自由落下の式(1/2*g*t^2)に一致する", () => {
    const pos = ballisticPositionAt({ angleRad: Math.PI / 2, speed: 0, gravity: 9.8 }, 3);
    expect(pos.x).toBeCloseTo(0, 10);
    expect(pos.y).toBeCloseTo(0.5 * 9.8 * 9, 10);
  });

  it("負の経過時間は0として扱う（巻き戻しても発射位置より前には行かない）", () => {
    const params = { angleRad: -Math.PI / 3, speed: 8, gravity: 15 };
    expect(ballisticPositionAt(params, -5)).toEqual(ballisticPositionAt(params, 0));
  });

  it("斜方投射の閉形式（vx*t, vy*t + 1/2*g*t^2）と一致する", () => {
    const angleRad = -Math.PI / 6;
    const speed = 12;
    const gravity = 18;
    const t = 1.4;
    const pos = ballisticPositionAt({ angleRad, speed, gravity }, t);
    const vx = Math.cos(angleRad) * speed;
    const vy = Math.sin(angleRad) * speed;
    expect(pos.x).toBeCloseTo(vx * t, 10);
    expect(pos.y).toBeCloseTo(vy * t + 0.5 * gravity * t * t, 10);
  });
});
