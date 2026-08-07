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

const FIREWORK_STAGE_STYLES = ["peony", "willow", "kiku", "star", "hachi"] as const;

interface TileConfig {
  id: string;
  icon: string;
  label: string;
  /** タップ前（アイコンだけの状態）の背景色。 */
  idleBg: string;
  /** タップ後、舞台になったときの背景（グラデーション）。 */
  stageBg: string;
  /** 舞台の上に出す案内文言の色（暗い舞台には明るい文字、明るい舞台には暗い文字）。 */
  stageTextColor: string;
  /** 舞台の上の案内文言。 */
  stageHint: string;
  /** 舞台をタップするたびに呼ばれる。 */
  fire: (celebrate: ReturnType<typeof useCelebrate>, anchor: RefObject<HTMLElement | null>) => void;
}

const TILES: readonly TileConfig[] = [
  {
    id: "fireworks",
    icon: "🎆",
    label: "花火",
    idleBg: "#ffe4e0",
    stageBg: "radial-gradient(circle at 50% 40%, #2a1f4a 0%, #14142b 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップで打ち上げ",
    fire: (celebrate, anchor) =>
      celebrate("firework", {
        anchor,
        fireworkStyle: FIREWORK_STAGE_STYLES[Math.floor(Math.random() * FIREWORK_STAGE_STYLES.length)],
        scale: 0.7,
      }),
  },
  {
    id: "water",
    icon: "💦",
    label: "水面",
    idleBg: "#e0f4ff",
    stageBg: "linear-gradient(180deg, #d6f1ff 0%, #6fc3e8 100%)",
    stageTextColor: "rgba(20,50,70,0.6)",
    stageHint: "タップで波紋",
    fire: (celebrate, anchor) => celebrate("ripple", { anchor, color: "#1f7fb8" }),
  },
  {
    id: "sakura",
    icon: "🌸",
    label: "桜",
    idleBg: "#ffe8f0",
    stageBg: "linear-gradient(180deg, #fff0f5 0%, #ffc2d6 100%)",
    stageTextColor: "rgba(120,40,70,0.55)",
    stageHint: "タップで桜が舞う",
    fire: (celebrate, anchor) => celebrate("sakura", { anchor }),
  },
  {
    id: "lightning",
    icon: "⚡️",
    label: "雷",
    idleBg: "#fff6d8",
    stageBg: "linear-gradient(180deg, #3a3a55 0%, #14142b 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップで雷",
    // lightningは画面全体を貫く演出（isFullScreenContent）なので、タップした位置に関わらず
    // 画面全体に落ちる。anchorを渡しても意味を持たないため渡していない。
    fire: (celebrate) => celebrate("lightning"),
  },
  {
    id: "snow",
    icon: "❄️",
    label: "雪",
    idleBg: "#eef3ff",
    stageBg: "linear-gradient(180deg, #eaf4ff 0%, #a9c9e8 100%)",
    stageTextColor: "rgba(30,50,80,0.55)",
    stageHint: "タップで雪",
    // カタログに無い独自の動き（SnowFall）をReactNodeとしてそのまま発火する例。
    fire: (celebrate, anchor) => celebrate(<SnowFall />, { anchor, durationMs: SNOW_DURATION_MS }),
  },
  {
    id: "pop",
    icon: "🥎",
    label: "ポン",
    idleBg: "#fff0e0",
    stageBg: "linear-gradient(180deg, #fff3e6 0%, #ffcf9e 100%)",
    stageTextColor: "rgba(90,50,10,0.55)",
    stageHint: "タップでポン",
    fire: (celebrate, anchor) => celebrate("pop", { anchor, color: "#ff9d4d" }),
  },
  {
    id: "party",
    icon: "🎉",
    label: "パーティー",
    idleBg: "#f1e8ff",
    stageBg: "linear-gradient(180deg, #f3e8ff 0%, #d9b8ff 100%)",
    stageTextColor: "rgba(60,30,90,0.55)",
    stageHint: "タップで乾杯",
    fire: (celebrate, anchor) => celebrate("confetti", { anchor }),
  },
  {
    id: "swirl",
    icon: "🌀",
    label: "渦",
    idleBg: "#e8fff2",
    stageBg: "linear-gradient(180deg, #e6fff2 0%, #9ef0c4 100%)",
    stageTextColor: "rgba(10,70,45,0.55)",
    stageHint: "タップで渦",
    fire: (celebrate, anchor) => celebrate(<Swirl />, { anchor, durationMs: SWIRL_DURATION_MS }),
  },
];

// 全タイル共通：タップ1回目は発火ではなく「舞台に切り替える」演出そのもの。舞台になって
// からは、タップするたびにconfig.fireがその場（舞台の上）で起きる。専用ページ
// （/examples/fireworksのような）に移動しなくても、その場でミニ演出が楽しめる、という
// 「ポップイット」全体の体験を1つのコンポーネントに共通化している。
function StageTile({ config }: { config: TileConfig }) {
  const celebrate = useCelebrate();
  const [stageOpen, setStageOpen] = useState(false);
  const stageRef = useRef<HTMLButtonElement | null>(null);

  if (!stageOpen) {
    return (
      <button
        className="popit-tile"
        style={{ background: config.idleBg } as CSSProperties}
        onClick={() => setStageOpen(true)}
        aria-label={config.label}
      >
        <span className="popit-tile-icon">{config.icon}</span>
        <span className="popit-tile-label">{config.label}</span>
      </button>
    );
  }

  return (
    <div className="popit-tile popit-tile--stage" style={{ background: config.stageBg } as CSSProperties}>
      <button
        ref={stageRef}
        className="popit-tile-stage-surface"
        style={{ color: config.stageTextColor } as CSSProperties}
        onClick={() => config.fire(celebrate, stageRef)}
        aria-label={config.stageHint}
      >
        {config.stageHint}
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
      description="シリコンのプチプチ（Pop It）のように、タップするだけで可愛いエフェクトが見れるタイル集め。どのタイルも仕組みは同じで、1回目のタップは発火ではなくタイル自体をそのテーマの舞台（暗い夜空・水面・雪景色…）に切り替える演出。舞台になってから改めてタップするたびに、その場で演出が起きる。💦🌸🥎🎉⚡️🎆はカタログの既存variantをanchorで舞台の上に発火し、❄️🌀だけはカタログに無い独自の動き（ParticleField + 自作/既存のMotionProfile）をcelebrate(<SnowFall/>)のようにReactNodeとしてそのまま渡している。"
    >
      <section className="doc-section">
        <div className="popit-grid">
          {TILES.map((tile) => (
            <StageTile key={tile.id} config={tile} />
          ))}
        </div>
      </section>
    </ExamplePageLayout>
  );
}
