// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ParticleField, type ParticleSpec } from "./ParticleField";
import { staticScaleMotion, type StaticScaleParams } from "./motionProfile";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let rafCalls: number;
let cafCalls: number;
let originalRaf: typeof requestAnimationFrame;
let originalCaf: typeof cancelAnimationFrame;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);

  // rAFは実際には呼ばず、呼ばれた回数だけ数える（jsdomには実タイマーとの同期がないため）。
  rafCalls = 0;
  cafCalls = 0;
  originalRaf = window.requestAnimationFrame;
  originalCaf = window.cancelAnimationFrame;
  window.requestAnimationFrame = () => {
    rafCalls++;
    return 1;
  };
  window.cancelAnimationFrame = () => {
    cafCalls++;
  };
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  window.requestAnimationFrame = originalRaf;
  window.cancelAnimationFrame = originalCaf;
});

function makeParticles(): ParticleSpec<StaticScaleParams>[] {
  return [
    { motion: staticScaleMotion, params: { scaleFrom: 0, scaleTo: 1, durationSeconds: 1 }, durationSeconds: 1 },
  ];
}

describe("ParticleField", () => {
  it("マウント時にrAFループを1回だけ開始する", () => {
    act(() => {
      root.render(<ParticleField particles={makeParticles()} />);
    });
    expect(rafCalls).toBe(1);
  });

  it("無関係な再レンダーでparticlesの配列参照が変わっても、rAFループを再開しない（巻き戻りバグの回帰テスト）", () => {
    act(() => {
      root.render(<ParticleField particles={makeParticles()} />);
    });
    expect(rafCalls).toBe(1);
    expect(cafCalls).toBe(0);

    // 同じ内容だが新しい配列参照（呼び出し側が毎回 .map() 等で作るのと同じ状況）。
    act(() => {
      root.render(<ParticleField particles={makeParticles()} />);
    });

    // 修正前は effect が [particles] に依存していたため、ここで
    // cancelAnimationFrame（teardown）→requestAnimationFrame（再開始）が発生し、
    // startTime がリセットされてアニメーションが先頭へ巻き戻っていた。
    expect(cafCalls).toBe(0);
    expect(rafCalls).toBe(1);
  });

  it("アンマウント時にはrAFをキャンセルする", () => {
    act(() => {
      root.render(<ParticleField particles={makeParticles()} />);
    });
    act(() => root.unmount());
    expect(cafCalls).toBe(1);
  });
});

describe("ParticleField（prefers-reduced-motion: reduce）", () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    // 動きを減らす設定が有効な環境を模す。
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;

    // このブロックだけ、rAFのコールバックを実際に1回だけ呼ぶモックに差し替える
    // （通常のブロックのモックは「呼ばれた回数」だけ数えて中身は実行しないため）。
    // tick()はstillActiveの間ずっとrequestAnimationFrame(tick)で自分自身を再スケジュールするため、
    // 毎回同期的にcbを呼ぶと（performance.now()がほぼ進まない速さで）呼び出しが積み重なり
    // スタックオーバーフローする。ここでは最初の1フレーム分のDOM状態だけを見たいので、
    // 2回目以降のスケジュールは呼び出さない（呼ばれた事実だけ数える）。
    let invoked = false;
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      rafCalls++;
      if (!invoked) {
        invoked = true;
        cb(performance.now());
      }
      return 1;
    };
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("移動させず、短いフェードだけを適用する（CSS駆動の演出と同じ『動きを減らす』方針をJS側でも踏襲）", () => {
    const particles: ParticleSpec<StaticScaleParams>[] = [
      // scaleTo:5 のように、通常なら大きく見た目が変わるはずのmotionを敢えて使う。
      { motion: staticScaleMotion, params: { scaleFrom: 0, scaleTo: 5, durationSeconds: 1 }, durationSeconds: 1 },
    ];
    act(() => {
      root.render(<ParticleField particles={particles} />);
    });
    const item = container.querySelector(".celebrate-particle-field-item") as HTMLElement;
    // 動き（scale）を反映せず、中心のまま（translateのみ、scale()を含まない）でフェードする。
    expect(item.style.transform).toBe("translate(-50%, -50%)");
  });
});
