// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CelebrateProvider } from "./CelebrateProvider";
import { useCelebrate } from "./context";

const mocks = vi.hoisted(() => ({ captureViewport: vi.fn() }));

vi.mock("html2canvas", () => ({ default: mocks.captureViewport }));

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function DoubleShatterTrigger() {
  const celebrate = useCelebrate();
  return (
    <button
      type="button"
      onClick={() => {
        celebrate("shatter");
        celebrate("shatter");
      }}
    >
      shatter
    </button>
  );
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  // このテストはProviderが重複を積まないことだけを確認する。撮影完了は別途
  // ShatterScreen.dom.test.tsxで検証しているため、ここではCanvas実装を要求しない。
  mocks.captureViewport.mockImplementation(() => new Promise(() => {}));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  mocks.captureViewport.mockReset();
});

describe("CelebrateProvider", () => {
  it("同じイベントからshatterが二度呼ばれても、画面全体の演出は一件だけにする", () => {
    act(() => {
      root.render(
        <CelebrateProvider>
          <DoubleShatterTrigger />
        </CelebrateProvider>
      );
    });

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    act(() => button?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(document.body.querySelectorAll("[data-shatter-screen]")).toHaveLength(1);
  });
});
