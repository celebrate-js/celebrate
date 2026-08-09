// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SnapshotShatter } from "./SnapshotShatter";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type CanvasMethod =
  | "beginPath"
  | "clearRect"
  | "clip"
  | "closePath"
  | "drawImage"
  | "fillRect"
  | "lineTo"
  | "moveTo"
  | "restore"
  | "rotate"
  | "save"
  | "scale"
  | "setTransform"
  | "stroke"
  | "translate";

function createContext(): CanvasRenderingContext2D {
  const context = {} as CanvasRenderingContext2D;
  const methods: readonly CanvasMethod[] = [
    "beginPath",
    "clearRect",
    "clip",
    "closePath",
    "drawImage",
    "fillRect",
    "lineTo",
    "moveTo",
    "restore",
    "rotate",
    "save",
    "scale",
    "setTransform",
    "stroke",
    "translate",
  ];
  for (const method of methods) context[method] = vi.fn() as never;
  return context;
}

let container: HTMLDivElement;
let root: Root;
let source: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
let originalRaf: typeof requestAnimationFrame;
let originalCaf: typeof cancelAnimationFrame;
let originalMatchMedia: typeof window.matchMedia;
let frames: FrameRequestCallback[];

function runFrame(time: number): void {
  const callback = frames.shift();
  expect(callback).toBeDefined();
  act(() => callback?.(time));
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  source = document.createElement("canvas");
  source.getBoundingClientRect = () => new DOMRect(12, 24, 320, 180);
  document.body.appendChild(source);
  context = createContext();
  originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = () => context;
  originalRaf = window.requestAnimationFrame;
  originalCaf = window.cancelAnimationFrame;
  originalMatchMedia = window.matchMedia;
  frames = [];
  window.requestAnimationFrame = (callback) => {
    frames.push(callback);
    return frames.length;
  };
  window.cancelAnimationFrame = vi.fn();
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  source.remove();
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  window.requestAnimationFrame = originalRaf;
  window.cancelAnimationFrame = originalCaf;
  window.matchMedia = originalMatchMedia;
});

describe("SnapshotShatter", () => {
  it("撮影したCanvasを破片として描画し、終了時に元要素を戻す", () => {
    const onComplete = vi.fn();
    act(() => {
      root.render(
        <SnapshotShatter sourceRef={{ current: source }} seed={1} durationMs={100} onComplete={onComplete} />
      );
    });

    expect(container.querySelector(".celebrate-snapshot-shatter")).not.toBeNull();
    expect(source.style.visibility).toBe("hidden");
    runFrame(0);
    runFrame(100);

    expect(context.drawImage).toHaveBeenCalled();
    expect(context.clip).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(source.style.visibility).toBe("");
  });

  it("reduced motionでは元画像を移動せずにフェードする", () => {
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;

    act(() => {
      root.render(<SnapshotShatter sourceRef={{ current: source }} durationMs={100} />);
    });
    runFrame(0);

    expect(source.style.visibility).toBe("");
    expect(context.fillRect).toHaveBeenCalled();
  });
});
