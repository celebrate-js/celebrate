import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { useParams, Link } from "react-router-dom";
import { useCelebrate, ParticleField, SnapshotShatter } from "../../../src/react";
import {
  fallMotion,
  orbitTwinkleMotion,
  type FallMotionParams,
  type MotionProfile,
  type OrbitTwinkleParams,
} from "../../../src/index";
import { useLang, useT } from "../i18n";
import sealFrontUrl from "../assets/seal-front-flippers.png";
import sealBackUrl from "../assets/seal-lying-back.png";
import sealSleepingUrl from "../assets/seal-sleeping-curled.png";

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

// ==== 🦭 流氷：Tier 3の「見た目」と「動き」を組み合わせる例。
// 同じ自作アザラシ画像を、流氷の中で左から右へまっすぐ横切らせる。カタログへvariantを
// 増やさず、ポップイット固有の演出としてParticleFieldに直接渡す。
const SEAL_DRIFT_DURATION_MS = 3400;
const SEAL_IMAGE_URLS = [sealFrontUrl, sealBackUrl, sealSleepingUrl] as const;

interface SealDriftParams {
  lane: number;
  durationSeconds: number;
}

const sealDriftMotion: MotionProfile<SealDriftParams> = (t, p) => {
  const progress = Math.min(1, t / p.durationSeconds);
  const eased = progress * progress * (3 - 2 * progress);
  return { x: -18 + 36 * eased, y: p.lane * 2.5, scale: 0.9, opacity: 1 - progress * 0.08, rotate: 0 };
};

function SealOnFloe({ src, sizeRem }: { src: string; sizeRem: number }) {
  return (
    <span className="popit-seal-on-floe" style={{ width: `${sizeRem}rem` }}>
      <img className="popit-seal-image" src={src} alt="" draggable={false} />
      <span className="popit-seal-floe" />
    </span>
  );
}

function SealDrift() {
  const particles = useMemo(() => {
    const durationSeconds = SEAL_DRIFT_DURATION_MS / 1000;
    return Array.from({ length: 3 }, (_, i) => ({
      motion: sealDriftMotion,
      params: { lane: i - 1, durationSeconds },
      durationSeconds,
      delaySeconds: i * 0.32,
      render: <SealOnFloe src={SEAL_IMAGE_URLS[i]} sizeRem={2.7 + i * 0.18} />,
    }));
  }, []);

  return <ParticleField particles={particles} className="popit-seal-drift" />;
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
  labelEn: string;
  /** グリッド（一覧ページ）でのタイルの背景色。 */
  idleBg: string;
  /** 専用ページ（舞台）の背景（グラデーション）。 */
  stageBg: string;
  /** 舞台の上に出す案内文言の色（暗い舞台には明るい文字、明るい舞台には暗い文字）。 */
  stageTextColor: string;
  /** 舞台の上の案内文言。 */
  stageHint: string;
  stageHintEn: string;
  /** trueなら、舞台のどこをタップしても中央ではなく実際にタップした座標を基準に発火する
   * （水面の波紋のように「触れた場所で起きる」ことが体験の一部になるタイル向け）。花火のように
   * 「打ち上げ」という行為自体がタップ位置に依らないもの、フルスクリーン演出でanchorを持たない
   * ものはfalse（既定）のまま。 */
  anchorAtClick?: boolean;
  /** 舞台をタップするたびに呼ばれる。タップごとに違う見た目になるよう、色やstyleを
   * 毎回ランダムに選ぶものが多い（「いろんな花火が見れる」という要望に対応）。 */
  fire?: (celebrate: ReturnType<typeof useCelebrate>, anchor: RefObject<HTMLElement | null>) => void;
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
    labelEn: "Fireworks",
    idleBg: "#ffe4e0",
    stageBg: "radial-gradient(circle at 50% 40%, #2a1f4a 0%, #14142b 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップで打ち上げ",
    stageHintEn: "Tap to launch",
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
    labelEn: "Water",
    idleBg: "#e0f4ff",
    stageBg: "linear-gradient(180deg, #d6f1ff 0%, #6fc3e8 100%)",
    stageTextColor: "rgba(20,50,70,0.6)",
    stageHint: "タップで波紋",
    stageHintEn: "Tap for a ripple",
    anchorAtClick: true,
    fire: (celebrate, anchor) =>
      celebrate("ripple", { anchor, color: pickRandom(WATER_COLORS), scale: 1 + Math.random() }),
  },
  {
    id: "sakura",
    icon: "🌸",
    label: "桜",
    labelEn: "Sakura",
    idleBg: "#ffe8f0",
    stageBg: "linear-gradient(180deg, #fff0f5 0%, #ffc2d6 100%)",
    stageTextColor: "rgba(120,40,70,0.55)",
    stageHint: "タップで桜が舞う",
    stageHintEn: "Tap for cherry blossoms",
    anchorAtClick: true,
    fire: (celebrate, anchor) => celebrate("sakura", { anchor }),
  },
  {
    id: "lightning",
    icon: "⚡️",
    label: "雷",
    labelEn: "Lightning",
    idleBg: "#fff6d8",
    stageBg: "linear-gradient(180deg, #3a3a55 0%, #14142b 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップで雷",
    stageHintEn: "Tap for lightning",
    // lightningは画面全体を貫く演出（isFullScreenContent）なので、タップした位置に関わらず
    // 画面全体に落ちる。anchorを渡しても意味を持たないため渡していない。
    fire: (celebrate) => celebrate("lightning"),
  },
  {
    id: "snow",
    icon: "❄️",
    label: "雪",
    labelEn: "Snow",
    idleBg: "#eef3ff",
    stageBg: "linear-gradient(180deg, #eaf4ff 0%, #a9c9e8 100%)",
    stageTextColor: "rgba(30,50,80,0.55)",
    stageHint: "タップで雪",
    stageHintEn: "Tap for snow",
    anchorAtClick: true,
    // カタログに無い独自の動き（SnowFall）をReactNodeとしてそのまま発火する例。
    fire: (celebrate, anchor) => celebrate(<SnowFall />, { anchor, durationMs: SNOW_DURATION_MS }),
  },
  {
    id: "ice-floe",
    icon: "🧊",
    label: "流氷",
    labelEn: "Ice floe",
    idleBg: "#e3f8ff",
    stageBg: "linear-gradient(180deg, #dff7ff 0%, #b9e8f3 43%, #62b8d2 44%, #2689b2 100%)",
    stageTextColor: "rgba(19,75,96,0.7)",
    stageHint: "流氷をタップするとアザラシが流れてくる",
    stageHintEn: "Tap the ice floe to let seals drift by",
  },
  {
    id: "pop",
    icon: "🥎",
    label: "ポン",
    labelEn: "Pop",
    idleBg: "#fff0e0",
    stageBg: "linear-gradient(180deg, #fff3e6 0%, #ffcf9e 100%)",
    stageTextColor: "rgba(90,50,10,0.55)",
    stageHint: "ターゲットをタップ",
    stageHintEn: "Tap the target",
    // このタイルだけ「タップで即発火」ではなく、ミニゲームと同じ
    // 「出てくるターゲットをタップする」形式（BallStage参照）。
    fire: (celebrate, anchor) => celebrate("pop", { anchor, color: pickRandom(POP_COLORS) }),
  },
  {
    id: "party",
    icon: "🎉",
    label: "パーティー",
    labelEn: "Party",
    idleBg: "#f1e8ff",
    stageBg: "linear-gradient(180deg, #f3e8ff 0%, #d9b8ff 100%)",
    stageTextColor: "rgba(60,30,90,0.55)",
    stageHint: "タップで乾杯",
    stageHintEn: "Tap for a toast",
    anchorAtClick: true,
    fire: (celebrate, anchor) => celebrate("confetti", { anchor }),
  },
  {
    id: "swirl",
    icon: "🌀",
    label: "渦",
    labelEn: "Swirl",
    idleBg: "#e8fff2",
    stageBg: "linear-gradient(180deg, #e6fff2 0%, #9ef0c4 100%)",
    stageTextColor: "rgba(10,70,45,0.55)",
    stageHint: "タップで渦",
    stageHintEn: "Tap for a swirl",
    anchorAtClick: true,
    fire: (celebrate, anchor) => celebrate(<Swirl />, { anchor, durationMs: SWIRL_DURATION_MS }),
  },
  {
    id: "sparkle",
    icon: "✨",
    label: "きらめき",
    labelEn: "Sparkle",
    idleBg: "#fff9d6",
    stageBg: "linear-gradient(180deg, #fffbe0 0%, #ffe066 100%)",
    stageTextColor: "rgba(90,70,10,0.55)",
    stageHint: "タップできらめく",
    stageHintEn: "Tap to sparkle",
    anchorAtClick: true,
    fire: (celebrate, anchor) => celebrate("sparkle", { anchor, colors: pickRandom(SPARKLE_COLOR_PALETTES) }),
  },
  {
    id: "cracker",
    icon: "🧨",
    label: "クラッカー",
    labelEn: "Cracker",
    idleBg: "#ffe0ea",
    stageBg: "linear-gradient(180deg, #ffe0ea 0%, #ff8fa3 100%)",
    stageTextColor: "rgba(100,20,40,0.55)",
    stageHint: "タップでクラッカー",
    stageHintEn: "Tap for a cracker",
    anchorAtClick: true,
    fire: (celebrate, anchor) => celebrate("cracker", { anchor, colors: pickRandom(CRACKER_COLOR_PALETTES) }),
  },
  {
    id: "rain",
    icon: "☔️",
    label: "雨",
    labelEn: "Rain",
    idleBg: "#e6ecf5",
    stageBg: "linear-gradient(180deg, #7c8ba1 0%, #333d4d 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップで雨",
    stageHintEn: "Tap for rain",
    // rainもlightningと同じ画面全体演出（isFullScreenContent）なのでanchorしない。
    fire: (celebrate) => celebrate("rain", { colors: pickRandom(RAIN_COLOR_PALETTES) }),
  },
  {
    id: "shatter",
    icon: "💔",
    label: "ひび割れ",
    labelEn: "Shatter",
    idleBg: "#e8e4f0",
    stageBg: "linear-gradient(180deg, #4a4458 0%, #1c1826 100%)",
    stageTextColor: "rgba(255,255,255,0.7)",
    stageHint: "タップでひび割れ",
    stageHintEn: "Tap to shatter",
    // shatterも画面全体演出（isFullScreenContent）なのでanchorしない。
    fire: (celebrate) => celebrate("shatter"),
  },
  {
    id: "record",
    icon: "🏆",
    label: "自己ベスト",
    labelEn: "Personal best",
    idleBg: "#fff4d6",
    stageBg: "linear-gradient(180deg, #fff4d6 0%, #ffd76b 100%)",
    stageTextColor: "rgba(100,70,10,0.6)",
    stageHint: "タップで更新",
    stageHintEn: "Tap for a new record",
    anchorAtClick: true,
    fire: (celebrate, anchor) => {
      const message = pickRandom(RECORD_MESSAGES);
      celebrate("record", { anchor, text: message.text, note: message.note, with: ["confetti"] });
    },
  },
  {
    id: "heart",
    icon: "💝",
    label: "ハート",
    labelEn: "Heart",
    idleBg: "#ffe0ec",
    stageBg: "linear-gradient(180deg, #ffe0ec 0%, #ff9dc0 100%)",
    stageTextColor: "rgba(120,20,60,0.55)",
    stageHint: "タップでハート",
    stageHintEn: "Tap for hearts",
    anchorAtClick: true,
    fire: (celebrate, anchor) => celebrate("heart", { anchor }),
  },
  {
    id: "float",
    icon: "☁️",
    label: "ふわふわ",
    labelEn: "Float",
    idleBg: "#eef7ff",
    stageBg: "linear-gradient(180deg, #eef7ff 0%, #cfe6ff 100%)",
    stageTextColor: "rgba(30,60,100,0.5)",
    stageHint: "タップでふわり",
    stageHintEn: "Tap to drift",
    anchorAtClick: true,
    fire: (celebrate, anchor) => celebrate("float", { anchor }),
  },
];

const STAGE_TEXT = {
  ja: {
    back: "← ポップイットに戻る",
    tapCount: "タップ回数",
    popCount: "ポップ数",
    combo: "コンボ",
    target: "ターゲット",
  },
  en: { back: "← Back to Pop It", tapCount: "Taps", popCount: "Pops", combo: "Combo", target: "Target" },
};

function StageHeader({ config, backTo }: { config: PopItTileConfig; backTo: string }) {
  const { lang } = useLang();
  const t = useT(STAGE_TEXT);
  return (
    <div className="popit-stage-header">
      <Link to={backTo} className="popit-stage-back">
        {t.back}
      </Link>
      <p className="popit-stage-title">
        <span>{config.icon}</span>
        <span>{lang === "en" ? config.labelEn : config.label}</span>
      </p>
    </div>
  );
}

// 🥎以外の全タイル共通：舞台のどこをタップしても、そのタイル用のconfig.fireがその場で起きる。
// 花火なら花火、水面なら波紋…と、タップするたびに（多くはランダムに変化しながら）
// 何度でも見られる、専用ページの実装例。
function GenericStage({ config, backTo }: { config: PopItTileConfig; backTo: string }) {
  const celebrate = useCelebrate();
  const { lang } = useLang();
  const t = useT(STAGE_TEXT);
  const surfaceRef = useRef<HTMLButtonElement | null>(null);
  const clickAnchorRef = useRef<HTMLSpanElement | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const hint = lang === "en" ? config.stageHintEn : config.stageHint;

  return (
    <section className="doc-section">
      <StageHeader config={config} backTo={backTo} />
      <button
        ref={surfaceRef}
        className="popit-stage-surface"
        style={{ background: config.stageBg, color: config.stageTextColor } as CSSProperties}
        onClick={(e) => {
          if (config.anchorAtClick && clickAnchorRef.current && surfaceRef.current) {
            // celebrate()はanchorのgetBoundingClientRect()を発火した瞬間に読むので、
            // 見えない基準点をタップ座標へ動かしてから渡す（触れた場所そのもので演出が起きる）。
            const stageRect = surfaceRef.current.getBoundingClientRect();
            clickAnchorRef.current.style.left = `${e.clientX - stageRect.left}px`;
            clickAnchorRef.current.style.top = `${e.clientY - stageRect.top}px`;
            config.fire?.(celebrate, clickAnchorRef);
          } else {
            config.fire?.(celebrate, surfaceRef);
          }
          setTapCount((n) => n + 1);
        }}
        aria-label={hint}
      >
        {hint}
        {config.anchorAtClick && <span ref={clickAnchorRef} className="popit-stage-click-anchor" />}
      </button>
      <p className="section-hint">
        {t.tapCount}: {tapCount}
      </p>
    </section>
  );
}

// 🧊 流氷だけはParticleFieldをCelebrateProviderの外側レイヤーではなく、舞台そのものに
// 直接置く。これにより「画面外から来る」のではなく、角丸の流氷の中だけを横切る動きになる。
function IceFloeStage({ config, backTo }: { config: PopItTileConfig; backTo: string }) {
  const { lang } = useLang();
  const t = useT(STAGE_TEXT);
  const [tapCount, setTapCount] = useState(0);
  const [driftKeys, setDriftKeys] = useState<number[]>([]);
  const nextDriftKey = useRef(0);
  const timeoutIds = useRef<number[]>([]);
  const hint = lang === "en" ? config.stageHintEn : config.stageHint;

  useEffect(
    () => () => {
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
    },
    []
  );

  const startDrift = () => {
    const key = nextDriftKey.current++;
    setDriftKeys((keys) => [...keys, key]);
    const timeoutId = window.setTimeout(() => {
      setDriftKeys((keys) => keys.filter((activeKey) => activeKey !== key));
      timeoutIds.current = timeoutIds.current.filter((activeId) => activeId !== timeoutId);
    }, SEAL_DRIFT_DURATION_MS);
    timeoutIds.current.push(timeoutId);
  };

  return (
    <section className="doc-section">
      <StageHeader config={config} backTo={backTo} />
      <button
        className="popit-stage-surface popit-stage-surface--ice-floe"
        style={{ background: config.stageBg, color: config.stageTextColor } as CSSProperties}
        onClick={() => {
          setTapCount((count) => count + 1);
          startDrift();
        }}
        aria-label={hint}
      >
        <span className="popit-ice-floe-hint">{hint}</span>
        {driftKeys.map((key) => (
          <span key={key} className="popit-ice-floe-motion-origin">
            <SealDrift />
          </span>
        ))}
      </button>
      <p className="section-hint">
        {t.tapCount}: {tapCount}
      </p>
    </section>
  );
}

// 💥 ひび割れは、既存の全画面「ガラスのひび」ではなく、舞台をCanvasとして描き、
// その一枚をSnapshotShatterへ渡すTier 3の例。ボタンを押した瞬間に見えていた画素が
// そのまま三角形の破片になって落ちる。
function SnapshotShatterStage({ config, backTo }: { config: PopItTileConfig; backTo: string }) {
  const { lang } = useLang();
  const t = useT(STAGE_TEXT);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [shatterKey, setShatterKey] = useState<number | null>(null);
  const hint = lang === "en" ? "Tap to break this exact snapshot" : "タップした瞬間の舞台を割る";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * pixelRatio);
      canvas.height = Math.round(rect.height * pixelRatio);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const gradient = context.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, "#635a78");
      gradient.addColorStop(1, "#1c1826");
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);
      const glow = context.createRadialGradient(
        rect.width * 0.48,
        rect.height * 0.38,
        2,
        rect.width * 0.48,
        rect.height * 0.38,
        rect.width * 0.48
      );
      glow.addColorStop(0, "rgba(221, 203, 255, 0.3)");
      glow.addColorStop(1, "rgba(221, 203, 255, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, rect.width, rect.height);
      context.strokeStyle = "rgba(236, 223, 255, 0.24)";
      context.lineWidth = 1;
      for (let index = 0; index < 6; index++) {
        const x = (rect.width * (index + 1)) / 7;
        context.beginPath();
        context.moveTo(x, rect.height * 0.13);
        context.lineTo(x + (index % 2 === 0 ? 13 : -13), rect.height * 0.87);
        context.stroke();
      }
      context.fillStyle = "rgba(255, 255, 255, 0.88)";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `700 ${Math.min(20, Math.max(14, rect.width / 18))}px system-ui, sans-serif`;
      context.fillText(hint, rect.width / 2, rect.height / 2);
      context.font = `700 ${Math.min(38, Math.max(28, rect.width / 10))}px system-ui, sans-serif`;
      context.fillText("✦", rect.width / 2, rect.height * 0.28);
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [hint]);

  return (
    <section className="doc-section">
      <StageHeader config={config} backTo={backTo} />
      <button
        type="button"
        className="popit-stage-surface popit-stage-surface--snapshot-shatter"
        onClick={() => {
          if (shatterKey !== null) return;
          setTapCount((count) => count + 1);
          setShatterKey((key) => (key ?? 0) + 1);
        }}
        aria-label={hint}
      >
        <canvas ref={canvasRef} className="popit-snapshot-shatter-canvas" aria-hidden="true" />
      </button>
      {shatterKey !== null && (
        <SnapshotShatter
          key={shatterKey}
          sourceRef={canvasRef}
          seed={shatterKey}
          onComplete={() => setShatterKey(null)}
        />
      )}
      <p className="section-hint">
        {t.tapCount}: {tapCount}
      </p>
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

function BallStage({ config, backTo }: { config: PopItTileConfig; backTo: string }) {
  const celebrate = useCelebrate();
  const t = useT(STAGE_TEXT);
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
      <StageHeader config={config} backTo={backTo} />
      <div className="game-stats">
        <span>
          {t.popCount}: {popCount}
        </span>
        <span>
          {t.combo}: {combo}
        </span>
      </div>
      <div className="game-area" style={{ background: config.stageBg } as CSSProperties}>
        {target && (
          <button
            key={target.id}
            ref={targetRef}
            className="game-target"
            style={{ left: `${target.leftPercent}%`, top: `${target.topPercent}%` }}
            onClick={hitTarget}
            aria-label={t.target}
          />
        )}
      </div>
    </section>
  );
}

/** グリッド（一覧）の見た目。単体アプリ（popit.html）から使う。
 * basePathは各タイルへのリンク先の接頭辞（単体アプリ版は""）。 */
export function PopItGrid({ basePath }: { basePath: string }) {
  const { lang } = useLang();
  return (
    <div className="popit-grid">
      {POPIT_TILES.map((tile) => (
        <Link
          key={tile.id}
          to={`${basePath}/${tile.id}`}
          className="popit-tile"
          style={{ background: tile.idleBg } as CSSProperties}
        >
          <span className="popit-tile-icon">{tile.icon}</span>
          <span className="popit-tile-label">{lang === "en" ? tile.labelEn : tile.label}</span>
        </Link>
      ))}
    </div>
  );
}

const NOT_FOUND_TEXT = {
  ja: (id: string | undefined) => `「${id}」という舞台は無いみたい。`,
  en: (id: string | undefined) => `There's no “${id}” stage.`,
};

/** ポップイットの各タイルの専用ページ（単体アプリの/:themeId）。 */
export function PopItStage({ backTo }: { backTo: string }) {
  const { themeId } = useParams<{ themeId: string }>();
  const config = POPIT_TILES.find((tile) => tile.id === themeId);
  const t = useT(STAGE_TEXT);
  const notFound = useT(NOT_FOUND_TEXT);

  if (!config) {
    return (
      <section className="doc-section">
        <Link to={backTo} className="popit-stage-back">
          {t.back}
        </Link>
        <p className="section-hint">{notFound(themeId)}</p>
      </section>
    );
  }

  return config.id === "pop" ? (
    <BallStage config={config} backTo={backTo} />
  ) : config.id === "ice-floe" ? (
    <IceFloeStage config={config} backTo={backTo} />
  ) : config.id === "shatter" ? (
    <SnapshotShatterStage config={config} backTo={backTo} />
  ) : (
    <GenericStage config={config} backTo={backTo} />
  );
}
