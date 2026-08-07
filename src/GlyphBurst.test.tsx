import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { GlyphBurst } from "./GlyphBurst";

const GLYPHS = ["♥", "★"] as const;

describe("GlyphBurst", () => {
  it("既定個数の粒（celebrate-glyph-particle）を描画する", () => {
    const html = renderToStaticMarkup(<GlyphBurst glyphs={GLYPHS} seed={1} />);
    expect((html.match(/celebrate-glyph-particle/g) ?? []).length).toBe(8);
  });

  it("countを指定すればその数だけ描画する", () => {
    const html = renderToStaticMarkup(<GlyphBurst glyphs={GLYPHS} count={3} seed={1} />);
    expect((html.match(/data-glyph-particle=""/g) ?? []).length).toBe(3);
  });

  it("同じseedなら同じ見た目（HTML）になる", () => {
    const a = renderToStaticMarkup(<GlyphBurst glyphs={GLYPHS} seed={5} />);
    const b = renderToStaticMarkup(<GlyphBurst glyphs={GLYPHS} seed={5} />);
    expect(a).toBe(b);
  });

  it("colorを渡すと粒の文字色に反映される", () => {
    const html = renderToStaticMarkup(<GlyphBurst glyphs={GLYPHS} color="#ff00ff" seed={1} count={1} />);
    expect(html).toContain("color:#ff00ff");
  });
});
