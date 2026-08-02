import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  CelebrateProvider,
  useCelebrate,
  useCelebrateBorder,
  useContainerModifier,
  ParticleField,
  RadialBurst,
  ClipReveal,
  Sequence,
  hasSoundForCelebration,
  CELEBRATE_VARIANT_NAMES,
  type CelebrateVariant,
  type CelebrateVariantOptions,
  type ClipRevealEdge,
} from "../../src/react";
import {
  DEFAULT_CELEBRATE_THEME,
  BORDER_EFFECT_KINDS,
  fallMotion,
  glowPreset,
  neonPreset,
  firePreset,
  icePreset,
  electricPreset,
  spinPreset,
  rainbowPreset,
  type MotionProfile,
  type RadialBurstShape,
  type RadialLayer,
} from "../../src/index";

// 仮のポップイット（#620 の構想を手早く触って確認するための最小デモ）。
//
// ポップイット自体が variant カタログを兼ねる：「同じ pop エフェクトを連打する」
// おもちゃではなく、variant をボタン1つ1つに割り当てて、押すたびに違うエフェクト・音が
// 出てくる「触れるカタログ」として作る。別途カタログ画面を並べる必要はない
// （データは1つ、見せ方も1つ）。

interface VariantSpec {
  variant: CelebrateVariant;
  label: string;
  /** ボタンの中に出す、その variant を表す普通のアイコン。 */
  icon: string;
  with?: CelebrateVariant[];
  text?: string;
  note?: string;
}

const CATALOG: VariantSpec[] = [
  { variant: "stamp", label: "stamp", icon: "🀄", with: ["confetti"], text: "正" },
  { variant: "confetti", label: "confetti", icon: "🎊" },
  { variant: "record", label: "record", icon: "🏆", with: ["confetti"], text: "Congratulations!", note: "れんぞく 7問" },
  { variant: "sparkle", label: "sparkle", icon: "✨" },
  { variant: "pop", label: "pop", icon: "💥" },
  { variant: "sakura", label: "sakura", icon: "🌸" },
  { variant: "ripple", label: "ripple", icon: "💧" },
  { variant: "ring", label: "ring", icon: "💍" },
  { variant: "bounce", label: "bounce", icon: "🏀", text: "Nice!" },
  { variant: "heart", label: "heart", icon: "💗" },
  { variant: "star", label: "star", icon: "⭐" },
  { variant: "medal", label: "medal", icon: "🥇", with: ["ring"], text: "1" },
  { variant: "flash", label: "flash", icon: "🔆" },
  { variant: "checkmark", label: "checkmark", icon: "✅" },
  { variant: "emoji", label: "emoji", icon: "😊" },
  { variant: "firework", label: "firework", icon: "🎆" },
  { variant: "cracker", label: "cracker", icon: "🎉" },
  { variant: "shake", label: "shake", icon: "📳" },
  { variant: "hitstop", label: "hitstop", icon: "💫" },
  { variant: "vignette", label: "vignette", icon: "🌑" },
  { variant: "rain", label: "rain", icon: "🌧️" },
  { variant: "lightning", label: "lightning", icon: "⚡" },
  { variant: "shatter", label: "shatter", icon: "🧊" },
  { variant: "float", label: "float", icon: "☁️" },
  { variant: "popup", label: "popup", icon: "🔢", text: "+1" },
];

// 1マス＝1variant。形は全部同じ丸ボタンに揃え、色とアイコンだけで見分ける
// （形をバラバラにすると何のボタンか分かりにくくなったため、シンプルに戻した）。
const BUBBLE_HUE_STEP = 47; // 隣同士が似た色にならないよう黄金角に近い値で回す。

function bubbleColor(index: number): string {
  const hue = (index * BUBBLE_HUE_STEP) % 360;
  return `hsl(${hue}deg 85% 72%)`;
}

function PopBubble({ index }: { index: number }) {
  const celebrate = useCelebrate();
  const spec = CATALOG[index]!;
  const color = bubbleColor(index);

  return (
    <button
      onClick={() =>
        // anchor をボタン自身にすると、ボタンと同じ場所・同じくらいの大きさで
        // 演出が重なって埋もれて見えなくなる（特に record のような大きい variant）。
        // ポップイットは小さいボタンが並ぶ前提なので、あえてグローバル（画面中央）に出す。
        celebrate(spec.variant, {
          with: spec.with,
          text: spec.text,
          note: spec.note,
          theme: { ...DEFAULT_CELEBRATE_THEME, stampColor: color },
        })
      }
      className="popit-bubble"
      style={{ background: color }}
      aria-label={spec.label}
      title={spec.label}
    >
      <span className="popit-bubble-face">{spec.icon}</span>
      {hasSoundForCelebration(spec.variant) && <span className="popit-bubble-sound">🔈</span>}
    </button>
  );
}

function PopItGrid() {
  return (
    <section className="popit-card">
      <p className="popit-title">
        <span>🫧</span>
        <span>ぷちぷちポップイット（仮）</span>
      </p>
      <p className="popit-hint">アイコンを押すと、それぞれ違うエフェクトと音が出るよ！</p>
      <div className="popit-grid">
        {CATALOG.map((_, i) => (
          <PopBubble key={i} index={i} />
        ))}
      </div>
    </section>
  );
}

// ボーダー系エフェクト（useCelebrateBorder）。celebrate() のオーバーレイと違い、
// 既存コンポーネント自身の境界線を光らせる／回転させる第3の方式のデモ。
function BorderEffectDemo() {
  const { ref, celebrateBorder } = useCelebrateBorder<HTMLDivElement>();
  const [intensity, setIntensity] = useState(1);

  return (
    <section className="border-demo-card">
      <p className="popit-title">
        <span>🖼️</span>
        <span>ボーダーエフェクト（カタログ版・Tier 1・仮）</span>
      </p>
      <p className="popit-hint">
        オーバーレイを重ねるのではなく、このカード自身の境界線を光らせる／回転させる。
        アイコンライブラリのように名前で選ぶだけ（{BORDER_EFFECT_KINDS.length}種類。
        中身は上の「空の構造から作る：ボーダー」と同じ2機構）。intensityはglow/conicRing/class
        3機構すべてに同じduration倍率で効く（bounded-repeatの統合デモ）。
      </p>
      <label className="popit-hint" style={{ display: "block", marginBottom: "0.5rem" }}>
        intensity: {intensity.toFixed(2)}
        <input
          type="range"
          min="0.25"
          max="4"
          step="0.25"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
        />
      </label>
      <div ref={ref} className="border-demo-target" style={{ ["--celebrate-border-color" as string]: "#e0904a" }}>
        既存コンポーネント
      </div>
      <div className="border-demo-buttons">
        {BORDER_EFFECT_KINDS.map((kind) => (
          <button key={kind} onClick={() => celebrateBorder(kind, { intensity })}>
            {kind}
          </button>
        ))}
      </div>
    </section>
  );
}

// コンボ系：連打するほど intensity が上がり、見た目・音量・振動が連続的に派手になる。
// 一定時間押さないとコンボが途切れる（よくある「連鎖」の作法）。
const COMBO_RESET_MS = 1200;

function ComboDemo() {
  const celebrate = useCelebrate();
  const [combo, setCombo] = useState(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hit = () => {
    setCombo((c) => {
      const next = c + 1;
      celebrate("sparkle", { with: ["confetti"], intensity: next });
      return next;
    });
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCombo(0), COMBO_RESET_MS);
  };

  return (
    <section className="border-demo-card">
      <p className="popit-title">
        <span>🔥</span>
        <span>コンボ（仮）</span>
      </p>
      <p className="popit-hint">
        連打するほど intensity が上がって、見た目・音量・振動が連続的に派手になるよ。
        {COMBO_RESET_MS}ms 押さないとリセット。
      </p>
      <button className="combo-button" onClick={hit}>
        combo ×{combo}
      </button>
    </section>
  );
}

interface SpiralParams {
  radius: number;
  angularSpeed: number;
  fallSpeed: number;
  durationSeconds: number;
}

// ライブラリのどこにも登録されていない、この場で書いた独自の動き。
// MotionProfile型さえ満たせば、コア（motionProfile.ts / ParticleField.tsx）を
// 一切変更せずに新しい動きを足せることの実演（渦を巻きながら落ちる）。
const spiralMotion: MotionProfile<SpiralParams> = (t, p) => {
  const angle = t * p.angularSpeed;
  const progress = Math.min(1, t / p.durationSeconds);
  return {
    x: Math.cos(angle) * p.radius * (1 - progress * 0.3),
    y: Math.sin(angle) * p.radius * (1 - progress * 0.3) + p.fallSpeed * t,
    scale: 1 - progress * 0.5,
    opacity: 1 - progress,
    rotate: (angle * 180) / Math.PI,
  };
};

const SPIRAL_GLYPHS = ["🌀", "✨", "🎈"];

// エンジン直利用（Tier 3）：celebrate()もCATALOGも経由しない。ParticleFieldを
// 直接JSXに置き、motionは自作関数・見た目も自由なReactNode（絵文字3種）を渡す。
function EngineDemo() {
  const [fireKey, setFireKey] = useState(0);

  return (
    <section className="border-demo-card">
      <p className="popit-title">
        <span>⚙️</span>
        <span>エンジン直利用（Tier 3・仮）</span>
      </p>
      <p className="popit-hint">
        celebrate()を経由せず<code>ParticleField</code>を直接置く。motionはレジストリに無い自作関数（渦巻き）、
        見た目も自由なReactNode。
      </p>
      <button className="combo-button" onClick={() => setFireKey((k) => k + 1)}>
        spiral 発火
      </button>
      <div style={{ position: "relative", height: "6rem", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ParticleField
          key={fireKey}
          particles={Array.from({ length: 9 }, (_, i) => ({
            motion: spiralMotion,
            params: {
              radius: 2 + (i % 3) * 0.7,
              angularSpeed: 5 + i * 0.4,
              fallSpeed: 3,
              durationSeconds: 1.2,
            },
            durationSeconds: 1.2,
            delaySeconds: i * 0.03,
            render: <span style={{ fontSize: "1.3rem" }}>{SPIRAL_GLYPHS[i % SPIRAL_GLYPHS.length]}</span>,
          }))}
        />
      </div>
    </section>
  );
}

// celebrate()の第一引数・withはvariant名（文字列）だけでなく、生のReactNodeも
// 受け取れる。呼び出し側が自作した任意のコンポーネントをそのまま重ねられることの実演。
function CustomBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.7rem 1.1rem",
        borderRadius: "999px",
        background: "#222",
        color: "#fff",
        fontWeight: 800,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 20px -6px rgba(0, 0, 0, 0.4)",
      }}
    >
      🛠️ 自作コンポーネント
    </span>
  );
}

function ReactNodeDemo() {
  const celebrate = useCelebrate();
  return (
    <section className="border-demo-card">
      <p className="popit-title">
        <span>🧩</span>
        <span>ReactNodeをそのまま渡す（仮）</span>
      </p>
      <p className="popit-hint">
        celebrate()の第一引数・<code>with</code>はvariant名だけでなく、生のReactNodeも受け取れる。
        カタログに登録されていない自作コンポーネントをそのまま重ねられる。
      </p>
      <button className="combo-button" onClick={() => celebrate(<CustomBadge />)}>
        celebrate(&lt;CustomBadge /&gt;)
      </button>
      <button
        className="combo-button"
        style={{ marginLeft: "0.6rem" }}
        onClick={() => celebrate("stamp", { text: "合格", with: [<CustomBadge key="badge" />] })}
      >
        stamp + with:[&lt;CustomBadge /&gt;]
      </button>
    </section>
  );
}

// container を指定すると、画面全体（viewport）ではなくその要素の内側だけに
// フルスクリーン系variant（rain等）を閉じ込められる。「このカードの中だけ雨を降らせる」の実演。
function ScopedTrigger() {
  const celebrate = useCelebrate();
  const trigger = useContainerModifier();
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
      <button className="combo-button" onClick={() => celebrate("rain")}>
        この枠内だけrain
      </button>
      <button
        className="combo-button"
        onClick={() => trigger({ className: "celebrate-shake-active", durationMs: 400 })}
      >
        画面全体shake（Tier3直接）
      </button>
    </div>
  );
}

function ScopedDemo() {
  const boxRef = useRef<HTMLDivElement>(null);
  return (
    <section className="border-demo-card">
      <p className="popit-title">
        <span>🪟</span>
        <span>ローカルスコープ（仮）</span>
      </p>
      <p className="popit-hint">
        <code>{"<CelebrateProvider container={ref}>"}</code>
        にすると、rain/lightning/shatterのような全画面variantを画面全体ではなくこの枠の中だけに閉じ込められる。
        右のボタンは比較用（shake/hitstopは<code>useContainerModifier()</code>を直接使うTier3の例で、常に画面全体が対象）。
      </p>
      <div
        ref={boxRef}
        style={{
          position: "relative",
          height: "8rem",
          borderRadius: "0.75rem",
          border: "2px dashed #d8cfc2",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <CelebrateProvider container={boxRef}>
          <ScopedTrigger />
        </CelebrateProvider>
      </div>
    </section>
  );
}

// 「空の構造から作る」デモ。variant名のカタログを経由せず、構造テンプレート
// （RadialBurst）に生のパラメータを直接渡す。pop/ripple/ring/flashはこれの
// プリセット（パラメータの組み合わせ）でしかないことの証明として、カタログに
// 存在しない組み合わせ（例：グローで4層・時間差広め）もその場で作れる。
const RADIAL_SHAPES: readonly RadialBurstShape[] = ["fill", "outline", "glow"];

function RadialBurstBuilder() {
  const [shape, setShape] = useState<RadialBurstShape>("outline");
  const [scaleFrom, setScaleFrom] = useState(0.3);
  const [scaleTo, setScaleTo] = useState(2.4);
  const [size, setSize] = useState(2.4);
  const [color, setColor] = useState("#4aa8ff");
  const [durationMs, setDurationMs] = useState(500);
  const [layerCount, setLayerCount] = useState(3);
  const [layerDelayMs, setLayerDelayMs] = useState(140);
  const [spotlight, setSpotlight] = useState(false);
  const [fireKey, setFireKey] = useState(0);

  // origin：原点（全layer共通の中心点）が経路上を移動する場合の経由点（軸B「原点移動」）。
  // スポットライトの掃引のように、burst全体が一直線に横切りながら広がる。
  const origin = spotlight
    ? ([
        { offset: 0, xRem: -4, yRem: 0 },
        { offset: 1, xRem: 4, yRem: 0 },
      ] as const)
    : undefined;

  const layers: RadialLayer[] = Array.from({ length: layerCount }, (_, i) => ({
    shape,
    scaleFrom,
    scaleTo: scaleTo + i * 0.3,
    size: size - i * 0.4,
    color,
    durationMs,
    delayMs: i * layerDelayMs,
  }));

  // layers配列（データ）を手で書くより、<RadialBurstLayer/>を並べる方がReactとして
  // 素直に読める（layers propと等価。RadialBurst.tsx参照）。
  const code = `<RadialBurst>\n${layers
    .map(
      (l) =>
        `  <RadialBurstLayer shape="${l.shape}" scaleFrom={${l.scaleFrom}} scaleTo={${l.scaleTo.toFixed(2)}} size={${l.size.toFixed(2)}} color="${l.color}" durationMs={${l.durationMs}} delayMs={${l.delayMs}} />`
    )
    .join("\n")}\n</RadialBurst>`;

  return (
    <section className="playground-card">
      <p className="popit-title">
        <span>🧱</span>
        <span>空の構造から作る：RadialBurst（仮）</span>
      </p>
      <p className="popit-hint">
        variantのカタログ（名前）を経由せず、構造テンプレートに生のパラメータを渡して組み立てる。
        pop / ripple / ring / flash は全部これのプリセット違いでしかない＝カタログにない組み合わせもここで自由に作れる。
      </p>
      <div className="playground-grid">
        <div className="playground-controls">
          <label>
            shape
            <select value={shape} onChange={(e) => setShape(e.target.value as RadialBurstShape)}>
              {RADIAL_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label>
            scaleFrom: {scaleFrom.toFixed(2)}
            <input type="range" min="0" max="2" step="0.05" value={scaleFrom} onChange={(e) => setScaleFrom(Number(e.target.value))} />
          </label>
          <label>
            scaleTo（layer 0基準）: {scaleTo.toFixed(2)}
            <input type="range" min="0.5" max="4" step="0.05" value={scaleTo} onChange={(e) => setScaleTo(Number(e.target.value))} />
          </label>
          <label>
            size（rem・layer 0基準）: {size.toFixed(2)}
            <input type="range" min="0.5" max="6" step="0.1" value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </label>
          <label>
            durationMs: {durationMs}
            <input type="range" min="150" max="1500" step="50" value={durationMs} onChange={(e) => setDurationMs(Number(e.target.value))} />
          </label>
          <label>
            layers: {layerCount}
            <input type="range" min="1" max="5" step="1" value={layerCount} onChange={(e) => setLayerCount(Number(e.target.value))} />
          </label>
          <label>
            layer間のdelayMs: {layerDelayMs}
            <input type="range" min="0" max="400" step="10" value={layerDelayMs} onChange={(e) => setLayerDelayMs(Number(e.target.value))} />
          </label>
          <label>
            color
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <label className="playground-checkbox">
            <input type="checkbox" checked={spotlight} onChange={(e) => setSpotlight(e.target.checked)} />
            origin（原点移動・スポットライトの掃引）
          </label>
        </div>
        <div className="playground-code">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
      <button className="combo-button" onClick={() => setFireKey((k) => k + 1)}>
        🚀 発火（celebrate()を経由しない）
      </button>
      <div
        style={{
          position: "relative",
          height: "9rem",
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RadialBurst key={fireKey} layers={layers} origin={origin} />
      </div>
    </section>
  );
}

// 「空の構造から作る」デモ・その2：ParticleField + fallMotion。rain（雨）も
// sakura（桜吹雪）も実体は同じParticleFieldにfallMotionとパラメータを渡しているだけ。
// ここではfallMotionのパラメータ（落下速度・横揺れ・個数・絵柄）を直接いじれる。
// render は文字列専用ではなく任意のReactNode（画像・SVG・自作コンポーネントも可）を
// 受け取れる。「文字（絵文字）」と「SVG図形（自作コンポーネント）」の2種類で
// それを実演する（色つきの円はSVGの多角形と同じ「静的な図形」でしかなく区別する
// 意味がないため統合した）。SVG図形は色も1色固定ではなく、パレットから粒ごとに
// 色を変える（実際の紙吹雪が単色でないのと同じ理由）。
type FallRenderKind = "glyph" | "shape";

const SHAPE_PALETTE = ["#4aa8ff", "#ff5f6d", "#47cf73", "#ffc371", "#a56bff"];

function DiamondShape({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <polygon points="8,0 16,8 8,16 0,8" fill={color} />
    </svg>
  );
}

function ParticleFallBuilder() {
  const [count, setCount] = useState(24);
  const [fallSpeed, setFallSpeed] = useState(8);
  const [swayAmplitude, setSwayAmplitude] = useState(1.5);
  const [swayFrequency, setSwayFrequency] = useState(2);
  const [durationSeconds, setDurationSeconds] = useState(1.5);
  const [spreadX, setSpreadX] = useState(12);
  const [glyph, setGlyph] = useState("❄️");
  const [renderKind, setRenderKind] = useState<FallRenderKind>("glyph");
  const [fireKey, setFireKey] = useState(0);

  const renderNodeFor = (index: number): ReactNode =>
    renderKind === "glyph" ? (
      <span style={{ fontSize: "1.1rem" }}>{glyph}</span>
    ) : (
      <DiamondShape color={SHAPE_PALETTE[index % SHAPE_PALETTE.length]!} />
    );

  const particles = Array.from({ length: count }, (_, i) => ({
    motion: fallMotion,
    params: {
      fallSpeed,
      startX: count > 1 ? (i / (count - 1) - 0.5) * spreadX * 2 : 0,
      swayAmplitude,
      swayFrequency: swayFrequency + (i % 3) * 0.3,
      durationSeconds,
    },
    durationSeconds,
    delaySeconds: (i / count) * 0.4,
    render: renderNodeFor(i),
  }));

  const renderCode =
    renderKind === "glyph"
      ? `<span style={{ fontSize: "1.1rem" }}>${glyph}</span>`
      : `<DiamondShape color={PALETTE[i % PALETTE.length]} />`;

  const code = `<ParticleField
  particles={Array.from({ length: ${count} }, (_, i) => ({
    motion: fallMotion,
    params: {
      fallSpeed: ${fallSpeed},
      startX: (i / (${count} - 1) - 0.5) * ${(spreadX * 2).toFixed(1)},
      swayAmplitude: ${swayAmplitude},
      swayFrequency: ${swayFrequency} + (i % 3) * 0.3,
      durationSeconds: ${durationSeconds},
    },
    durationSeconds: ${durationSeconds},
    delaySeconds: (i / ${count}) * 0.4,
    render: ${renderCode},
  }))}
/>`;

  return (
    <section className="playground-card">
      <p className="popit-title">
        <span>❄️</span>
        <span>空の構造から作る：ParticleField（降ってくる系・仮）</span>
      </p>
      <p className="popit-hint">
        rain（雨）もsakura（桜吹雪）も実体は同じ<code>ParticleField</code>に<code>fallMotion</code>という
        動き関数とパラメータを渡しているだけ。<code>render</code>は文字列専用ではなく
        <strong>任意のReactNode</strong>（画像・SVG・自作コンポーネントも可）を受け取れる
        ――ここでは文字と自作SVG図形（粒ごとにパレットから色を変える）を切り替えて実演する。
      </p>
      <div className="playground-grid">
        <div className="playground-controls">
          <label>
            個数: {count}
            <input type="range" min="4" max="60" step="1" value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
          <label>
            fallSpeed（rem/秒）: {fallSpeed}
            <input type="range" min="1" max="20" step="0.5" value={fallSpeed} onChange={(e) => setFallSpeed(Number(e.target.value))} />
          </label>
          <label>
            swayAmplitude（横揺れ幅）: {swayAmplitude.toFixed(1)}
            <input type="range" min="0" max="4" step="0.1" value={swayAmplitude} onChange={(e) => setSwayAmplitude(Number(e.target.value))} />
          </label>
          <label>
            swayFrequency（横揺れの速さ）: {swayFrequency.toFixed(1)}
            <input type="range" min="0.5" max="6" step="0.1" value={swayFrequency} onChange={(e) => setSwayFrequency(Number(e.target.value))} />
          </label>
          <label>
            durationSeconds: {durationSeconds.toFixed(1)}
            <input type="range" min="0.5" max="4" step="0.1" value={durationSeconds} onChange={(e) => setDurationSeconds(Number(e.target.value))} />
          </label>
          <label>
            spreadX（横方向の広がり）: {spreadX}
            <input type="range" min="2" max="24" step="1" value={spreadX} onChange={(e) => setSpreadX(Number(e.target.value))} />
          </label>
          <label>
            見た目（render）
            <select value={renderKind} onChange={(e) => setRenderKind(e.target.value as FallRenderKind)}>
              <option value="glyph">文字（絵文字）</option>
              <option value="shape">SVG図形（自作コンポーネント・多色）</option>
            </select>
          </label>
          {renderKind === "glyph" ? (
            <label>
              絵柄
              <input type="text" value={glyph} onChange={(e) => setGlyph(e.target.value)} placeholder="❄️ 🍂 🌸 など" />
            </label>
          ) : (
            <p className="popit-hint" style={{ margin: 0 }}>
              色は固定1色ではなく、パレット（{SHAPE_PALETTE.length}色）から粒ごとに順番に割り当てる。
            </p>
          )}
        </div>
        <div className="playground-code">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
      <button className="combo-button" onClick={() => setFireKey((k) => k + 1)}>
        🚀 発火（celebrate()を経由しない）
      </button>
      <div
        style={{
          position: "relative",
          height: "10rem",
          marginTop: "1rem",
          overflow: "hidden",
          border: "1px dashed #d8cfc2",
          borderRadius: "0.75rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "0.5rem",
        }}
      >
        <ParticleField key={fireKey} particles={particles} />
      </div>
    </section>
  );
}

// 「空の構造から作る」デモ・その3：ボーダー系は実質2機構（glowのbox-shadowパルス/
// フリッカーと、conicRingのグラデーションリング）しかない。neon/fire/ice/electricは
// glow系のパラメータ違い、spin/rainbowはconicRing系のパラメータ違いでしかないことの実演。
type GlowFamily = "pulse" | "flicker" | "fire" | "ice" | "electric";

function BorderMechanismBuilder() {
  const { ref, celebrateBorder } = useCelebrateBorder<HTMLDivElement>();
  const [mechanism, setMechanism] = useState<"glow" | "conicRing">("glow");
  const [glowFamily, setGlowFamily] = useState<GlowFamily>("flicker");
  const [color1, setColor1] = useState("#ff8a3d");
  const [color2, setColor2] = useState("#ffcf5c");
  const [stopsText, setStopsText] = useState("#ff5f6d, #ffc371, #47cf73, #4aa8ff, #ff5f6d");
  const [mode, setMode] = useState<"sweep" | "flash">("sweep");

  // DOM操作（classList/style/Web Animations API）はuseCelebrateBorderフックの中に
  // 閉じ込められている。ここではTier1と同じ「celebrateBorder(trigger)を呼ぶだけ」で、
  // 生のDOM要素を自分で操作しない。Tier3の生プリセットも、プリセット自身が
  // mechanismを持っているのでラッパーなしでそのまま渡せる（celebrate(<ReactNode/>)と同じ形）。
  const fire = () => {
    if (mechanism === "glow") {
      const preset =
        glowFamily === "pulse"
          ? glowPreset(color1)
          : glowFamily === "flicker"
            ? neonPreset(color1)
            : glowFamily === "fire"
              ? firePreset([color1, color2])
              : glowFamily === "ice"
                ? icePreset([color1, color2])
                : electricPreset([color1, color2]);
      celebrateBorder(preset);
      return;
    }

    celebrateBorder(mode === "sweep" ? spinPreset(stopsText) : rainbowPreset(stopsText));
  };

  const glowFnName =
    glowFamily === "pulse"
      ? "glowPreset"
      : glowFamily === "flicker"
        ? "neonPreset"
        : glowFamily === "fire"
          ? "firePreset"
          : glowFamily === "ice"
            ? "icePreset"
            : "electricPreset";

  const code =
    mechanism === "glow"
      ? glowFamily === "pulse" || glowFamily === "flicker"
        ? `celebrateBorder(${glowFnName}("${color1}"));`
        : `celebrateBorder(${glowFnName}(["${color1}", "${color2}"]));`
      : `celebrateBorder(${mode === "sweep" ? "spinPreset" : "rainbowPreset"}("${stopsText}"));`;

  return (
    <section className="playground-card">
      <p className="popit-title">
        <span>🖼️</span>
        <span>空の構造から作る：ボーダー（仮）</span>
      </p>
      <p className="popit-hint">
        glow/neon/fire/ice/electricは全部box-shadowパルス/フリッカー（<code>glow</code>機構）のパラメータ違い、
        spin/rainbowは全部conic-gradientリング（<code>conicRing</code>機構）のパラメータ違いでしかない。
        名前を選ぶのではなく、機構と生のパラメータ（色・stops・mode）を直接指定する。
      </p>
      <div className="playground-grid">
        <div className="playground-controls">
          <label>
            機構
            <select value={mechanism} onChange={(e) => setMechanism(e.target.value as "glow" | "conicRing")}>
              <option value="glow">glow（box-shadowパルス/フリッカー）</option>
              <option value="conicRing">conicRing（グラデーションリング）</option>
            </select>
          </label>
          {mechanism === "glow" ? (
            <>
              <label>
                系統
                <select value={glowFamily} onChange={(e) => setGlowFamily(e.target.value as GlowFamily)}>
                  <option value="pulse">pulse（glow相当・単発）</option>
                  <option value="flicker">flicker（neon相当・明滅）</option>
                  <option value="fire">fire相当（2色ゆらめき）</option>
                  <option value="ice">ice相当（2色シマー）</option>
                  <option value="electric">electric相当（離散ジッター）</option>
                </select>
              </label>
              <label>
                color 1
                <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} />
              </label>
              {glowFamily !== "pulse" && glowFamily !== "flicker" && (
                <label>
                  color 2
                  <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} />
                </label>
              )}
            </>
          ) : (
            <>
              <label>
                stops（conic-gradientの色並び）
                <input type="text" value={stopsText} onChange={(e) => setStopsText(e.target.value)} />
              </label>
              <label>
                mode
                <select value={mode} onChange={(e) => setMode(e.target.value as "sweep" | "flash")}>
                  <option value="sweep">sweep（spin相当・回り続ける）</option>
                  <option value="flash">flash（rainbow相当・一度だけ）</option>
                </select>
              </label>
            </>
          )}
        </div>
        <div className="playground-code">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
      <div
        ref={ref}
        className="border-demo-target"
        style={{ marginTop: "1rem", ["--celebrate-border-color" as string]: color1 }}
      >
        既存コンポーネント
      </div>
      <button className="combo-button" onClick={fire}>
        🚀 発火
      </button>
    </section>
  );
}

// 「空の構造から作る」デモ・その4：ClipReveal（軸I=マスク・リビール）。
// RadialBurst/ParticleField/StrokePathとは別の描画軸（覆いをclip-pathで動かして
// 中身を出し入れする）であることの実演。中身には自作コンポーネント（画像の代わりに絵文字）を置く。
const CLIP_REVEAL_EDGES: readonly ClipRevealEdge[] = ["left", "right", "top", "bottom", "center"];

function ClipRevealDemo() {
  const [edge, setEdge] = useState<ClipRevealEdge>("left");
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [color, setColor] = useState("#2b2b2b");
  const [fireKey, setFireKey] = useState(0);

  const code = `<ClipReveal edge="${edge}" direction="${direction}" color="${color}">\n  <span>🎁</span>\n</ClipReveal>`;

  return (
    <section className="playground-card">
      <p className="popit-title">
        <span>🎬</span>
        <span>空の構造から作る：ClipReveal（軸I=マスク・リビール・仮）</span>
      </p>
      <p className="popit-hint">
        RadialBurst（scale+opacity）/ParticleField（粒）/StrokePath（線）とは別の軸：
        覆いを<code>clip-path</code>で動かして中身を出し入れする（緞帳ワイプ）。
        <code>direction="out"</code>は同じ経路の逆再生（覆いが閉じる）。
      </p>
      <div className="playground-grid">
        <div className="playground-controls">
          <label>
            edge
            <select value={edge} onChange={(e) => setEdge(e.target.value as ClipRevealEdge)}>
              {CLIP_REVEAL_EDGES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </label>
          <label>
            direction
            <select value={direction} onChange={(e) => setDirection(e.target.value as "in" | "out")}>
              <option value="in">in（覆いが晴れる）</option>
              <option value="out">out（覆いが閉じる）</option>
            </select>
          </label>
          <label>
            color
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
        </div>
        <div className="playground-code">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
      <button className="combo-button" onClick={() => setFireKey((k) => k + 1)}>
        🚀 発火（celebrate()を経由しない）
      </button>
      <div
        style={{
          position: "relative",
          height: "6rem",
          marginTop: "1rem",
          overflow: "hidden",
          border: "1px dashed #d8cfc2",
          borderRadius: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
        }}
      >
        <span>🎁</span>
        <ClipReveal key={fireKey} edge={edge} direction={direction} color={color} />
      </div>
    </section>
  );
}

// 「空の構造から作る」デモ・その5：Sequence（合成層。軸F=staged-sequence）。
// with（parallel相当・同時に重ねる）とは別軸：「前段が終わってから次段が始まる」かつ
// 「前段の実行結果（着地座標）を次段のパラメータとして受け取れる」ことの実演。
function SequenceDemo() {
  const [fireKey, setFireKey] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const fire = () => {
    setLog([]);
    setFireKey((k) => k + 1);
  };

  return (
    <section className="playground-card">
      <p className="popit-title">
        <span>🎞️</span>
        <span>空の構造から作る：Sequence（合成層・仮）</span>
      </p>
      <p className="popit-hint">
        <code>with</code>（parallel相当・同時に重ねる）とは別軸：前段が終わってから次段が始まり、
        前段の実行結果（ここでは「落下地点のx座標」）を次段の<code>render</code>へ渡せる。
        各ステップの<code>onEnter</code>で効果音・振動をステップ単位に鳴らせる（ここではログ表示で代用）。
      </p>
      <button className="combo-button" onClick={fire}>
        🚀 発火（celebrate()を経由しない）
      </button>
      <div
        style={{
          position: "relative",
          height: "5rem",
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
        }}
      >
        <Sequence<{ landedAtRem: number }>
          key={fireKey}
          steps={[
            {
              render: () => <span>🪙</span>,
              durationMs: 500,
              computeResult: () => ({ landedAtRem: 2.4 }),
              onEnter: () => setLog((prev) => [...prev, "1段目：落下中（onEnter）"]),
            },
            {
              render: (result) => <span>💥 x={result?.landedAtRem}rem</span>,
              onEnter: (result) =>
                setLog((prev) => [...prev, `2段目：着地（前段の結果 landedAtRem=${result?.landedAtRem} を受け取った）`]),
            },
          ]}
        />
      </div>
      {log.length > 0 && (
        <ul className="features-list" style={{ marginTop: "0.5rem" }}>
          {log.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

// react-toastify の Introduction ページ（The playground）を参考にしたレイアウト。
// 左：操作パネル（variant / with / intensity / text / note / color）
// 右：今の操作パネルの状態から生成した、実際に呼び出すコードのプレビュー
const ALL_VARIANTS = CELEBRATE_VARIANT_NAMES;
const DEFAULT_PLAYGROUND_COLOR = "#d64545";

function formatOptionsSnippet(options: CelebrateVariantOptions, withList: readonly CelebrateVariant[]): string {
  const lines: string[] = [];
  if (withList.length > 0) {
    lines.push(`  with: [${withList.map((w) => `"${w}"`).join(", ")}],`);
  }
  if (options.text) lines.push(`  text: "${options.text}",`);
  if (options.note) lines.push(`  note: "${options.note}",`);
  if (options.intensity !== undefined) lines.push(`  intensity: ${options.intensity},`);
  if (options.theme) lines.push(`  theme: { ...DEFAULT_CELEBRATE_THEME, stampColor: "${options.theme.stampColor}" },`);
  if (lines.length === 0) return "";
  return `, {\n${lines.join("\n")}\n}`;
}

function Playground() {
  const celebrate = useCelebrate();
  const [variant, setVariant] = useState<CelebrateVariant>("confetti");
  const [withList, setWithList] = useState<CelebrateVariant[]>([]);
  const [intensity, setIntensity] = useState(1);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(DEFAULT_PLAYGROUND_COLOR);

  const toggleWith = (target: CelebrateVariant) => {
    setWithList((prev) => (prev.includes(target) ? prev.filter((v) => v !== target) : [...prev, target]));
  };

  const options = useMemo<CelebrateVariantOptions>(() => {
    const o: CelebrateVariantOptions = {};
    if (withList.length > 0) o.with = withList;
    if (text) o.text = text;
    if (note) o.note = note;
    if (intensity !== 1) o.intensity = intensity;
    if (color !== DEFAULT_PLAYGROUND_COLOR) o.theme = { ...DEFAULT_CELEBRATE_THEME, stampColor: color };
    return o;
  }, [withList, text, note, intensity, color]);

  const code = `celebrate("${variant}"${formatOptionsSnippet(options, withList)});`;

  return (
    <section className="playground-card">
      <p className="popit-title">
        <span>🛝</span>
        <span>The playground（カタログ版・Tier 1）</span>
      </p>
      <p className="popit-hint">
        こちらは登録済みの名前（variant）から選ぶ、簡単だが自由度の低い使い方。
        上の「空の構造から作る」が生のパラメータを直接いじるのに対し、こちらは名前を選ぶだけ。
      </p>
      <div className="playground-grid">
        <div className="playground-controls">
          <label>
            variant
            <select value={variant} onChange={(e) => setVariant(e.target.value as CelebrateVariant)}>
              {ALL_VARIANTS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>with（重ねるvariant）</legend>
            <div className="playground-with-list">
              {ALL_VARIANTS.filter((v) => v !== variant).map((v) => (
                <label key={v} className="playground-checkbox">
                  <input type="checkbox" checked={withList.includes(v)} onChange={() => toggleWith(v)} />
                  {v}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            intensity: {intensity.toFixed(2)}
            <input
              type="range"
              min="0.25"
              max="4"
              step="0.25"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
            />
          </label>
          <label>
            text
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="例：合格" />
          </label>
          <label>
            note
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="例：れんぞく 7問" />
          </label>
          <label>
            color
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
        </div>
        <div className="playground-code">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
      <button className="combo-button" onClick={() => celebrate(variant, options)}>
        🚀 Show
      </button>
    </section>
  );
}

const FEATURES = [
  "variantを名前で選ぶだけ（アイコンライブラリと同じ感覚）",
  "with で任意のvariantを重ねられる（合成が汎用）",
  "intensity で見た目・音量・振動が連続的に派手になる",
  "sound / haptic をそれぞれ個別にon/offできる",
  "ボーダーエフェクト（既存コンポーネントの境界線を装飾）が10種類",
  "画面全体エフェクト（rain/lightning/shatter/vignette）にも対応",
  "seed で再現可能なパーティクル生成（テスト・デモ向け）",
  "Tailwind等のビルドパイプライン不要（プレーンCSSのみ）",
  "reduced-motion（アクセシビリティ設定）に全variantが対応",
  "拡張可能な物理エンジンの核（motionProfile / ParticleField）をTier 3として同梱",
];

function Features() {
  return (
    <section className="features-card">
      <p className="popit-title">
        <span>✨</span>
        <span>Features</span>
      </p>
      <ul className="features-list">
        {FEATURES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </section>
  );
}

function DocsHeader() {
  return (
    <header className="docs-header">
      <h1 className="docs-title">@celebrate-js/celebrate</h1>
      <div className="docs-badges">
        <span className="docs-badge">
          <span>npm</span>
          <span>v0.1.0</span>
        </span>
        <span className="docs-badge">
          <span>variants</span>
          <span>{ALL_VARIANTS.length}</span>
        </span>
        <span className="docs-badge">
          <span>border effects</span>
          <span>{BORDER_EFFECT_KINDS.length}</span>
        </span>
      </div>
    </header>
  );
}

export function App() {
  return (
    <CelebrateProvider>
      <DocsHeader />
      <RadialBurstBuilder />
      <ParticleFallBuilder />
      <BorderMechanismBuilder />
      <ClipRevealDemo />
      <SequenceDemo />
      <Playground />
      <Features />
      <PopItGrid />
      <BorderEffectDemo />
      <ComboDemo />
      <EngineDemo />
      <ReactNodeDemo />
      <ScopedDemo />
    </CelebrateProvider>
  );
}
