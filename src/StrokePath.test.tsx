import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { StrokePath, type StrokeLine } from "./StrokePath";

describe("StrokePath", () => {
  it("linesの本数だけpolylineを出力する（lightningは2本、shatterは7本相当）", () => {
    const lines: StrokeLine[] = [
      { points: "0,0 10,10", strokeWidth: 4, dashLength: 200, durationMs: 200 },
      { points: "5,5 15,15", strokeWidth: 2.2, dashLength: 60, durationMs: 150 },
    ];
    const html = renderToStaticMarkup(<StrokePath lines={lines} />);
    const count = (html.match(/<polyline/g) ?? []).length;
    expect(count).toBe(2);
  });

  it("glowが'electric'/'soft'/未指定でクラスが変わる", () => {
    const electric = renderToStaticMarkup(
      <StrokePath lines={[{ points: "0,0 1,1", strokeWidth: 1, dashLength: 10, durationMs: 100, glow: "electric" }]} />
    );
    const soft = renderToStaticMarkup(
      <StrokePath lines={[{ points: "0,0 1,1", strokeWidth: 1, dashLength: 10, durationMs: 100, glow: "soft" }]} />
    );
    const none = renderToStaticMarkup(
      <StrokePath lines={[{ points: "0,0 1,1", strokeWidth: 1, dashLength: 10, durationMs: 100 }]} />
    );
    expect(electric).toContain("celebrate-stroke-path--glow-electric");
    expect(soft).toContain("celebrate-stroke-path--glow-soft");
    expect(none).not.toContain("celebrate-stroke-path--glow-electric");
    expect(none).not.toContain("celebrate-stroke-path--glow-soft");
  });

  it("既定のviewBoxは0 0 100 100", () => {
    const html = renderToStaticMarkup(<StrokePath lines={[]} />);
    expect(html).toContain('viewBox="0 0 100 100"');
  });

  it("viewBoxを上書きできる", () => {
    const html = renderToStaticMarkup(<StrokePath lines={[]} viewBox="0 0 50 50" />);
    expect(html).toContain('viewBox="0 0 50 50"');
  });
});
