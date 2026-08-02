// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RadialBurst, RadialBurstLayer } from "./RadialBurst";
import type { RadialLayer } from "./radialLayers";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const LAYERS: readonly RadialLayer[] = [
  { shape: "outline", scaleFrom: 0.3, scaleTo: 2, size: 2, delayMs: 0 },
  { shape: "outline", scaleFrom: 0.3, scaleTo: 2.5, size: 1.5, delayMs: 150 },
];

describe("RadialBurst", () => {
  it("layers propと<RadialBurstLayer/>の子要素は同じマークアップを出力する", () => {
    const viaProp = renderToStaticMarkup(<RadialBurst layers={LAYERS} />);
    const viaChildren = renderToStaticMarkup(
      <RadialBurst>
        <RadialBurstLayer shape="outline" scaleFrom={0.3} scaleTo={2} size={2} delayMs={0} />
        <RadialBurstLayer shape="outline" scaleFrom={0.3} scaleTo={2.5} size={1.5} delayMs={150} />
      </RadialBurst>
    );
    expect(viaChildren).toBe(viaProp);
  });

  it("layer数だけ.celebrate-radial要素を出力する", () => {
    const html = renderToStaticMarkup(<RadialBurst layers={LAYERS} />);
    const count = (html.match(/celebrate-radial--/g) ?? []).length;
    expect(count).toBe(LAYERS.length);
  });

  it("<RadialBurstLayer/>以外の子要素は無視する（クラッシュしない）", () => {
    const html = renderToStaticMarkup(
      <RadialBurst>
        <RadialBurstLayer shape="fill" scaleFrom={0} scaleTo={1} size={1} />
        <span>これはRadialBurstLayerではない</span>
      </RadialBurst>
    );
    const count = (html.match(/celebrate-radial--/g) ?? []).length;
    expect(count).toBe(1);
  });

  it("layersを渡さず子要素も無ければ何も描かない", () => {
    const html = renderToStaticMarkup(<RadialBurst />);
    expect(html).not.toContain("celebrate-radial--");
  });

  it("scaleはlayerのsize（rem）にだけ掛かり、scaleFrom/scaleToは変えない", () => {
    const html = renderToStaticMarkup(
      <RadialBurst layers={[{ shape: "fill", scaleFrom: 0.3, scaleTo: 2, size: 2 }]} scale={1.5} />
    );
    expect(html).toContain("--celebrate-radial-size:3rem");
    expect(html).toContain("--celebrate-radial-scale-to:2");
  });

  it("colorはlayer自身のcolorが優先され、無ければRadialBurstのcolorが使われる", () => {
    const withLayerColor = renderToStaticMarkup(
      <RadialBurst layers={[{ shape: "fill", scaleFrom: 0, scaleTo: 1, size: 1, color: "#111" }]} color="#222" />
    );
    expect(withLayerColor).toContain("--celebrate-radial-color:#111");

    const withoutLayerColor = renderToStaticMarkup(
      <RadialBurst layers={[{ shape: "fill", scaleFrom: 0, scaleTo: 1, size: 1 }]} color="#222" />
    );
    expect(withoutLayerColor).toContain("--celebrate-radial-color:#222");
  });
});

describe("RadialBurst（origin＝原点移動、軸B）", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    (Element.prototype as unknown as { animate: (...args: unknown[]) => Animation }).animate = vi.fn(
      () => ({ cancel: vi.fn() }) as unknown as Animation
    );
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("originを指定しなければWeb Animations APIを呼ばない（従来通り原点固定）", () => {
    act(() => {
      root.render(<RadialBurst layers={LAYERS} />);
    });
    expect(Element.prototype.animate).not.toHaveBeenCalled();
  });

  it("originを2点以上指定するとWeb Animations APIでキーフレーム通りに動かす", () => {
    act(() => {
      root.render(
        <RadialBurst
          layers={LAYERS}
          origin={[
            { offset: 0, xRem: 0, yRem: 0 },
            { offset: 1, xRem: 5, yRem: -3 },
          ]}
          originDurationMs={600}
        />
      );
    });
    expect(Element.prototype.animate).toHaveBeenCalledTimes(1);
    const calls = (Element.prototype.animate as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    const [keyframes, options] = calls[0] as [{ offset: number; transform: string }[], { duration: number }];
    expect(keyframes).toEqual([
      { offset: 0, transform: "translate(0rem, 0rem)" },
      { offset: 1, transform: "translate(5rem, -3rem)" },
    ]);
    expect(options.duration).toBe(600);
  });

  it("origin未指定時は.celebrate-radial-originラッパーにtransformを設定しない（静止）", () => {
    const html = renderToStaticMarkup(<RadialBurst layers={LAYERS} />);
    expect(html).not.toContain('style="transform');
  });
});
