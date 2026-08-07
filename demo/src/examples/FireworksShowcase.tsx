import { useEffect, useRef, useState } from "react";
import { useCelebrate } from "../../../src/react";
import type { FireworkStyle } from "../../../src/index";
import { ExamplePageLayout } from "./ExamplePageLayout";

// 打ち上げ位置（画面内の相対位置）。celebrate()のanchorはRefObject<HTMLElement>を
// 要求するため、実体を持たない「発射台」をあらかじめ複数置いておき、順番に使い回す。
const PAD_COUNT = 5;
const FIREWORK_STYLES: readonly FireworkStyle[] = ["peony", "willow", "ring"];
const PALETTES: readonly (readonly string[])[] = [
  ["#ffd166", "#f4a261", "#e76f51"],
  ["#06d6a0", "#118ab2", "#073b4c"],
  ["#ef476f", "#ffd166", "#06d6a0"],
  ["#a29bfe", "#fd79a8", "#ffeaa7"],
];
const SHOT_COUNT = 12;
const SHOT_INTERVAL_MS = 320;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** 大量のfireworkを時間差で打ち上げるフィナーレ演出の実装例。 */
export function FireworksShowcase() {
  const celebrate = useCelebrate();
  const padRefs = useRef<Array<HTMLDivElement | null>>([]);
  const timeoutIds = useRef<number[]>([]);
  const [shotsRemaining, setShotsRemaining] = useState(0);
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
    setShotsRemaining(SHOT_COUNT);

    for (let i = 0; i < SHOT_COUNT; i++) {
      const delay = i * SHOT_INTERVAL_MS + Math.random() * 150;
      const id = window.setTimeout(() => {
        const pad = padRefs.current[i % PAD_COUNT];
        const isFinaleShot = i >= SHOT_COUNT - 3;
        celebrate("firework", {
          anchor: { current: pad },
          fireworkStyle: pickRandom(FIREWORK_STYLES),
          colors: pickRandom(PALETTES),
          scale: isFinaleShot ? 1.6 : 1 + Math.random() * 0.5,
          soundPreset: Math.floor(Math.random() * 10),
        });
        setShotsRemaining((prev) => Math.max(0, prev - 1));
        setTotalLaunched((prev) => prev + 1);
      }, delay);
      timeoutIds.current.push(id);
    }
  };

  return (
    <ExamplePageLayout
      icon="🎆"
      title="花火大会"
      description="「打ち上げ開始」で12発を時間差・ランダムな種類/色/大きさで連続発火する。最後の3発はscaleを大きくしてフィナーレ感を出す。実装のポイントは、複数の発射台（anchor用の空div）をあらかじめ用意して使い回すこと。"
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
          <button className="combo-button" onClick={launchFinale} disabled={shotsRemaining > 0}>
            {shotsRemaining > 0 ? `打ち上げ中… 残り${shotsRemaining}発` : "🎆 打ち上げ開始"}
          </button>
          <p className="section-hint">これまでの打ち上げ数: {totalLaunched}発</p>
        </div>
      </section>
    </ExamplePageLayout>
  );
}
