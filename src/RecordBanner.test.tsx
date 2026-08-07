import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RecordBanner } from "./RecordBanner";

describe("RecordBanner", () => {
  it("textを表示する", () => {
    const html = renderToStaticMarkup(<RecordBanner text="新記録" />);
    expect(html).toContain("新記録");
    expect(html).toContain('data-record-banner="新記録"');
  });

  it("noteを省略すると添え文が描画されない", () => {
    const html = renderToStaticMarkup(<RecordBanner text="新記録" />);
    expect(html).not.toContain("celebrate-record-banner-note");
  });

  it("noteを渡すとその下に添え文が描画される", () => {
    const html = renderToStaticMarkup(<RecordBanner text="新記録" note="れんぞく 7問" />);
    expect(html).toContain("celebrate-record-banner-note");
    expect(html).toContain("れんぞく 7問");
  });

  it("theme.recordColor/recordBackgroundを省略するとstampColor/透明にフォールバックする", () => {
    const html = renderToStaticMarkup(<RecordBanner text="新記録" />);
    expect(html).toContain("--celebrate-record-bg:transparent");
  });
});
