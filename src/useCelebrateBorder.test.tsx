// @vitest-environment jsdom
import { act } from "react";
import type { Ref } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCelebrateBorder, type BorderTrigger, type CelebrateBorderOptions } from "./useCelebrateBorder";
import { neonPreset, glowPreset } from "./borderGlow";
import { spinPreset } from "./borderConicRing";

type CelebrateBorderFn = (trigger?: BorderTrigger, options?: CelebrateBorderOptions) => void;

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Element.animate（Web Animations API）はjsdomに実装されていないため、
// playBorderGlowが呼べるように最小限のスタブを用意する。
// 呼ばれたことだけ確認できればよく、実際のアニメーション挙動はブラウザでのみ検証可能。
beforeEach(() => {
  (Element.prototype as unknown as { animate: (...args: unknown[]) => Animation }).animate = vi.fn(
    () => ({ cancel: vi.fn() }) as unknown as Animation
  );
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function TestTarget({ onReady }: { onReady: (celebrateBorder: CelebrateBorderFn) => void }) {
  const { ref, celebrateBorder } = useCelebrateBorder<HTMLDivElement>();
  onReady(celebrateBorder);
  return <div ref={ref as Ref<HTMLDivElement>} data-testid="target" />;
}

describe("useCelebrateBorder", () => {
  it("カタログ名（class機構）でclassを付け外しする", () => {
    vi.useFakeTimers();
    let celebrateBorder!: CelebrateBorderFn;
    act(() => {
      root.render(<TestTarget onReady={(fn) => (celebrateBorder = fn)} />);
    });
    const el = container.querySelector('[data-testid="target"]')!;

    act(() => celebrateBorder("ring"));
    expect(el.classList.contains("celebrate-border-ring")).toBe(true);

    act(() => vi.advanceTimersByTime(800));
    expect(el.classList.contains("celebrate-border-ring")).toBe(false);
    vi.useRealTimers();
  });

  it("カタログ名（glow機構）でWeb Animations APIを呼ぶ", () => {
    let celebrateBorder!: CelebrateBorderFn;
    act(() => {
      root.render(<TestTarget onReady={(fn) => (celebrateBorder = fn)} />);
    });
    act(() => celebrateBorder("neon"));
    expect(Element.prototype.animate).toHaveBeenCalled();
  });

  it("生のプリセットをラッパーなしで直接渡せる（Tier3）", () => {
    let celebrateBorder!: CelebrateBorderFn;
    act(() => {
      root.render(<TestTarget onReady={(fn) => (celebrateBorder = fn)} />);
    });
    act(() => celebrateBorder(glowPreset("#ff0000")));
    expect(Element.prototype.animate).toHaveBeenCalled();
  });

  it("生のconicRingプリセットでカスタムプロパティとclassを設定する", () => {
    vi.useFakeTimers();
    let celebrateBorder!: CelebrateBorderFn;
    act(() => {
      root.render(<TestTarget onReady={(fn) => (celebrateBorder = fn)} />);
    });
    const el = container.querySelector('[data-testid="target"]')! as HTMLElement;

    act(() => celebrateBorder(spinPreset("#111, #222")));
    expect(el.style.getPropertyValue("--celebrate-border-conic-stops")).toBe("#111, #222");
    expect(el.classList.contains("celebrate-border-conic-ring")).toBe(true);
    expect(el.classList.contains("celebrate-border-conic-ring--sweep")).toBe(true);

    act(() => vi.advanceTimersByTime(1200));
    expect(el.classList.contains("celebrate-border-conic-ring")).toBe(false);
    vi.useRealTimers();
  });

  it("intensityがconicRing/class機構のCSS変数へduration倍率として反映される（1より大きいと1.0より大きい値になる）", () => {
    let celebrateBorder!: CelebrateBorderFn;
    act(() => {
      root.render(<TestTarget onReady={(fn) => (celebrateBorder = fn)} />);
    });
    const el = container.querySelector('[data-testid="target"]')! as HTMLElement;

    act(() => celebrateBorder("ring", { intensity: 8 }));
    const scale = Number(el.style.getPropertyValue("--celebrate-border-duration-scale"));
    expect(scale).toBeGreaterThan(1);
  });

  it("intensityがglow機構のdurationMsにも反映される（Web Animations APIへ渡すdurationが伸びる）", () => {
    let celebrateBorder!: CelebrateBorderFn;
    act(() => {
      root.render(<TestTarget onReady={(fn) => (celebrateBorder = fn)} />);
    });
    act(() => celebrateBorder("neon", { intensity: 8 }));
    const calls = (Element.prototype.animate as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    const options = calls[calls.length - 1][1] as { duration: number };
    expect(options.duration).toBeGreaterThan(1000); // neon既定は1000ms
  });

  it("連打しても前のtimerが残らない（同じ要素に対して2回発火しても安全）", () => {
    vi.useFakeTimers();
    let celebrateBorder!: CelebrateBorderFn;
    act(() => {
      root.render(<TestTarget onReady={(fn) => (celebrateBorder = fn)} />);
    });
    const el = container.querySelector('[data-testid="target"]')!;

    act(() => celebrateBorder("ring"));
    act(() => celebrateBorder(neonPreset("#f00")));
    // 2回目の発火でring由来のclassは強制的に外れているはず
    expect(el.classList.contains("celebrate-border-ring")).toBe(false);
    vi.useRealTimers();
  });
});
