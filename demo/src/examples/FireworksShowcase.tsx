import { useEffect, useRef, useState } from "react";
import { useCelebrate } from "../../../src/react";
import type { FireworkStyle } from "../../../src/index";
import { ExamplePageLayout } from "./ExamplePageLayout";
import { useT } from "../i18n";

// 打ち上げ位置（画面内の相対位置）。celebrate()のanchorはRefObject<HTMLElement>を
// 要求するため、実体を持たない「発射台」をあらかじめ複数置いておき、使い回す。
const PAD_COUNT = 5;
const FIREWORK_STYLES: readonly FireworkStyle[] = ["peony", "willow", "ring", "kiku", "star", "senrin", "hachi"];
const PALETTES: readonly (readonly string[])[] = [
  ["#ffd166", "#f4a261", "#e76f51"],
  ["#06d6a0", "#118ab2", "#073b4c"],
  ["#ef476f", "#ffd166", "#06d6a0"],
  ["#a29bfe", "#fd79a8", "#ffeaa7"],
];

// 1発ずつ順番にではなく「同時に複数」を組にして打ち上げる（そのほうが花火大会らしい）。
// 各配列が同時発射する発射台のインデックス。だんだん同時数を増やして最後は全台同時のフィナーレ。
//   ⭕️
// ⭕️  ⭕️   のような三角形の同時打ち上げも1組に含めている。
const VOLLEYS: readonly (readonly number[])[] = [[2], [1, 3], [0, 2, 4], [1, 3], [0, 2, 4], [0, 1, 2, 3, 4]];
const VOLLEY_INTERVAL_MS = 700;

// 打ち上げ花火モード：フィナーレのような決まった尺ではなく、止めるまでずっと打ち上がり
// 続ける。組の候補をプールしておき、毎回ランダムに選ぶ（5台同時の大玉は稀に、
// 1〜2発は頻繁に混ぜることで「ずっと見ていられる」自然な花火大会っぽさを出す）。
const CONTINUOUS_VOLLEY_POOL: readonly (readonly number[])[] = [
  [0],
  [1],
  [2],
  [3],
  [4],
  [0, 2],
  [1, 3],
  [2, 4],
  [0, 4],
  [1, 2],
  [0, 2, 4],
  [1, 2, 3],
  [0, 1, 2, 3, 4],
];
const CONTINUOUS_MIN_INTERVAL_MS = 350;
const CONTINUOUS_MAX_INTERVAL_MS = 850;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

const FIREWORKS_TEXT = {
  ja: {
    title: "花火大会",
    description:
      "「打ち上げ開始」は1発→2発同時→…と規模を上げて最後にフィナーレで終わる決まった尺の演出。「打ち上げ花火モード」は止めるまでランダムな組を打ち上げ続ける。どちらも実装のポイントは同じで、複数の発射台（anchor用の空div）を用意し、同じ組の呼び出しをまとめて連続実行するだけで「同時発火」になること。",
    launching: (n: number) => `打ち上げ中… 残り${n}組`,
    launchFinale: "🎆 打ち上げ開始",
    stopContinuous: "⏹ 打ち上げ花火モードを止める",
    startContinuous: "🎇 打ち上げ花火モード",
    totalLaunched: (n: number) => `これまでの打ち上げ数: ${n}発`,
  },
  en: {
    title: "Fireworks show",
    description:
      "“Launch” builds up from 1 shot → 2 at once → ... ending in a finale, a fixed-length show. “Continuous fireworks mode” keeps launching random groups until you stop it. Both share the same implementation idea: set up several launch pads (empty divs used as anchors), and firing the same group's calls back-to-back is all it takes to get “simultaneous” launches.",
    launching: (n: number) => `Launching… ${n} groups left`,
    launchFinale: "🎆 Launch",
    stopContinuous: "⏹ Stop continuous mode",
    startContinuous: "🎇 Continuous fireworks mode",
    totalLaunched: (n: number) => `Total launched so far: ${n}`,
  },
};

/** 複数のfireworkを同時に組ませて打ち上げるフィナーレ演出の実装例。 */
export function FireworksShowcase() {
  const celebrate = useCelebrate();
  const t = useT(FIREWORKS_TEXT);
  const padRefs = useRef<Array<HTMLDivElement | null>>([]);
  const timeoutIds = useRef<number[]>([]);
  // setTimeoutの再帰ループは古いクロージャの中で動き続けるため、「今もモードがONか」を
  // 判定するのにReact stateではなくrefを使う（stateだとループ開始時点の値のまま固定されてしまう）。
  const continuousModeRef = useRef(false);
  const [volleysRemaining, setVolleysRemaining] = useState(0);
  const [continuousMode, setContinuousMode] = useState(false);
  const [totalLaunched, setTotalLaunched] = useState(0);

  const clearPendingLaunches = () => {
    timeoutIds.current.forEach((id) => window.clearTimeout(id));
    timeoutIds.current = [];
  };

  // ページを離れるときに未発火分のタイマーを止める（アンマウント後のcelebrate呼び出しを防ぐ）。
  useEffect(() => {
    return () => {
      continuousModeRef.current = false;
      clearPendingLaunches();
    };
  }, []);

  const launchVolley = (padIndexes: readonly number[], scale: number) => {
    // 同じ組の中は全部同時に撃つ（呼び出しをまとめて連続実行するだけで、
    // 個々のcelebrate()呼び出し自体は普通に1発ずつと同じ）。
    padIndexes.forEach((padIndex) => {
      celebrate("firework", {
        anchor: { current: padRefs.current[padIndex] },
        fireworkStyle: pickRandom(FIREWORK_STYLES),
        colors: pickRandom(PALETTES),
        scale,
        soundPreset: Math.floor(Math.random() * 10),
      });
      setTotalLaunched((prev) => prev + 1);
    });
  };

  const launchFinale = () => {
    continuousModeRef.current = false;
    setContinuousMode(false);
    clearPendingLaunches();
    setVolleysRemaining(VOLLEYS.length);

    VOLLEYS.forEach((padIndexes, volleyIndex) => {
      const isFinaleVolley = volleyIndex === VOLLEYS.length - 1;
      const delay = volleyIndex * VOLLEY_INTERVAL_MS;
      const id = window.setTimeout(() => {
        launchVolley(padIndexes, isFinaleVolley ? 1.8 : 1 + Math.random() * 0.4);
        setVolleysRemaining((prev) => Math.max(0, prev - 1));
      }, delay);
      timeoutIds.current.push(id);
    });
  };

  // 打ち上げ花火モード：決まった尺のフィナーレと違い、止めるまでランダムな組を
  // 打ち上げ続ける。次の1回を打った直後に、またランダムな間隔で自分自身を予約する
  // （setIntervalではなく再帰setTimeoutにしているのは、間隔自体を毎回ランダムに
  // 変えたい＝一定周期にしたくないため）。
  const scheduleNextContinuousLaunch = () => {
    if (!continuousModeRef.current) return;
    const padIndexes = pickRandom(CONTINUOUS_VOLLEY_POOL);
    launchVolley(padIndexes, padIndexes.length >= 5 ? 1.8 : 1 + Math.random() * 0.4);
    const nextDelay =
      CONTINUOUS_MIN_INTERVAL_MS + Math.random() * (CONTINUOUS_MAX_INTERVAL_MS - CONTINUOUS_MIN_INTERVAL_MS);
    const id = window.setTimeout(scheduleNextContinuousLaunch, nextDelay);
    timeoutIds.current.push(id);
  };

  const toggleContinuousMode = () => {
    if (continuousModeRef.current) {
      continuousModeRef.current = false;
      setContinuousMode(false);
      clearPendingLaunches();
      return;
    }
    clearPendingLaunches();
    setVolleysRemaining(0);
    continuousModeRef.current = true;
    setContinuousMode(true);
    scheduleNextContinuousLaunch();
  };

  return (
    <ExamplePageLayout icon="🎆" title={t.title} description={t.description}>
      <section className="doc-section">
        <div className="fireworks-stage">
          {Array.from({ length: PAD_COUNT }, (_, i) => (
            <div
              key={i}
              ref={(el) => {
                padRefs.current[i] = el;
              }}
              className="fireworks-pad"
              style={{ left: `${((i + 0.5) / PAD_COUNT) * 100}%` }}
            />
          ))}
        </div>
        <div className="fireworks-controls">
          <div className="fireworks-control-row">
            <button className="combo-button" onClick={launchFinale} disabled={volleysRemaining > 0 || continuousMode}>
              {volleysRemaining > 0 ? t.launching(volleysRemaining) : t.launchFinale}
            </button>
            <button
              className="fireworks-continuous-button"
              onClick={toggleContinuousMode}
              disabled={volleysRemaining > 0}
              data-active={continuousMode || undefined}
            >
              {continuousMode ? t.stopContinuous : t.startContinuous}
            </button>
          </div>
          <p className="section-hint">{t.totalLaunched(totalLaunched)}</p>
        </div>
      </section>
    </ExamplePageLayout>
  );
}
