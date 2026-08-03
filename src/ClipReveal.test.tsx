import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ClipReveal } from "./ClipReveal";

describe("ClipReveal", () => {
  it("既定はedge=left、directionクラスは付かない（in扱い）", () => {
    const html = renderToStaticMarkup(<ClipReveal />);
    expect(html).toContain("celebrate-clip-reveal--left");
    expect(html).not.toContain("celebrate-clip-reveal--out");
  });

  it("direction='out'で逆再生クラスが付く", () => {
    const html = renderToStaticMarkup(<ClipReveal direction="out" />);
    expect(html).toContain("celebrate-clip-reveal--out");
  });

  it("edgeごとにクラスが変わる", () => {
    for (const edge of ["left", "right", "top", "bottom", "center"] as const) {
      const html = renderToStaticMarkup(<ClipReveal edge={edge} />);
      expect(html).toContain(`celebrate-clip-reveal--${edge}`);
    }
  });

  it("childrenをそのまま覆いの下に描画する", () => {
    const html = renderToStaticMarkup(
      <ClipReveal>
        <img src="result.png" alt="" />
      </ClipReveal>
    );
    expect(html).toContain("result.png");
  });

  it("childrenとカーテンは別要素になっている（同じ要素にclip-pathを当てると両方一緒に切り取られてしまうため）", () => {
    const html = renderToStaticMarkup(
      <ClipReveal>
        <img src="result.png" alt="" />
      </ClipReveal>
    );
    // result.pngは celebrate-clip-reveal-content の中、
    // celebrate-clip-reveal（clip-pathが当たる方）の中には無い。
    const contentIndex = html.indexOf("celebrate-clip-reveal-content");
    const curtainIndex = html.indexOf('"celebrate-clip-reveal celebrate-clip-reveal--left"');
    const imgIndex = html.indexOf("result.png");
    expect(contentIndex).toBeGreaterThan(-1);
    expect(curtainIndex).toBeGreaterThan(-1);
    // childrenを包む要素の方が先（DOM順で先＝下に描画される）、カーテンは後（上に重なる）。
    expect(contentIndex).toBeLessThan(curtainIndex);
    // imgはcontentの中にあり、カーテン要素の外側。
    expect(imgIndex).toBeGreaterThan(contentIndex);
    expect(imgIndex).toBeLessThan(curtainIndex);
  });

  it("childrenを省略すると celebrate-clip-reveal-content は描画されない", () => {
    const html = renderToStaticMarkup(<ClipReveal />);
    expect(html).not.toContain("celebrate-clip-reveal-content");
  });

  it("durationMs/delayMs/colorがstyleに反映される", () => {
    const html = renderToStaticMarkup(<ClipReveal durationMs={800} delayMs={100} color="#0f0" />);
    expect(html).toContain("animation-duration:800ms");
    expect(html).toContain("animation-delay:100ms");
    expect(html).toContain("--celebrate-clip-reveal-color:#0f0");
  });
});
