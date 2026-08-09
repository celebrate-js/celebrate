// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShatterScreen } from "./ShatterScreen";

const mocks = vi.hoisted(() => ({ captureViewport: vi.fn() }));

vi.mock("html2canvas", () => ({ default: mocks.captureViewport }));

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function createContext(): CanvasRenderingContext2D {
  return {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    closePath: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

let appRoot: HTMLDivElement;
let mount: HTMLDivElement;
let root: Root;
let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
let originalGetBoundingClientRect: typeof HTMLCanvasElement.prototype.getBoundingClientRect;
let originalRaf: typeof requestAnimationFrame;
let frames: FrameRequestCallback[];

beforeEach(() => {
  appRoot = document.createElement("div");
  appRoot.id = "root";
  document.body.appendChild(appRoot);
  mount = document.createElement("div");
  mount.className = "celebrate-overlay-root";
  document.body.appendChild(mount);
  root = createRoot(mount);
  originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = (() =>
    createContext()) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  originalGetBoundingClientRect = HTMLCanvasElement.prototype.getBoundingClientRect;
  HTMLCanvasElement.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 640, 360);
  originalRaf = window.requestAnimationFrame;
  frames = [];
  window.requestAnimationFrame = (callback) => {
    frames.push(callback);
    return frames.length;
  };
  mocks.captureViewport.mockResolvedValue(Object.assign(document.createElement("canvas"), { width: 640, height: 360 }));
});

afterEach(() => {
  act(() => root.unmount());
  appRoot.remove();
  mount.remove();
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  HTMLCanvasElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  window.requestAnimationFrame = originalRaf;
  mocks.captureViewport.mockReset();
});

describe("ShatterScreen", () => {
  it("viewportを撮影した後、アプリ本体だけを一時的に隠して破片を表示する", async () => {
    await act(async () => {
      root.render(<ShatterScreen seed={4} />);
      await Promise.resolve();
    });

    expect(mocks.captureViewport).toHaveBeenCalledWith(
      document.body,
      expect.objectContaining({ width: window.innerWidth, height: window.innerHeight, useCORS: true })
    );
    expect(appRoot.style.visibility).toBe("hidden");
    expect(mount.querySelector(".celebrate-snapshot-shatter")).not.toBeNull();
    expect(frames).toHaveLength(1);
  });
});
