// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  RECIPES,
  CELEBRATE_VARIANT_NAMES,
  durationForCelebration,
  hasSoundForCelebration,
  isFullScreenContent,
  playSoundsForCelebration,
  renderCelebration,
} from "./recipes";
import { SPARKLE_DURATION_MS } from "./sparkle";
import { CELEBRATE_DURATION_MS } from "./pieces";
import { SPARKLE_SOUND_PRESETS } from "./sparkleSound";
import { DEFAULT_CELEBRATE_THEME } from "./theme";

describe("recipes", () => {
  it("sparkleだけ固有durationで、既存variantの時間は変わらない", () => {
    expect(durationForCelebration("sparkle")).toBe(SPARKLE_DURATION_MS);
    expect(RECIPES.stamp.durationMs).toBe(CELEBRATE_DURATION_MS);
    expect(RECIPES.confetti.durationMs).toBe(CELEBRATE_DURATION_MS);
    expect(RECIPES.record.durationMs).toBe(CELEBRATE_DURATION_MS);
  });

  it("登録済みでない内容（ReactNode相当の文字列）はカタログ扱いされない", () => {
    expect(hasSoundForCelebration("this is not a registered name")).toBe(false);
    expect(durationForCelebration("this is not a registered name")).toBe(CELEBRATE_DURATION_MS);
  });

  it("durationMsの明示的な上書きが最優先される", () => {
    expect(durationForCelebration("stamp", { durationMs: 999 })).toBe(999);
  });

  it("withの中の登録済みの名前も含めて、いちばん長いdurationに合わせる", () => {
    expect(durationForCelebration("pop", { with: ["confetti"] })).toBe(RECIPES.confetti.durationMs);
  });

  it("rain/lightning/shatterはfullscreenコンテンツ", () => {
    expect(isFullScreenContent("rain")).toBe(true);
    expect(isFullScreenContent("lightning")).toBe(true);
    expect(isFullScreenContent("shatter")).toBe(true);
    expect(isFullScreenContent("confetti")).toBe(false);
  });

  it("CELEBRATE_VARIANT_NAMESはRECIPESの全キーを含む", () => {
    expect(new Set(CELEBRATE_VARIANT_NAMES)).toEqual(new Set(Object.keys(RECIPES)));
  });
});

describe("options.sizeRem（絶対サイズ→scaleへの変換）", () => {
  it("sizeRemを指定すると、基準サイズ（pop=2.6rem）に対する比率がscaleとして反映される", () => {
    // sizeRem=5.2 は基準2.6remのちょうど2倍 → scale=2 → layer.size(2.6) * 2 = 5.2rem
    const html = renderToStaticMarkup(<>{renderCelebration("pop", { sizeRem: 5.2 })}</>);
    expect(html).toContain("--celebrate-radial-size:5.2rem");
  });

  it("sizeRemを指定しなければ、既存のscaleオプションがそのまま使われる", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("pop", { scale: 2 })}</>);
    expect(html).toContain("--celebrate-radial-size:5.2rem");
  });

  it("scaleとsizeRemを両方指定した場合はsizeRemが優先される", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("pop", { scale: 100, sizeRem: 2.6 })}</>);
    // sizeRem=2.6は基準そのもの→scale=1相当。scale:100は無視される。
    expect(html).toContain("--celebrate-radial-size:2.6rem");
    expect(html).not.toContain("--celebrate-radial-size:260rem");
  });

  it("どちらも指定しなければscale=1相当（既定の見た目のまま）", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("ring", {})}</>);
    // ringの基準size=2rem、scale=1なので変化なし。
    expect(html).toContain("--celebrate-radial-size:2rem");
  });
});

describe("options.colors（confetti/sparkle/cracker/rain/fireworkの色パレット上書き）", () => {
  // theme.stampColorを変えても、粒の色（confettiColors由来）には反映されない
  // （実際にfireworkで踏んだ不具合：「色を変えても反映されない」）。
  // colorsは上書きできる、という契約をvariantごとに固定する。
  it("confettiはcolorsで指定した色を使い、theme.confettiColorsは使わない", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("confetti", { colors: ["#123456"] })}</>);
    expect(html).toContain("#123456");
    expect(html).not.toContain(DEFAULT_CELEBRATE_THEME.confettiColors[1]);
  });

  it("sparkleもcolorsで上書きできる", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("sparkle", { colors: ["#abcdef"], seed: 1 })}</>);
    expect(html).toContain("#abcdef");
  });

  it("crackerもcolorsで上書きできる", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("cracker", { colors: ["#ff00aa"], seed: 1 })}</>);
    expect(html).toContain("#ff00aa");
  });

  it("colorsを指定しなければ、既存通りtheme.confettiColorsが使われる", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("confetti", {})}</>);
    expect(html).toContain(DEFAULT_CELEBRATE_THEME.confettiColors[0]);
  });
});

describe("options.rotateDeg（stampの傾きの上書き）", () => {
  it("rotateDegを指定すると、その傾きがStampまで届く", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("stamp", { text: "正", rotateDeg: 15 })}</>);
    expect(html).toContain("--celebrate-enter-rotate-to:15deg");
  });

  it("指定しなければ既定の-6degのまま", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("stamp", { text: "正" })}</>);
    expect(html).toContain("--celebrate-enter-rotate-to:-6deg");
  });
});

describe("playSoundsForCelebration（options.soundPreset）", () => {
  let capturedFrequencies: number[];
  let originalAudioContext: typeof window.AudioContext | undefined;

  beforeEach(() => {
    capturedFrequencies = [];
    originalAudioContext = window.AudioContext;

    class MockOscillator {
      type = "sine";
      frequency = {
        setValueAtTime: (frequency: number) => {
          capturedFrequencies.push(frequency);
        },
      };
      connect = () => {};
      start = () => {};
      stop = () => {};
    }
    class MockGain {
      gain = { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} };
      connect = () => {};
    }
    class MockAudioContext {
      currentTime = 0;
      createGain() {
        return new MockGain();
      }
      createOscillator() {
        return new MockOscillator();
      }
      resume() {
        return Promise.resolve();
      }
      close() {
        return Promise.resolve();
      }
    }
    window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
  });

  afterEach(() => {
    window.AudioContext = originalAudioContext as typeof AudioContext;
  });

  it("soundPresetを指定しなければ、そのvariantの既定presetの音が鳴る（popはpreset 3）", () => {
    playSoundsForCelebration("pop");
    expect(capturedFrequencies).toEqual([...SPARKLE_SOUND_PRESETS[3]!.frequencies]);
  });

  it("soundPresetを指定すると、既定presetではなく指定した番号の音が鳴る", () => {
    playSoundsForCelebration("pop", { soundPreset: 7 });
    expect(capturedFrequencies).toEqual([...SPARKLE_SOUND_PRESETS[7]!.frequencies]);
  });

  it("音を持たないvariant（cracker）はsoundPresetを指定しても鳴らない", () => {
    playSoundsForCelebration("cracker", { soundPreset: 7 });
    expect(capturedFrequencies).toEqual([]);
  });

  it("sparkleにsoundPresetを指定すると、ランダム選択ではなく指定番号に固定される", () => {
    playSoundsForCelebration("sparkle", { soundPreset: 2 });
    expect(capturedFrequencies).toEqual([...SPARKLE_SOUND_PRESETS[2]!.frequencies]);
  });
});

describe("renderCelebration", () => {
  it("登録済みの名前を渡すと対応するrecipeが描画される", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("confetti", {})}</>);
    expect(html).toContain("celebrate-confetti-burst");
  });

  it("生のReactNodeを渡すとそのまま描画される", () => {
    const html = renderToStaticMarkup(<>{renderCelebration(<span data-testid="custom-badge">badge</span>, {})}</>);
    expect(html).toContain("custom-badge");
  });

  it("withで名前とReactNodeを混在させると両方が.celebrate-composeの中に描画される", () => {
    const html = renderToStaticMarkup(
      <>{renderCelebration("stamp", { text: "合格", with: ["confetti", <span key="x" data-testid="custom" />] })}</>
    );
    expect(html).toContain("celebrate-compose");
    expect(html).toContain("celebrate-confetti-burst");
    expect(html).toContain("custom");
  });

  it("withが無ければcelebrate-composeで包まない", () => {
    const html = renderToStaticMarkup(<>{renderCelebration("confetti", {})}</>);
    expect(html).not.toContain("celebrate-compose");
  });

  it("primary（本体）はwithレイヤーより後（＝DOM順で上＝画面上で前面）に描画される", () => {
    // celebrate-compose-layerはposition:absoluteなので、DOM順で後の要素が上に重なる。
    // primaryが先だと、大きく不透明なwithコンテンツ（自作バッジ等）に本体が完全に
    // 隠れてしまう不具合があった。装飾（with）は本体の背後、本体は常に最前面。
    const html = renderToStaticMarkup(
      <>{renderCelebration("stamp", { text: "合格", with: [<span key="badge" data-testid="custom-badge" />] })}</>
    );
    const layerIndex = html.indexOf("celebrate-compose-layer");
    const primaryIndex = html.indexOf("celebrate-stamp");
    expect(layerIndex).toBeGreaterThan(-1);
    expect(primaryIndex).toBeGreaterThan(-1);
    expect(layerIndex).toBeLessThan(primaryIndex);
  });
});

describe("typoの実行時警告", () => {
  it("未登録の小文字1単語の名前にはwarnする（typoらしきもの）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderToStaticMarkup(<>{renderCelebration("confeti" as never, {})}</>);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("スペース・絵文字・非ASCIIを含む文字列にはwarnしない（意図的な表示テキストと判断）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderToStaticMarkup(<>{renderCelebration("Nice job!" as never, {})}</>);
    renderToStaticMarkup(<>{renderCelebration("合格" as never, {})}</>);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("同じ未登録の名前で2回発火しても警告は1回だけ（スパム防止）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderToStaticMarkup(<>{renderCelebration("typoedname" as never, {})}</>);
    renderToStaticMarkup(<>{renderCelebration("typoedname" as never, {})}</>);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
