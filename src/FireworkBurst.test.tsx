import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FireworkBurst } from "./FireworkBurst";
import { FIREWORK_SHELL_COUNT } from "./firework";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

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
});
