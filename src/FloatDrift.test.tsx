import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FloatDrift } from "./FloatDrift";

describe("FloatDrift", () => {
  it("glyphを省略するとCSSで描いた雲形（celebrate-float-cloud）になる", () => {
    const html = renderToStaticMarkup(<FloatDrift />);
    expect(html).toContain("celebrate-float-cloud");
    expect(html).toContain('data-float-drift="cloud"');
    // puffが4つ（celebrate-float-puff--1〜4）
    expect((html.match(/celebrate-float-puff--/g) ?? []).length).toBe(4);
  });

  it("glyphを渡すとその文字がそのまま表示される（雲形は描かれない）", () => {
    const html = renderToStaticMarkup(<FloatDrift glyph="〜" />);
    expect(html).toContain(">〜<");
    expect(html).toContain('data-float-drift="〜"');
    expect(html).not.toContain("celebrate-float-cloud");
  });
});
