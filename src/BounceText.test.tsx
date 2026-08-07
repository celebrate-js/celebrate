import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BounceText } from "./BounceText";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

describe("BounceText", () => {
  it("渡したtextをそのまま表示する", () => {
    const html = renderToStaticMarkup(<BounceText text="Nice!" />);
    expect(html).toContain("Nice!");
    expect(html).toContain("celebrate-bounce-text");
    expect(html).toContain('data-bounce-text="Nice!"');
  });

  it("themeのstampColor/stampFontがCSS変数に反映される", () => {
    const html = renderToStaticMarkup(
      <BounceText text="Nice!" theme={{ ...DEFAULT_CELEBRATE_THEME, stampColor: "#123456", stampFont: "serif" }} />
    );
    expect(html).toContain("--celebrate-bounce-color:#123456");
    expect(html).toContain("--celebrate-stamp-font:serif");
  });

  it("classNameを追加で渡せる", () => {
    const html = renderToStaticMarkup(<BounceText text="Nice!" className="extra" />);
    expect(html).toContain("celebrate-bounce-text extra");
  });
});
