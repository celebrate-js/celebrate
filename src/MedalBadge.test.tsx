import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MedalBadge } from "./MedalBadge";

describe("MedalBadge", () => {
  it("既定のtextは★", () => {
    const html = renderToStaticMarkup(<MedalBadge />);
    expect(html).toContain(">★<");
    expect(html).toContain('data-medal-badge="★"');
  });

  it("textを渡せばそれが表示される", () => {
    const html = renderToStaticMarkup(<MedalBadge text="1" />);
    expect(html).toContain(">1<");
    expect(html).toContain('data-medal-badge="1"');
  });

  it("celebrate-medal・celebrate-enter-settleクラスを持つ", () => {
    const html = renderToStaticMarkup(<MedalBadge />);
    expect(html).toContain("celebrate-medal");
    expect(html).toContain("celebrate-enter-settle");
  });
});
