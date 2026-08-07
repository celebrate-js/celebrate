import { useEffect, useRef, useState } from "react";
import { useCelebrate } from "../../../src/react";
import type { FireworkStyle } from "../../../src/index";
import { ExamplePageLayout } from "./ExamplePageLayout";

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

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** 複数のfireworkを同時に組ませて打ち上げるフィナーレ演出の実装例。 */
export function FireworksShowcase() {
  const celebrate = useCelebrate();
  const padRefs = useRef<Array<HTMLDivElement | null>>([]);
  const timeoutIds = useRef<number[]>([]);
  const [volleysRemaining, setVolleysRemaining] = useState(0);
  const [totalLaunched, setTotalLaunched] = useState(0);

  // ページを離れるときに未発火分のタイマーを止める（アンマウント後のcelebrate呼び出しを防ぐ）。
  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];
    };
  }, []);

  const launchFinale = () => {
    timeoutIds.current.forEach((id) => window.clearTimeout(id));
    timeoutIds.current = [];
    setVolleysRemaining(VOLLEYS.length);

    VOLLEYS.forEach((padIndexes, volleyIndex) => {
      const isFinaleVolley = volleyIndex === VOLLEYS.length - 1;
      const delay = volleyIndex * VOLLEY_INTERVAL_MS;
      const id = window.setTimeout(() => {
        // 同じ組の中は全部同時に撃つ（呼び出しをまとめて連続実行するだけで、
        // 個々のcelebrate()呼び出し自体は普通に1発ずつと同じ）。
        padIndexes.forEach((padIndex) => {
          celebrate("firework", {
            anchor: { current: padRefs.current[padIndex] },
            fireworkStyle: pickRandom(FIREWORK_STYLES),
            colors: pickRandom(PALETTES),
            scale: isFinaleVolley ? 1.8 : 1 + Math.random() * 0.4,
            soundPreset: Math.floor(Math.random() * 10),
          });
          setTotalLaunched((prev) => prev + 1);
        });
        setVolleysRemaining((prev) => Math.max(0, prev - 1));
      }, delay);
      timeoutIds.current.push(id);
    });
  };

  return (
    <ExamplePageLayout
      icon="🎆"
      title="花火大会"
      description="「打ち上げ開始」でfireworkを組にして時間差で打ち上げる。1発→2発同時→3発同時（三角形）→…と徐々に規模を上げ、最後は5台全部を同時発火するフィナーレ。実装のポイントは、複数の発射台（anchor用の空div）を用意し、同じ組の呼び出しをまとめて連続実行するだけで「同時発火」になること。"
    >
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
          <button className="combo-button" onClick={launchFinale} disabled={volleysRemaining > 0}>
            {volleysRemaining > 0 ? `打ち上げ中… 残り${volleysRemaining}組` : "🎆 打ち上げ開始"}
          </button>
          <p className="section-hint">これまでの打ち上げ数: {totalLaunched}発</p>
        </div>
      </section>
    </ExamplePageLayout>
  );
}
