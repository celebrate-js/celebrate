import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CrackerBurst } from "./CrackerBurst";
import { CRACKER_STREAMER_COUNT } from "./cracker";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

describe("CrackerBurst", () => {
  it("streamerの本数ぶんの粒（celebrate-cracker-streamer）を描画する", () => {
    const html = renderToStaticMarkup(<CrackerBurst seed={1} />);
    expect((html.match(/celebrate-cracker-streamer/g) ?? []).length).toBe(CRACKER_STREAMER_COUNT);
  });

  it("同じseedなら同じ見た目になる", () => {
    const a = renderToStaticMarkup(<CrackerBurst seed={3} />);
    const b = renderToStaticMarkup(<CrackerBurst seed={3} />);
    expect(a).toBe(b);
  });

  it("colorsを渡すとtheme.confettiColorsではなくそちらの色が使われる", () => {
    const html = renderToStaticMarkup(<CrackerBurst seed={1} colors={["#ff00aa"]} />);
    expect(html).toContain("#ff00aa");
    expect(html).not.toContain(DEFAULT_CELEBRATE_THEME.confettiColors[0]);
  });
});
