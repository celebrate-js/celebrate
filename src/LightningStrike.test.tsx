import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LightningStrike } from "./LightningStrike";

describe("LightningStrike", () => {
  it("本体と枝分かれの2本のstroke-pathとフラッシュ層を描画する", () => {
    const html = renderToStaticMarkup(<LightningStrike seed={1} />);
    expect(html).toContain('data-lightning-strike=""');
    expect((html.match(/celebrate-stroke-path/g) ?? []).length).toBeGreaterThan(0);
    expect(html).toContain("celebrate-lightning-strike-flash");
  });

  it("同じseedなら同じ経路になる", () => {
    const a = renderToStaticMarkup(<LightningStrike seed={2} />);
    const b = renderToStaticMarkup(<LightningStrike seed={2} />);
    expect(a).toBe(b);
  });
});
