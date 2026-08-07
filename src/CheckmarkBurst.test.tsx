import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CheckmarkBurst } from "./CheckmarkBurst";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

describe("CheckmarkBurst", () => {
  it("円とチェックの2本のstroke-path（StrokePath）を描画する", () => {
    const html = renderToStaticMarkup(<CheckmarkBurst />);
    expect(html).toContain("celebrate-checkmark");
    expect(html).toContain('data-checkmark-burst=""');
    expect((html.match(/celebrate-stroke-path/g) ?? []).length).toBeGreaterThan(0);
  });

  it("themeのstampColorが円・チェックどちらの色にも使われる（--celebrate-stroke-color）", () => {
    const html = renderToStaticMarkup(<CheckmarkBurst theme={{ ...DEFAULT_CELEBRATE_THEME, stampColor: "#00ff00" }} />);
    expect((html.match(/--celebrate-stroke-color:#00ff00/g) ?? []).length).toBe(2);
  });
});
