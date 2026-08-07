import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PopupText } from "./PopupText";

describe("PopupText", () => {
  it("渡したtextをそのまま表示する", () => {
    const html = renderToStaticMarkup(<PopupText text="+1" />);
    expect(html).toContain(">+1<");
    expect(html).toContain('data-popup-text="+1"');
    expect(html).toContain("celebrate-popup-text");
  });
});
