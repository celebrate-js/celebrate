import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ShatterScreen } from "./ShatterScreen";

describe("ShatterScreen", () => {
  it("viewport撮影用のCanvasを描画する", () => {
    const html = renderToStaticMarkup(<ShatterScreen seed={1} />);
    expect(html).toContain("celebrate-shatter-snapshot-source");
  });

  it("SSRでは撮影を走らせず、同じseedなら同じ静的マークアップになる", () => {
    const a = renderToStaticMarkup(<ShatterScreen seed={7} />);
    const b = renderToStaticMarkup(<ShatterScreen seed={7} />);
    expect(a).toBe(b);
  });
});
