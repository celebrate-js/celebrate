import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Celebrate } from "./Celebrate";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

describe("Celebrate（宣言的API。その場に描画するだけで音・振動は鳴らさない）", () => {
  it("登録済みのvariant名を渡すと対応する見た目が描画される", () => {
    const html = renderToStaticMarkup(<Celebrate variant="stamp" text="合格" />);
    expect(html).toContain("celebrate-stamp");
    expect(html).toContain("合格");
  });

  it("Providerの外でもDEFAULT_CELEBRATE_THEMEにフォールバックしてクラッシュしない", () => {
    expect(() => renderToStaticMarkup(<Celebrate variant="stamp" text="正" />)).not.toThrow();
  });

  it("themeを明示的に渡せばそちらが使われる", () => {
    const html = renderToStaticMarkup(
      <Celebrate variant="stamp" text="正" theme={{ ...DEFAULT_CELEBRATE_THEME, stampColor: "#654321" }} />
    );
    expect(html).toContain("#654321");
  });
});
