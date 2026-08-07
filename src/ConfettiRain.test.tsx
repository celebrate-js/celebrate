import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ConfettiRain } from "./ConfettiRain";
import { RAIN_PIECE_COUNT } from "./rain";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

describe("ConfettiRain", () => {
  it("画面幅いっぱいに降る粒（celebrate-rain-drop）を規定数描画する", () => {
    const html = renderToStaticMarkup(<ConfettiRain seed={1} />);
    expect((html.match(/celebrate-rain-drop/g) ?? []).length).toBe(RAIN_PIECE_COUNT);
  });

  it("同じseedなら同じ見た目になる", () => {
    const a = renderToStaticMarkup(<ConfettiRain seed={2} />);
    const b = renderToStaticMarkup(<ConfettiRain seed={2} />);
    expect(a).toBe(b);
  });

  it("colorsを渡すとtheme.confettiColorsではなくそちらの色が使われる", () => {
    const html = renderToStaticMarkup(<ConfettiRain seed={1} colors={["#123abc"]} />);
    expect(html).toContain("#123abc");
    expect(html).not.toContain(DEFAULT_CELEBRATE_THEME.confettiColors[1]);
  });
});
