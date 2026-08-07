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

  it("kikuスタイルは点ではなく線（celebrate-firework-particle--streak）で描画する", () => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} style="kiku" />);
    expect(html).toContain("celebrate-firework-particle--streak");
  });

  it("peony等の他スタイルは線を使わない", () => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} style="peony" />);
    expect(html).not.toContain("celebrate-firework-particle--streak");
  });

  it.each(["star", "senrin", "hachi"] as const)("style='%s'もshellの数ぶん描画される", (style) => {
    const html = renderToStaticMarkup(<FireworkBurst seed={1} style={style} />);
    expect((html.match(/celebrate-firework-shell/g) ?? []).length).toBe(FIREWORK_SHELL_COUNT);
    expect(html).toContain(`data-firework-burst="${style}"`);
  });
});
