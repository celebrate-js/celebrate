import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FireworkBurst,
  withHoldThenFade,
  withVelocityAlignedRotation,
  withOriginOffset,
  withFlicker,
} from "./FireworkBurst";
import { FIREWORK_SHELL_COUNT } from "./firework";
import { DEFAULT_CELEBRATE_THEME } from "./theme";
import { ballisticMotion } from "./motionProfile";

describe("FireworkBurst", () => {
  it("shellの数ぶんの破裂点（celebrate-firework-shell）を描画する", () => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} />);
    expect((html.match(/celebrate-firework-shell/g) ?? []).length).toBe(FIREWORK_SHELL_COUNT);
  });

  it("styleがdata属性に反映される（既定peony）", () => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} />);
    expect(html).toContain('data-firework-burst="peony"');
    const willowHtml = renderToStaticMarkup(<FireworkBurst seed={1} style="willow" />);
    expect(willowHtml).toContain('data-firework-burst="willow"');
  });

  it("同じseed・同じstyleなら同じ見た目になる", () => {
    const a = renderToStaticMarkup(<FireworkBurst seed={4} style="ring" />);
    const b = renderToStaticMarkup(<FireworkBurst seed={4} style="ring" />);
    expect(a).toBe(b);
  });

  it("colorsを渡すとtheme.confettiColorsではなくそちらの色が使われる", () => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} colors={["#ff8800"]} />);
    expect(html).toContain("#ff8800");
    expect(html).not.toContain(DEFAULT_CELEBRATE_THEME.confettiColors[0]);
  });

  it.each(["kiku", "willow"] as const)(
    "style='%s'は点ではなく線（celebrate-firework-particle--streak）で描画する",
    (style) => {
      const html = renderToStaticMarkup(<FireworkBurst seed={1} style={style} />);
      expect(html).toContain("celebrate-firework-particle--streak");
    }
  );

  it("peony等の他スタイルは線を使わない", () => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} style="peony" />);
    expect(html).not.toContain("celebrate-firework-particle--streak");
  });

  it("willowの線はkikuと違い、要素自体にはtransform:rotateを持たない（親のrotateに従うため）", () => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} style="willow" />);
    // kikuはtransform:rotate(...)をインラインstyleに持つが、willowは持たない
    // （親のstate.rotateが速度ベクトル由来で毎フレーム変わるのに任せる設計のため）。
    const streakStyleMatch = html.match(/celebrate-firework-particle--streak"[^>]*style="([^"]*)"/);
    expect(streakStyleMatch?.[1]).not.toContain("rotate");
  });

  it.each(["star", "senrin", "hachi"] as const)("style='%s'もshellの数ぶん描画される", (style) => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} style={style} />);
    expect((html.match(/celebrate-firework-shell/g) ?? []).length).toBe(FIREWORK_SHELL_COUNT);
    expect(html).toContain(`data-firework-burst="${style}"`);
  });
});

// ブラウザのプレビュー環境ではrequestAnimationFrameが不安定・停止することがあり、
// アニメーション中の状態（opacity/transformの経時変化）をライブDOMで確認できない
// （motionProfile.test.tsと同じ理由でmotion関数自体を直接テストする）。
describe("firework style用のMotionProfileラッパー（純関数として直接検証）", () => {
  const params = { angleRad: 0, speed: 10, gravity: 20, durationSeconds: 1 };

  describe("withHoldThenFade（star：形を保ったまま留まってから消える）", () => {
    it("holdProgress未満ではopacityが常に1", () => {
      const motion = withHoldThenFade(ballisticMotion, 0.4, 0.6);
      expect(motion(0, params).opacity).toBe(1);
      expect(motion(0.3, params).opacity).toBe(1);
      expect(motion(0.59, params).opacity).toBe(1);
    });

    it("holdProgress以降はopacityが単調に下がり、durationSecondsでちょうど0になる", () => {
      const motion = withHoldThenFade(ballisticMotion, 0.4, 0.6);
      const mid = motion(0.8, params).opacity;
      const end = motion(1, params).opacity;
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(1);
      expect(end).toBeCloseTo(0, 10);
      expect(end).toBeLessThan(mid);
    });

    it("freezeProgress以降は位置（x/y）の計算がそれ以上進まない（形が崩れない）", () => {
      const motion = withHoldThenFade(ballisticMotion, 0.4, 0.6);
      const atFreeze = motion(0.4, params);
      const wellAfterFreeze = motion(0.9, params);
      expect(wellAfterFreeze.x).toBeCloseTo(atFreeze.x, 10);
      expect(wellAfterFreeze.y).toBeCloseTo(atFreeze.y, 10);
    });
  });

  describe("withVelocityAlignedRotation（willow：線の向きを速度ベクトルに合わせる）", () => {
    it("t=0では発射角度そのものが向き（deg）になる", () => {
      const motion = withVelocityAlignedRotation(ballisticMotion);
      const horizontalParams = { ...params, angleRad: 0 };
      expect(motion(0, horizontalParams).rotate).toBeCloseTo(0, 10);
    });

    it("時間経過とともに重力でy方向速度が増え、下向き（角度が増える方向）に傾いていく", () => {
      const motion = withVelocityAlignedRotation(ballisticMotion);
      const early = motion(0.1, params).rotate;
      const late = motion(0.8, params).rotate;
      expect(late).toBeGreaterThan(early);
    });

    it("速度ベクトルの角度（atan2）と厳密に一致する", () => {
      const motion = withVelocityAlignedRotation(ballisticMotion);
      const t = 0.5;
      const vx = Math.cos(params.angleRad) * params.speed;
      const vy = Math.sin(params.angleRad) * params.speed + params.gravity * t;
      const expectedDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
      expect(motion(t, params).rotate).toBeCloseTo(expectedDeg, 10);
    });
  });

  describe("withOriginOffset（senrin：クラスタ中心のオフセットを足し込む）", () => {
    it("x/yに指定したオフセットがそのまま加算される", () => {
      const motion = withOriginOffset(ballisticMotion, 2.5, -1.5);
      const base = ballisticMotion(0.3, params);
      const offset = motion(0.3, params);
      expect(offset.x).toBeCloseTo(base.x + 2.5, 10);
      expect(offset.y).toBeCloseTo(base.y - 1.5, 10);
    });
  });

  describe("withFlicker（hachi：消えるまでチカチカ明滅する）", () => {
    it("opacityが基準のballisticMotionの値を超えない（掛け算のため）", () => {
      const motion = withFlicker(ballisticMotion);
      for (let t = 0; t < 1; t += 0.05) {
        expect(motion(t, params).opacity).toBeLessThanOrEqual(ballisticMotion(t, params).opacity + 1e-10);
      }
    });

    it("時間経過でopacityが一定ではなく変動する（明滅している）", () => {
      const motion = withFlicker(ballisticMotion);
      const values = Array.from({ length: 10 }, (_, i) => motion(i * 0.05, params).opacity);
      expect(new Set(values.map((v) => v.toFixed(4))).size).toBeGreaterThan(1);
    });
  });
});
