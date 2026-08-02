// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { activateContainerModifier } from "./containerModifier";

describe("activateContainerModifier", () => {
  it("classNameを<html>に付与し、durationMs後に自動で外す", () => {
    vi.useFakeTimers();
    const className = `test-class-${Math.random()}`;
    activateContainerModifier(className, 100);
    expect(document.documentElement.classList.contains(className)).toBe(true);

    vi.advanceTimersByTime(100);
    expect(document.documentElement.classList.contains(className)).toBe(false);
    vi.useRealTimers();
  });

  it("同じclassNameが重複して有効化されても、最後の1つが消えるまでclassを残す（refカウント）", () => {
    vi.useFakeTimers();
    const className = `test-overlap-${Math.random()}`;
    activateContainerModifier(className, 100);
    activateContainerModifier(className, 200);
    expect(document.documentElement.classList.contains(className)).toBe(true);

    vi.advanceTimersByTime(100);
    // 1つ目は消えたが、2つ目がまだ残っているのでclassは残る
    expect(document.documentElement.classList.contains(className)).toBe(true);

    vi.advanceTimersByTime(100);
    expect(document.documentElement.classList.contains(className)).toBe(false);
    vi.useRealTimers();
  });

  it("返り値の関数を呼ぶと即座に解除できる", () => {
    vi.useFakeTimers();
    const className = `test-manual-release-${Math.random()}`;
    const release = activateContainerModifier(className, 10000);
    expect(document.documentElement.classList.contains(className)).toBe(true);

    release();
    expect(document.documentElement.classList.contains(className)).toBe(false);
    vi.useRealTimers();
  });

  it("解除関数を2回呼んでも安全（冪等）", () => {
    vi.useFakeTimers();
    const className = `test-idempotent-${Math.random()}`;
    const release = activateContainerModifier(className, 10000);
    release();
    expect(() => release()).not.toThrow();
    expect(document.documentElement.classList.contains(className)).toBe(false);
    vi.useRealTimers();
  });
});
