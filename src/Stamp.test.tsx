import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Stamp } from "./Stamp";

function fontSizeRemOf(html: string): number {
  const match = html.match(/font-size:([\d.]+)rem/);
  if (!match) throw new Error(`font-size not found in: ${html}`);
  return Number(match[1]);
}

describe("Stamp（想定より長いtextでも円からはみ出さない）", () => {
  it("想定内（2文字以下）なら既定のフォントサイズのまま", () => {
    const html = renderToStaticMarkup(<Stamp text="正" />);
    expect(fontSizeRemOf(html)).toBe(1.1);
    const htmlTwoChars = renderToStaticMarkup(<Stamp text="合格" />);
    expect(fontSizeRemOf(htmlTwoChars)).toBe(1.1);
  });

  it("想定を超える文字数だとフォントサイズが縮む", () => {
    const html = renderToStaticMarkup(<Stamp text="123456" />);
    expect(fontSizeRemOf(html)).toBeLessThan(1.1);
  });

  it("文字数が多いほどさらに縮む（単調減少）", () => {
    const short = fontSizeRemOf(renderToStaticMarkup(<Stamp text="1234" />));
    const long = fontSizeRemOf(renderToStaticMarkup(<Stamp text="123456789012" />));
    expect(long).toBeLessThan(short);
  });

  it("どれだけ長くても最小スケールで下げ止まる（0にはならない）", () => {
    const html = renderToStaticMarkup(<Stamp text={"あ".repeat(200)} />);
    expect(fontSizeRemOf(html)).toBeGreaterThan(0);
    expect(fontSizeRemOf(html)).toBeGreaterThanOrEqual(1.1 * 0.45);
  });

  it("size='lg'でも同じ縮小ロジックが基準サイズ1.6remに対して働く", () => {
    const html = renderToStaticMarkup(<Stamp text="正" size="lg" />);
    expect(fontSizeRemOf(html)).toBe(1.6);
    const longHtml = renderToStaticMarkup(<Stamp text="123456" size="lg" />);
    expect(fontSizeRemOf(longHtml)).toBeLessThan(1.6);
  });
});

describe("Stamp（rotateDegで傾きを上書きできる）", () => {
  it("rotateDegを指定しなければ既定の傾き（収まった後-6deg・入り際-14deg）のまま", () => {
    const html = renderToStaticMarkup(<Stamp text="正" />);
    expect(html).toContain("--celebrate-enter-rotate-to:-6deg");
    expect(html).toContain("--celebrate-enter-rotate-from:-14deg");
  });

  it("rotateDegを指定すると、収まった後の傾きも入り際の振れ幅もそれを基準にずれる", () => {
    const html = renderToStaticMarkup(<Stamp text="正" rotateDeg={20} />);
    expect(html).toContain("--celebrate-enter-rotate-to:20deg");
    expect(html).toContain("--celebrate-enter-rotate-from:12deg");
  });

  it("rotateDeg={0}で傾きなし（水平）にできる", () => {
    const html = renderToStaticMarkup(<Stamp text="正" rotateDeg={0} />);
    expect(html).toContain("--celebrate-enter-rotate-to:0deg");
    expect(html).toContain("--celebrate-enter-rotate-from:-8deg");
  });
});

describe("Stamp（shapeで外枠の形を変えられる）", () => {
  it("既定（rounded）はshape専用のclassNameを持たない（従来通りtheme.stampRadius任せ）", () => {
    const html = renderToStaticMarkup(<Stamp text="正" />);
    expect(html).not.toContain("celebrate-stamp--circle");
    expect(html).not.toContain("celebrate-stamp--square");
    expect(html).not.toContain("celebrate-stamp--star");
  });

  it.each(["circle", "square", "star"] as const)("shape='%s'で対応するclassNameが付く", (shape) => {
    const html = renderToStaticMarkup(<Stamp text="正" shape={shape} />);
    expect(html).toContain(`celebrate-stamp--${shape}`);
  });
});
