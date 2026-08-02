// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sequence, type SequenceStep } from "./Sequence";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  vi.useFakeTimers();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
});

describe("Sequence", () => {
  it("durationMs経過で次のステップへ進む", () => {
    const steps: SequenceStep[] = [
      { render: () => <span data-testid="step-a" />, durationMs: 100 },
      { render: () => <span data-testid="step-b" /> },
    ];
    act(() => {
      root.render(<Sequence steps={steps} />);
    });
    expect(container.querySelector('[data-testid="step-a"]')).not.toBeNull();

    act(() => vi.advanceTimersByTime(100));
    expect(container.querySelector('[data-testid="step-a"]')).toBeNull();
    expect(container.querySelector('[data-testid="step-b"]')).not.toBeNull();
  });

  it("durationMs未指定のステップでは止まったまま（次に進まない）", () => {
    const steps: SequenceStep[] = [{ render: () => <span data-testid="only" /> }];
    act(() => {
      root.render(<Sequence steps={steps} />);
    });
    act(() => vi.advanceTimersByTime(10_000));
    expect(container.querySelector('[data-testid="only"]')).not.toBeNull();
  });

  it("前段の結果（着地座標など）をcomputeResultで計算し、次段のrenderへ渡す", () => {
    const steps: SequenceStep<{ landedAtRem: number }>[] = [
      {
        render: () => <span data-testid="falling" />,
        durationMs: 50,
        computeResult: () => ({ landedAtRem: 3.2 }),
      },
      {
        render: (result) => <span data-testid="impact" data-x={result?.landedAtRem} />,
      },
    ];
    act(() => {
      root.render(<Sequence steps={steps} />);
    });
    act(() => vi.advanceTimersByTime(50));
    const impact = container.querySelector('[data-testid="impact"]');
    expect(impact?.getAttribute("data-x")).toBe("3.2");
  });

  it("computeResultを省略すると前段の結果をそのまま引き継ぐ", () => {
    const steps: SequenceStep<number>[] = [
      { render: () => <span />, durationMs: 10 },
      { render: () => <span />, durationMs: 10 },
      { render: (result) => <span data-testid="final" data-value={result} /> },
    ];
    act(() => {
      root.render(<Sequence steps={steps} />);
    });
    // 1回のadvanceTimersByTimeで複数のsetTimeoutをまたいで進めると、間のReact再レンダー
    // （＝次のsetTimeoutの登録）が挟まらないため、ステップごとにactで区切って進める。
    act(() => vi.advanceTimersByTime(10));
    act(() => vi.advanceTimersByTime(10));
    const final = container.querySelector('[data-testid="final"]');
    // computeResultが無いステップを2つ挟んでも、undefinedがそのまま次段に引き継がれる
    // （Reactはundefined属性を出力しないため、属性自体が存在しないことで確認する）。
    expect(final?.hasAttribute("data-value")).toBe(false);
  });

  it("各ステップが始まった瞬間に1回だけonEnterを呼ぶ（音・振動をleaf単位に持たせる）", () => {
    const onEnterA = vi.fn();
    const onEnterB = vi.fn();
    const steps: SequenceStep[] = [
      { render: () => <span />, durationMs: 10, onEnter: onEnterA },
      { render: () => <span />, onEnter: onEnterB },
    ];
    act(() => {
      root.render(<Sequence steps={steps} />);
    });
    expect(onEnterA).toHaveBeenCalledTimes(1);
    expect(onEnterB).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(10));
    expect(onEnterB).toHaveBeenCalledTimes(1);
    expect(onEnterA).toHaveBeenCalledTimes(1);
  });

  it("stepsが空なら何も描画しない", () => {
    act(() => {
      root.render(<Sequence steps={[]} />);
    });
    expect(container.querySelector("[data-sequence]")).toBeNull();
  });
});
