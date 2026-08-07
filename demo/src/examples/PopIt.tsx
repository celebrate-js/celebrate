import { useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { useCelebrate, ParticleField } from "../../../src/react";
import { fallMotion, orbitTwinkleMotion, type FallMotionParams, type OrbitTwinkleParams } from "../../../src/index";
import { ExamplePageLayout } from "./ExamplePageLayout";

// ==== ❄️ 雪：ライブラリのカタログには無い、その場限りの独自の動き。celebrate()は
// 登録済みの名前だけでなく生のReactNodeも直接発火できる（with と同じ仕組み）。
// タップごとに新しいインスタンスがCelebrateProviderのactiveListに積まれるので、
// 連打すると降っている雪の上にさらに雪が重なる（バッチ管理を自前で書く必要が無い）。
const SNOW_COUNT = 14;
const SNOW_DURATION_MS = 2600;

function SnowFall() {
  // Math.random()を直接render本体で呼ぶと、無関係な理由での再レンダー（他のタイルを
  // タップしてactiveListが変わる等）のたびに雪の配置がガチャガチャ再抽選されてしまう
  // （ParticleFallBuilderで踏んだのと同じ不具合）。useMemoでマウント時の1回だけにする。
  const particles = useMemo(() => {
    const durationSeconds = SNOW_DURATION_MS / 1000;
    return Array.from({ length: SNOW_COUNT }, () => {
      const sizeRem = 0.28 + Math.random() * 0.22;
      return {
        motion: fallMotion,
        params: {
          fallSpeed: 1.5 + Math.random() * 0.7,
          startX: (Math.random() - 0.5) * 5,
          swayAmplitude: 0.6 + Math.random() * 0.7,
          swayFrequency: 0.7 + Math.random() * 0.5,
          durationSeconds,
        } satisfies FallMotionParams,
        durationSeconds,
        delaySeconds: Math.random() * 0.3,
        render: (
          <span
            style={
              {
                display: "block",
                width: `${sizeRem}rem`,
                height: `${sizeRem}rem`,
                borderRadius: "999px",
                background: "#fff",
                boxShadow: "0 0 0.3rem rgba(255,255,255,0.85)",
              } as CSSProperties
            }
          />
        ),
      };
    });
  }, []);
  return <ParticleField particles={particles} />;
}

// ==== 🌀 渦：既存のMOTION_PROFILES（orbitTwinkleMotion）をcelebrate()を経由せず
// ParticleFieldに直接渡す。カタログに登録されていない動きでも、celebrate(<Swirl/>)の
// ようにReactNodeとして渡せば普通に発火できることの実演。
const SWIRL_COUNT = 16;
const SWIRL_DURATION_MS = 1300;
const SWIRL_PALETTE = ["#ff8fab", "#ffd6a5", "#caffbf", "#a0c4ff", "#bdb2ff"];

function Swirl() {
  const particles = useMemo(() => {
    const durationSeconds = SWIRL_DURATION_MS / 1000;
    return Array.from({ length: SWIRL_COUNT }, (_, i) => ({
      motion: orbitTwinkleMotion,
      params: {
        radius: 0.5 + (i % 4) * 0.32,
        angularSpeed: 5 + Math.random() * 3,
        startAngleRad: (Math.PI * 2 * i) / SWIRL_COUNT,
        twinkleFrequency: 2 + Math.random() * 2,
      } satisfies OrbitTwinkleParams,
      durationSeconds,
      delaySeconds: 0,
      render: (
        <span
          style={
            {
              display: "block",
              width: "0.4rem",
              height: "0.4rem",
              borderRadius: "999px",
              background: SWIRL_PALETTE[i % SWIRL_PALETTE.length],
            } as CSSProperties
          }
        />
      ),
    }));
  }, []);
  return <ParticleField particles={particles} />;
}

interface SimpleTileConfig {
  id: string;
  icon: string;
  label: string;
  bg: string;
  fire: (celebrate: ReturnType<typeof useCelebrate>, anchor: RefObject<HTMLElement | null>) => void;
}

const SIMPLE_TILES: readonly SimpleTileConfig[] = [
  {
    id: "water",
    icon: "💦",
    label: "水面",
    bg: "#e0f4ff",
    fire: (celebrate, anchor) => celebrate("ripple", { anchor, color: "#4fb0e8" }),
  },
  {
    id: "sakura",
    icon: "🌸",
    label: "桜",
    bg: "#ffe8f0",
    fire: (celebrate, anchor) => celebrate("sakura", { anchor }),
  },
  {
    id: "lightning",
    icon: "⚡️",
    label: "雷",
    bg: "#fff6d8",
    // lightningは画面全体を貫く演出（isFullScreenContent）なので、タップした位置に関わらず
    // 画面全体に落ちる。anchorを渡しても意味を持たないため渡していない。
    fire: (celebrate) => celebrate("lightning"),
  },
  {
    id: "snow",
    icon: "❄️",
    label: "雪",
    bg: "#eef3ff",
    // カタログに無い独自の動き（SnowFall）をReactNodeとしてそのまま発火する例。
    fire: (celebrate, anchor) => celebrate(<SnowFall />, { anchor, durationMs: SNOW_DURATION_MS }),
  },
  {
    id: "pop",
    icon: "🥎",
    label: "ポン",
    bg: "#fff0e0",
    fire: (celebrate, anchor) => celebrate("pop", { anchor, color: "#ff9d4d" }),
  },
  {
    id: "party",
    icon: "🎉",
    label: "パーティー",
    bg: "#f1e8ff",
    fire: (celebrate, anchor) => celebrate("confetti", { anchor }),
  },
  {
    id: "swirl",
    icon: "🌀",
    label: "渦",
    bg: "#e8fff2",
    fire: (celebrate, anchor) => celebrate(<Swirl />, { anchor, durationMs: SWIRL_DURATION_MS }),
  },
];

function SimpleTile({ config }: { config: SimpleTileConfig }) {
  const celebrate = useCelebrate();
  const tileRef = useRef<HTMLButtonElement | null>(null);

  return (
    <button
      ref={tileRef}
      className="popit-tile"
      style={{ background: config.bg } as CSSProperties}
      onClick={() => config.fire(celebrate, tileRef)}
      aria-label={config.label}
    >
      <span className="popit-tile-icon">{config.icon}</span>
      <span className="popit-tile-label">{config.label}</span>
    </button>
  );
}

const FIREWORK_STAGE_STYLES = ["peony", "willow", "kiku", "star", "hachi"] as const;

// ==== 🎆 花火：他のタイルと違い、タップ1回目は「発火」ではなく「暗い舞台に切り替える」
// 演出そのもの。舞台になってから改めてタップすると、その場でfireworkが打ち上がる
// （/examples/fireworksのような専用ページに移動しなくても、その場でミニ花火大会が
// 楽しめる、という体験の実演）。
function FireworksTile() {
  const celebrate = useCelebrate();
  const [stageOpen, setStageOpen] = useState(false);
  const stageRef = useRef<HTMLButtonElement | null>(null);

  if (!stageOpen) {
    return (
      <button
        className="popit-tile"
        style={{ background: "#ffe4e0" } as CSSProperties}
        onClick={() => setStageOpen(true)}
        aria-label="花火"
      >
        <span className="popit-tile-icon">🎆</span>
        <span className="popit-tile-label">花火</span>
      </button>
    );
  }

  return (
    <div className="popit-tile popit-tile--stage">
      <button
        ref={stageRef}
        className="popit-tile-stage-surface"
        onClick={() =>
          celebrate("firework", {
            anchor: stageRef,
            fireworkStyle: FIREWORK_STAGE_STYLES[Math.floor(Math.random() * FIREWORK_STAGE_STYLES.length)],
            scale: 0.7,
          })
        }
        aria-label="タップで花火を打ち上げる"
      >
        タップで打ち上げ
      </button>
      <button
        className="popit-tile-stage-close"
        onClick={(e) => {
          e.stopPropagation();
          setStageOpen(false);
        }}
        aria-label="舞台を閉じる"
      >
        ×
      </button>
    </div>
  );
}

/** タップするだけで可愛いミニエフェクトが見れる、Pop It風の実装例。 */
export function PopIt() {
  return (
    <ExamplePageLayout
      icon="🫧"
      title="ポップイット"
      description={`シリコンのプチプチ（Pop It）のように、タップするだけで可愛いエフェクトが見れるタイル集め。💦🌸🥎🎉はカタログの既存variantをanchorでそのタイルの上に発火しているだけ。❄️🌀はカタログに無い独自の動き（ParticleField + 自作/既存のMotionProfile）をcelebrate(<SnowFall/>)のようにReactNodeとしてそのまま渡している。🎆だけは仕組みが違い、1回目のタップは発火ではなくタイル自体を暗い舞台に切り替える演出で、舞台になってから改めてタップするたびにその場でfireworkが打ち上がる。`}
    >
      <section className="doc-section">
        <div className="popit-grid">
          <FireworksTile />
          {SIMPLE_TILES.map((tile) => (
            <SimpleTile key={tile.id} config={tile} />
          ))}
        </div>
      </section>
    </ExamplePageLayout>
  );
}
