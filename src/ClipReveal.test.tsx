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

  it("durationMs/delayMs/colorがstyleに反映される", () => {
    const html = renderToStaticMarkup(<ClipReveal durationMs={800} delayMs={100} color="#0f0" />);
    expect(html).toContain("animation-duration:800ms");
    expect(html).toContain("animation-delay:100ms");
    expect(html).toContain("--celebrate-clip-reveal-color:#0f0");
  });
});
