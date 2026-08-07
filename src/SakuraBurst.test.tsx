import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SakuraBurst } from "./SakuraBurst";
import { SAKURA_PETAL_COUNT } from "./sakura";

describe("SakuraBurst", () => {
  it("既定枚数の花びら（celebrate-sakura-petal）を描画する", () => {
    const html = renderToStaticMarkup(<SakuraBurst seed={1} />);
    expect((html.match(/celebrate-sakura-petal/g) ?? []).length).toBe(SAKURA_PETAL_COUNT);
  });

  it("同じseedなら同じ見た目になる", () => {
    const a = renderToStaticMarkup(<SakuraBurst seed={9} />);
    const b = renderToStaticMarkup(<SakuraBurst seed={9} />);
    expect(a).toBe(b);
  });

  it("colorを省略すると既定の淡いピンクになる", () => {
    const html = renderToStaticMarkup(<SakuraBurst seed={1} />);
    expect(html).toContain("#f4b6c2");
  });

  it("colorを渡すとその色が使われる", () => {
    const html = renderToStaticMarkup(<SakuraBurst seed={1} color="#00aaff" />);
    expect(html).toContain("#00aaff");
    expect(html).not.toContain("#f4b6c2");
  });
});
