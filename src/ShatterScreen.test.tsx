import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ShatterScreen } from "./ShatterScreen";
import { SHATTER_SHARD_COUNT } from "./shatter";

describe("ShatterScreen", () => {
  it("破片の数ぶんの要素（celebrate-shatter-shard）を描画する", () => {
    const html = renderToStaticMarkup(<ShatterScreen seed={1} />);
    expect((html.match(/celebrate-shatter-shard/g) ?? []).length).toBe(SHATTER_SHARD_COUNT);
  });

  it("同じseedなら同じ見た目になる", () => {
    const a = renderToStaticMarkup(<ShatterScreen seed={7} />);
    const b = renderToStaticMarkup(<ShatterScreen seed={7} />);
    expect(a).toBe(b);
  });
});
