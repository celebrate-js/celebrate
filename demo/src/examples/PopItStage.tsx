import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { useParams, Link } from "react-router-dom";
import { useCelebrate, ParticleField } from "../../../src/react";
import { fallMotion, orbitTwinkleMotion, type FallMotionParams, type OrbitTwinkleParams } from "../../../src/index";

// ==== ❄️ 雪：ライブラリのカタログには無い、その場限りの独自の動き。celebrate()は
// 登録済みの名前だけでなく生のReactNodeも直接発火できる（with と同じ仕組み）。
// タップごとに新しいインスタンスがCelebrateProviderのactiveListに積まれるので、
// 連打すると降っている雪の上にさらに雪が重なる（バッチ管理を自前で書く必要が無い）。
const SNOW_COUNT = 14;
const SNOW_DURATION_MS = 2600;

function SnowFall() {
  // Math.random()を直接render本体で呼ぶと、無関係な理由での再レンダーのたびに
  // 雪の配置がガチャガチャ再抽選されてしまう（ParticleFallBuilderで踏んだのと同じ不具合）。
  // useMemoでマウント時の1回だけにする。
  const particles = useMemo(() => {
    const durationSeconds = SNOW_DURATION_MS / 1000;
    return Array.from({ length: SNOW_COUNT }, () => {
      const sizeRem = 0.3 + Math.random() * 0.3;
      return {
        motion: fallMotion,
        params: {
          fallSpeed: 1.5 + Math.random() * 0.7,
          startX: (Math.random() - 0.5) * 8,
          swayAmplitude: 0.8 + Math.random() * 1,
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
        radius: 0.6 + (i % 4) * 0.4,
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
              width: "0.5rem",
              height: "0.5rem",
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

const FIREWORK_STAGE_STYLES = ["peony", "willow", "kiku", "star", "senrin", "hachi"] as const;
const WATER_COLORS = ["#1f7fb8", "#3aa0d1", "#0c5f8f", "#5cc4e8"];
const POP_COLORS = ["#ff9d4d", "#ffb347", "#ff7a5c", "#ffcc70"];
const SPARKLE_COLOR_PALETTES = [
  ["#ffe066", "#fff3bf", "#ffd43b"],
  ["#ff8fab", "#ffd6e8", "#ff6b9d"],
  ["#74e0c9", "#c4fff5", "#3ec9ab"],
];
const CRACKER_COLOR_PALETTES = [
  ["#ff6b81", "#ffb8c6", "#ff4757"],
  ["#ffa94d", "#ffe0b3", "#ff8c00"],
  ["#a29bfe", "#dcd6ff", "#6c5ce7"],
];
const RAIN_COLOR_PALETTES = [
  ["#4a6fa5", "#7c9cc9", "#2e4a6f"],
  ["#5d7a8c", "#9db4c0", "#3a5666"],
];
const RECORD_MESSAGES = [
  { text: "自己ベスト！", note: "ポップイットで新記録" },
  { text: "MAX!", note: "最高到達点" },
  { text: "GREAT!", note: "絶好調" },
  { text: "SUPER!", note: "止まらない" },
];

export interface PopItTileConfig {
  id: string;
  icon: string;
  label: string;
  /** グリッド（一覧ページ）でのタイルの背景色。 */
  idleBg: string;
  /** 専用ページ（舞台）の背景（グラデーション）。 */
  stageBg: string;
  /** 舞台の上に出す案内文言の色（暗い舞台には明るい文字、明るい舞台には暗い文字）。 */
  stageTextColor: string;
  /** 舞台の上の案内文言。 */
  stageHint: string;
  /** 舞台をタップするたびに呼ばれる。タップごとに違う見た目になるよう、色やstyleを
   * 毎回ランダムに選ぶものが多い（「いろんな花火が見れる」という要望に対応）。 */
  fire: (celebrate: ReturnType<typeof useCelebrate>, anchor: RefObject<HTMLElement | null>) => void;
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** ポップイットの各タイル定義。一覧ページ（グリッド）と専用ページの両方で使う。 */
export const POPIT_TILES: readonly PopItTileConfig[] = [
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
        fireworkStyle: pickRandom(FIREWORK_STAGE_STYLES),
        colors: pickRandom([
          ["#ffd166", "#f4a261", "#e76f51"],
          ["#06d6a0", "#118ab2", "#073b4c"],
          ["#ef476f", "#ffd166", "#06d6a0"],
          ["#a29bfe", "#fd79a8", "#ffeaa7"],
        ]),
        scale: 1 + Math.random() * 0.6,
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
    fire: (celebrate, anchor) =>
      celebrate("ripple", { anchor, color: pickRandom(WATER_COLORS), scale: 1 + Math.random() }),
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
    stageHint: "ターゲットをタップ",
    // このタイルだけ「タップで即発火」ではなく、ミニゲームと同じ
    // 「出てくるターゲットをタップする」形式（BallStage参照）。
    fire: (celebrate, anchor) => celebrate("pop", { anchor, color: pickRandom(POP_COLORS) }),
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
  {
    id: "sparkle",
    icon: "✨",
    label: "きらめき",
    idleBg: "#fff9d6",
    stageBg: "linear-gradient(180deg, #fffbe0 0%, #ffe066 100%)",
    stageTextColor: "rgba(90,70,10,0.55)",
    stageHint: "タップできらめく",
    fire: (celebrate, anchor) => celebrate("sparkle", { anchor, colors: pickRandom(SPARKLE_COLOR_PALETTES) }),
  },
  {
    id: "cracker",
    icon: "🧨",
    label: "クラッカー",
    idleBg: "#ffe0ea",
    stageBg: "linear-gradient(180deg, #ffe0ea 0%, #ff8fa3 100%)",
    stageTextColor: "rgba(100,20,40,0.55)",
    stageHint: "タップでクラッカー",
    fire: (celebrate, anchor) => celebrate("cracker", { anchor, colors: pickRandom(CRACKER_COLOR_PALETTES) }),
  },
  {
    id: "rain",
    icon: "☔️",
    label: "雨",
    idleBg: "#e6ecf5",
    stageBg: "linear-gradient(180deg, #7c8ba1 0%, #333d4d 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップで雨",
    // rainもlightningと同じ画面全体演出（isFullScreenContent）なのでanchorしない。
    fire: (celebrate) => celebrate("rain", { colors: pickRandom(RAIN_COLOR_PALETTES) }),
  },
  {
    id: "shatter",
    icon: "💔",
    label: "ひび割れ",
    idleBg: "#e8e4f0",
    stageBg: "linear-gradient(180deg, #4a4458 0%, #1c1826 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップでひび割れ",
    // shatterも画面全体演出（isFullScreenContent）なのでanchorしない。
    fire: (celebrate) => celebrate("shatter"),
  },
  {
    id: "record",
    icon: "🏆",
    label: "自己ベスト",
    idleBg: "#fff4d6",
    stageBg: "linear-gradient(180deg, #fff4d6 0%, #ffd76b 100%)",
    stageTextColor: "rgba(100,70,10,0.6)",
    stageHint: "タップで更新",
    fire: (celebrate, anchor) => {
      const message = pickRandom(RECORD_MESSAGES);
      celebrate("record", { anchor, text: message.text, note: message.note, with: ["confetti"] });
    },
  },
  {
    id: "heart",
    icon: "💝",
    label: "ハート",
    idleBg: "#ffe0ec",
    stageBg: "linear-gradient(180deg, #ffe0ec 0%, #ff9dc0 100%)",
    stageTextColor: "rgba(120,20,60,0.55)",
    stageHint: "タップでハート",
    fire: (celebrate, anchor) => celebrate("heart", { anchor }),
  },
  {
    id: "float",
    icon: "☁️",
    label: "ふわふわ",
    idleBg: "#eef7ff",
    stageBg: "linear-gradient(180deg, #eef7ff 0%, #cfe6ff 100%)",
    stageTextColor: "rgba(30,60,100,0.5)",
    stageHint: "タップでふわり",
    fire: (celebrate, anchor) => celebrate("float", { anchor }),
  },
];

function StageHeader({ config }: { config: PopItTileConfig }) {
  return (
    <div className="popit-stage-header">
      <Link to="/examples/popit" className="popit-stage-back">
        ← ポップイットに戻る
      </Link>
      <p className="popit-stage-title">
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </p>
    </div>
  );
}

// 🥎以外の全タイル共通：舞台のどこをタップしても、そのタイル用のconfig.fireがその場で起きる。
// 花火なら花火、水面なら波紋…と、タップするたびに（多くはランダムに変化しながら）
// 何度でも見られる、専用ページの実装例。
function GenericStage({ config }: { config: PopItTileConfig }) {
  const celebrate = useCelebrate();
  const surfaceRef = useRef<HTMLButtonElement | null>(null);
  const [tapCount, setTapCount] = useState(0);

  return (
    <section className="doc-section">
      <StageHeader config={config} />
      <button
        ref={surfaceRef}
        className="popit-stage-surface"
        style={{ background: config.stageBg, color: config.stageTextColor } as CSSProperties}
        onClick={() => {
          config.fire(celebrate, surfaceRef);
          setTapCount((n) => n + 1);
        }}
        aria-label={config.stageHint}
      >
        {config.stageHint}
      </button>
      <p className="section-hint">タップ回数: {tapCount}</p>
    </section>
  );
}

// ==== 🥎ポン専用：ミニゲーム（/examples/game）と同じ「出てくるターゲットをタップする」
// 仕組みを流用した専用ページ。ただしスコアやタイマーによる終了は無く、ポップイットらしく
// 制限無くずっとタップし続けられる（当たるたびに次のターゲットがすぐ出てくる）。
const BALL_TARGET_LIFETIME_MS = 1300;

interface BallTargetPosition {
  id: number;
  leftPercent: number;
  topPercent: number;
}

function randomBallPosition(id: number): BallTargetPosition {
  return { id, leftPercent: 10 + Math.random() * 80, topPercent: 10 + Math.random() * 70 };
}

function BallStage({ config }: { config: PopItTileConfig }) {
  const celebrate = useCelebrate();
  const targetRef = useRef<HTMLButtonElement | null>(null);
  const timeoutIds = useRef<number[]>([]);
  const nextTargetId = useRef(0);
  const [target, setTarget] = useState<BallTargetPosition | null>(null);
  const [popCount, setPopCount] = useState(0);
  const [combo, setCombo] = useState(0);

  const spawnTarget = () => {
    const position = randomBallPosition(nextTargetId.current++);
    setTarget(position);
    const id = window.setTimeout(() => {
      // 制限時間内にタップされなければコンボが切れ、次のターゲットへ（ゲームオーバーには
      // ならない。ポップイットは「失敗して終わる」ものではないため）。
      setCombo(0);
      spawnTarget();
    }, BALL_TARGET_LIFETIME_MS);
    timeoutIds.current.push(id);
  };

  useEffect(() => {
    spawnTarget();
    return () => {
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hitTarget = () => {
    if (!target) return;
    timeoutIds.current.forEach((id) => window.clearTimeout(id));
    timeoutIds.current = [];
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    setPopCount((n) => n + 1);
    celebrate("pop", {
      anchor: { current: targetRef.current },
      color: pickRandom(POP_COLORS),
      scale: 1 + Math.min(nextCombo, 5) * 0.15,
    });
    setTarget(null);
    const id = window.setTimeout(spawnTarget, 120);
    timeoutIds.current.push(id);
  };

  return (
    <section className="doc-section">
      <StageHeader config={config} />
      <div className="game-stats">
        <span>ポップ数: {popCount}</span>
        <span>コンボ: {combo}</span>
      </div>
      <div className="game-area" style={{ background: config.stageBg } as CSSProperties}>
        {target && (
          <button
            key={target.id}
            ref={targetRef}
            className="game-target"
            style={{ left: `${target.leftPercent}%`, top: `${target.topPercent}%` }}
            onClick={hitTarget}
            aria-label="ターゲット"
          />
        )}
      </div>
    </section>
  );
}

/** ポップイットの各タイルの専用ページ（/examples/popit/:themeId）。 */
export function PopItStage() {
  const { themeId } = useParams<{ themeId: string }>();
  const config = POPIT_TILES.find((tile) => tile.id === themeId);

  if (!config) {
    return (
      <section className="doc-section">
        <Link to="/examples/popit" className="popit-stage-back">
          ← ポップイットに戻る
        </Link>
        <p className="section-hint">「{themeId}」という舞台は無いみたい。</p>
      </section>
    );
  }

  return config.id === "pop" ? <BallStage config={config} /> : <GenericStage config={config} />;
}
