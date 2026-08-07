import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { ExamplesIndex } from "./examples/ExamplesIndex";
import { FireworksShowcase } from "./examples/FireworksShowcase";
import { QuizExample } from "./examples/QuizExample";
import { GameExample } from "./examples/GameExample";
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
  hasHapticForCelebration,
  durationForCelebration,
  CELEBRATE_VARIANT_NAMES,
  type CelebrateVariant,
  type CelebrateVariantOptions,
  type ClipRevealEdge,
  type CelebrateStampShape,
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
  type FireworkStyle,
} from "../../src/index";

// カタログ（Tier1・25 variant）を公式ドキュメントとして提示するセクション。
// recipes.tsxの8カテゴリ（UXの意味でグルーピングした並び順）をそのまま踏襲し、
// 1 variant＝1カードで「名前・説明・呼び出しコード・試すボタン」を並べる。
// 各カテゴリの理論的根拠はdocs/catalog-rationale.md参照。

interface CatalogVariantSpec {
  variant: CelebrateVariant;
  description: string;
  text?: string;
  note?: string;
}

interface CatalogCategory {
  title: string;
  description: string;
  variants: readonly CatalogVariantSpec[];
}

const CATALOG_CATEGORIES: readonly CatalogCategory[] = [
  {
    title: "① 入力フィードバック",
    description: "ボタン等を押した「軽いタップ確認」に使う。",
    variants: [
      { variant: "pop", description: "中心から広がって消える、いちばん軽いフィードバック。" },
      { variant: "ripple", description: "波紋のように広がる。ボタンのタップ確認に。" },
      { variant: "checkmark", description: "円が描かれてからチェックが描き込まれる。正解・完了の定番表現。" },
    ],
  },
  {
    title: "② 達成",
    description: "正解・完了・順位など「できた」を示す。",
    variants: [
      { variant: "stamp", description: "印影スタンプ。短い文字が押されたように現れて留まる。", text: "正" },
      { variant: "medal", description: "リボン付きのメダル。stampより「授与された」感が強い。", text: "1" },
      { variant: "bounce", description: "弾むように現れる短いテキスト。", text: "Nice!" },
    ],
  },
  {
    title: "③ 報酬",
    description: "ご褒美・大当たり。達成よりも一段上の「やった！」感。",
    variants: [
      { variant: "confetti", description: "紙吹雪が舞う、定番の祝福演出。" },
      { variant: "sparkle", description: "きらめきが散る。" },
      {
        variant: "record",
        description: "自己ベスト更新を示す全画面バナー。",
        text: "Congratulations!",
        note: "れんぞく 7問",
      },
      { variant: "flash", description: "一瞬強く光る。" },
      { variant: "ring", description: "二重の輪が外へ広がって消える。" },
      { variant: "firework", description: "複数の破裂点が時間差で咲く花火。" },
    ],
  },
  {
    title: "④ リアクション",
    description: "絵文字で気持ちを表す。",
    variants: [
      { variant: "heart", description: "ハートが舞う。" },
      { variant: "star", description: "星が舞う。" },
      { variant: "emoji", description: "絵文字が舞う（既定は🎉✨🎊👍）。" },
    ],
  },
  {
    title: "⑤ キャラクター・ナラティブ",
    description: "粒や記号ではなく1つの主体が動く。",
    variants: [
      { variant: "cracker", description: "クラッカーが弾けて紙テープが飛ぶ。" },
      { variant: "float", description: "文字や雲形がふわふわ漂う。" },
    ],
  },
  {
    title: "⑥ 環境演出",
    description: "画面全体への効果。",
    variants: [
      { variant: "sakura", description: "桜の花びらが舞い落ちる。" },
      { variant: "shake", description: "画面全体が揺れる。" },
      { variant: "hitstop", description: "一瞬の間（フレーム停止感）。" },
      { variant: "vignette", description: "画面端が暗くなる、低体力表現の定番。" },
      { variant: "rain", description: "紙吹雪が画面全体に降り注ぐ。" },
      { variant: "lightning", description: "稲妻が画面を上端から下端まで貫く。" },
    ],
  },
  {
    title: "⑦ 段階エフェクト",
    description: "複数局面が連続する時間軸型。",
    variants: [{ variant: "shatter", description: "画面がひび割れて崩れ落ちる。" }],
  },
  {
    title: "⑧ テキストチャネル",
    description: "浮遊する数値・文字。",
    variants: [{ variant: "popup", description: "「+1」のような数値・文字が浮かんで消える。", text: "+1" }],
  },
];

// firework専用：カタログカードに種類（fireworkStyle）選択ドロップダウンを出すための一覧。
const FIREWORK_STYLE_OPTIONS: readonly { value: FireworkStyle; label: string }[] = [
  { value: "peony", label: "peony（牡丹）" },
  { value: "willow", label: "willow（柳）" },
  { value: "ring", label: "ring（輪）" },
  { value: "kiku", label: "kiku（菊）" },
  { value: "star", label: "star（型物・星形）" },
  { value: "senrin", label: "senrin（千輪）" },
  { value: "hachi", label: "hachi（蜂）" },
];
const DEFAULT_FIREWORK_STYLE: FireworkStyle = "peony";

function catalogCallSnippet(spec: CatalogVariantSpec, fireworkStyle?: FireworkStyle): string {
  const optionLines: string[] = [];
  if (spec.text) optionLines.push(`text: "${spec.text}"`);
  if (spec.note) optionLines.push(`note: "${spec.note}"`);
  if (fireworkStyle && fireworkStyle !== DEFAULT_FIREWORK_STYLE) optionLines.push(`fireworkStyle: "${fireworkStyle}"`);
  const options = optionLines.length > 0 ? `, { ${optionLines.join(", ")} }` : "";
  return `celebrate("${spec.variant}"${options});`;
}

function CatalogCard({ spec }: { spec: CatalogVariantSpec }) {
  const celebrate = useCelebrate();
  const [fireworkStyle, setFireworkStyle] = useState<FireworkStyle>(DEFAULT_FIREWORK_STYLE);
  const isFirework = spec.variant === "firework";

  const fire = () => {
    // spec.variantは（一覧から来る）変数なのでリテラルでの絞り込みができず、celebrate()の
    // 型はCelebrateVariantOptions全体を緩く受け付ける側になる。ここでは変数に組み立ててから
    // 渡す（オブジェクトリテラルを直接渡すと、text/note/fireworkStyleのように別variant同士の
    // optionを混在させた時にexcess propertyでコンパイルエラーになるため）。
    const options: CelebrateVariantOptions = { text: spec.text, note: spec.note };
    if (isFirework) options.fireworkStyle = fireworkStyle;
    celebrate(spec.variant, options);
  };

  return (
    <div className="catalog-card">
      <div className="catalog-card-head">
        <code className="catalog-card-name">{spec.variant}</code>
        {hasSoundForCelebration(spec.variant) && (
          <span className="catalog-card-sound" title="効果音あり">
            🔈
          </span>
        )}
      </div>
      <p className="catalog-card-description">{spec.description}</p>
      {isFirework && (
        <label className="catalog-card-style-select">
          種類
          <select value={fireworkStyle} onChange={(e) => setFireworkStyle(e.target.value as FireworkStyle)}>
            {FIREWORK_STYLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <pre className="catalog-card-code">
        <code>{catalogCallSnippet(spec, isFirework ? fireworkStyle : undefined)}</code>
      </pre>
      <button className="catalog-card-trigger" onClick={fire}>
        試す
      </button>
    </div>
  );
}

function CatalogSection() {
  return (
    <section id="catalog" className="doc-section">
      <p className="section-title">
        <span>📖</span>
        <span>カタログ（Tier 1）</span>
      </p>
      <p className="section-hint">
        名前で選ぶだけの、最も簡単な使い方。UXの意味（どの瞬間に使うか）でグルーピングしてある
        （実装上の構造ではない。理論的根拠は<code>docs/catalog-rationale.md</code>参照）。
      </p>
      {CATALOG_CATEGORIES.map((category) => (
        <div key={category.title} className="catalog-category">
          <h3 className="catalog-category-title">{category.title}</h3>
          <p className="catalog-category-description">{category.description}</p>
          <div className="catalog-grid">
            {category.variants.map((v) => (
              <CatalogCard key={v.variant} spec={v} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// ボーダー系エフェクト（useCelebrateBorder）。celebrate() のオーバーレイと違い、
// 既存コンポーネント自身の境界線を光らせる／回転させる第3の方式のデモ。
function BorderEffectDemo() {
  const { ref, celebrateBorder } = useCelebrateBorder<HTMLDivElement>();
  const [intensity, setIntensity] = useState(1);

  return (
    <section className="doc-section">
      <p className="section-title">
        <span>🖼️</span>
        <span>ボーダーエフェクト（カタログ・Tier 1）</span>
      </p>
      <p className="section-hint">
        オーバーレイを重ねるのではなく、このカード自身の境界線を光らせる／回転させる、 celebrate()とは別の小さなAPI（
        <code>useCelebrateBorder()</code>）。 アイコンライブラリのように名前で選ぶだけ（{BORDER_EFFECT_KINDS.length}
        種類。 中身は後述の「ボーダー」構造テンプレートと同じ2機構）。intensityはglow/conicRing/class
        3機構すべてに同じduration倍率で効く。
      </p>
      <label className="section-hint" style={{ display: "block", marginBottom: "0.5rem" }}>
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
    <section className="doc-section">
      <p className="section-title">
        <span>🔥</span>
        <span>Intensity（連続的な強度）</span>
      </p>
      <p className="section-hint">
        <code>intensity</code>で見た目・音量・振動を連続的に派手にできる。連打するほどintensityを上げる
        「コンボ」のような使い方の例（{COMBO_RESET_MS}ms押さないとリセット）。
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

// 絵文字ではなく自作SVG（DiamondShapeと同じ形）で「可愛い」を表現する：
// 4方向に伸びる小さなキラキラ星形を、パステルカラーパレットから色を変えて散らす。
const SPIRAL_PALETTE = ["#ff8fab", "#ffd6a5", "#caffbf", "#a0c4ff", "#bdb2ff"];

function SparkleShape({ color, sizeRem }: { color: string; sizeRem: number }) {
  return (
    <svg
      width={`${sizeRem}rem`}
      height={`${sizeRem}rem`}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.15))" }}
    >
      <path
        d="M12 0 C12 6.5 13.2 10 20.5 12 C13.2 14 12 17.5 12 24 C12 17.5 10.8 14 3.5 12 C10.8 10 12 6.5 12 0 Z"
        fill={color}
      />
    </svg>
  );
}

// エンジン直利用（Tier 3）：celebrate()もCATALOGも経由しない。ParticleFieldを
// 直接JSXに置き、motionは自作関数・見た目も自由なReactNode（自作SVG）を渡す。
function EngineDemo() {
  const [fireKey, setFireKey] = useState(0);

  return (
    <section className="doc-section">
      <p className="section-title">
        <span>⚙️</span>
        <span>自作の動き（Tier 3・MotionProfile）</span>
      </p>
      <p className="section-hint">
        celebrate()を経由せず<code>ParticleField</code>を直接置く。<code>motion</code>は<code>MOTION_PROFILES</code>
        に登録されていない自作関数（渦巻き）でも、型さえ満たせばそのまま渡せる。 見た目（<code>render</code>
        ）も自由なReactNode。
      </p>
      <button className="combo-button" onClick={() => setFireKey((k) => k + 1)}>
        spiral 発火
      </button>
      <div
        style={{
          position: "relative",
          height: "11rem",
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ParticleField
          key={fireKey}
          particles={Array.from({ length: 36 }, (_, i) => ({
            motion: spiralMotion,
            params: {
              radius: 1.4 + (i % 5) * 0.55,
              angularSpeed: 3.4 + (i % 4) * 0.5,
              fallSpeed: 1.3,
              durationSeconds: 3.2,
            },
            durationSeconds: 3.2,
            delaySeconds: i * 0.05,
            render: <SparkleShape color={SPIRAL_PALETTE[i % SPIRAL_PALETTE.length]!} sizeRem={0.7 + (i % 3) * 0.25} />,
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
        background: "#fff",
        color: "#2b2620",
        border: "1px solid #e6e1d8",
        fontWeight: 800,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 20px -6px rgba(0, 0, 0, 0.35)",
      }}
    >
      🛠️ 自作コンポーネント
    </span>
  );
}

function ReactNodeDemo() {
  const celebrate = useCelebrate();
  return (
    <section className="doc-section">
      <p className="section-title">
        <span>🧩</span>
        <span>ReactNodeをそのまま渡す</span>
      </p>
      <p className="section-hint">
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
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
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
    <section className="doc-section">
      <p className="section-title">
        <span>🪟</span>
        <span>ローカルスコープ（container）</span>
      </p>
      <p className="section-hint">
        <code>{"<CelebrateProvider container={ref}>"}</code>
        にすると、rain/lightning/shatterのような全画面variantを画面全体ではなくこの枠の中だけに閉じ込められる。
        右のボタンは比較用（shake/hitstopは<code>useContainerModifier()</code>
        を直接使うTier3の例で、常に画面全体が対象）。
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

// 構造テンプレートのデモ。variant名のカタログを経由せず、構造テンプレート
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
    <section className="doc-section">
      <p className="section-title">
        <span>🧱</span>
        <span>構造テンプレート：RadialBurst</span>
      </p>
      <p className="section-hint">
        variantのカタログ（名前）を経由せず、構造テンプレートに生のパラメータを渡して組み立てる。 pop / ripple / ring /
        flash は全部これのプリセット違いでしかない＝カタログにない組み合わせもここで自由に作れる。
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
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={scaleFrom}
              onChange={(e) => setScaleFrom(Number(e.target.value))}
            />
          </label>
          <label>
            scaleTo（layer 0基準）: {scaleTo.toFixed(2)}
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.05"
              value={scaleTo}
              onChange={(e) => setScaleTo(Number(e.target.value))}
            />
          </label>
          <label>
            size（rem・layer 0基準）: {size.toFixed(2)}
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.1"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
          <label>
            durationMs: {durationMs}
            <input
              type="range"
              min="150"
              max="1500"
              step="50"
              value={durationMs}
              onChange={(e) => setDurationMs(Number(e.target.value))}
            />
          </label>
          <label>
            layers: {layerCount}
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={layerCount}
              onChange={(e) => setLayerCount(Number(e.target.value))}
            />
          </label>
          <label>
            layer間のdelayMs: {layerDelayMs}
            <input
              type="range"
              min="0"
              max="400"
              step="10"
              value={layerDelayMs}
              onChange={(e) => setLayerDelayMs(Number(e.target.value))}
            />
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

// 構造テンプレートのデモ・その2：ParticleField + fallMotion。rain（雨）も
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
  const [natural, setNatural] = useState(false);
  const [fireKey, setFireKey] = useState(0);

  const renderNodeFor = (index: number): ReactNode =>
    renderKind === "glyph" ? (
      <span style={{ fontSize: "1.1rem" }}>{glyph}</span>
    ) : (
      <DiamondShape color={SHAPE_PALETTE[index % SHAPE_PALETTE.length]!} />
    );

  // 既定は「揃った」並び（startX等分・delay等分・swayFrequencyが3値しか無い）にしている。
  // 見た目には正しく動いているが、粒同士が完全に規則的なので「1枚の波」のように
  // 揃って見えてしまう（実際に指摘された点）。natural=trueのときは、同じパラメータを
  // 中心に呼び出し側でランダムに散らす（fallMotion自体は変えず、渡すparamsだけを
  // 粒ごとにばらつかせる＝MotionProfileは決定的なまま、乱数は呼び出し側の責任という
  // 設計に沿っている）。
  //
  // 乱数の「種」はfireKey/count/naturalが変わったときだけ作り直す（useMemo）。
  // これが無いと、Math.random()を描画のたびに呼んでいるだけになり、無関係な
  // スライダーを1つ動かすだけの再描画でも全粒の乱数が再計算されてしまう
  // （「発火を押すたびに」ではなく「何か操作するたびに」変わって見える不具合だった）。
  const naturalOffsets = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        speedFactor: 0.7 + Math.random() * 0.6,
        startXFactor: Math.random() - 0.5,
        swayAmpFactor: 0.4 + Math.random() * 1.2,
        swayFreqFactor: 0.6 + Math.random() * 0.8,
        delaySeconds: Math.random() * 0.6,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fireKey, count, natural]
  );

  const particles = Array.from({ length: count }, (_, i) => {
    const evenStartX = count > 1 ? (i / (count - 1) - 0.5) * spreadX * 2 : 0;
    const evenDelay = (i / count) * 0.4;
    const offset = naturalOffsets[i]!;
    return {
      motion: fallMotion,
      params: {
        fallSpeed: natural ? fallSpeed * offset.speedFactor : fallSpeed,
        startX: natural ? offset.startXFactor * spreadX * 2 : evenStartX,
        swayAmplitude: natural ? swayAmplitude * offset.swayAmpFactor : swayAmplitude,
        swayFrequency: natural ? swayFrequency * offset.swayFreqFactor : swayFrequency + (i % 3) * 0.3,
        durationSeconds,
      },
      durationSeconds,
      delaySeconds: natural ? offset.delaySeconds : evenDelay,
      render: renderNodeFor(i),
    };
  });

  const renderCode =
    renderKind === "glyph"
      ? `<span style={{ fontSize: "1.1rem" }}>${glyph}</span>`
      : `<DiamondShape color={PALETTE[i % PALETTE.length]} />`;

  const code = natural
    ? `<ParticleField
  particles={Array.from({ length: ${count} }, (_, i) => ({
    motion: fallMotion,
    params: {
      // 呼び出し側でMath.random()を使って粒ごとにばらつかせる（fallMotion自体は決定的なまま）
      fallSpeed: ${fallSpeed} * (0.7 + Math.random() * 0.6),
      startX: (Math.random() - 0.5) * ${(spreadX * 2).toFixed(1)},
      swayAmplitude: ${swayAmplitude} * (0.4 + Math.random() * 1.2),
      swayFrequency: ${swayFrequency} * (0.6 + Math.random() * 0.8),
      durationSeconds: ${durationSeconds},
    },
    durationSeconds: ${durationSeconds},
    delaySeconds: Math.random() * 0.6,
    render: ${renderCode},
  }))}
/>`
    : `<ParticleField
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
    <section className="doc-section">
      <p className="section-title">
        <span>❄️</span>
        <span>構造テンプレート：ParticleField（降ってくる系）</span>
      </p>
      <p className="section-hint">
        rain（雨）もsakura（桜吹雪）も実体は同じ<code>ParticleField</code>に<code>fallMotion</code>という
        動き関数とパラメータを渡しているだけ。<code>render</code>は文字列専用ではなく
        <strong>任意のReactNode</strong>（画像・SVG・自作コンポーネントも可）を受け取れる
        ――ここでは文字と自作SVG図形（粒ごとにパレットから色を変える）を切り替えて実演する。
      </p>
      <div className="playground-grid">
        <div className="playground-controls">
          <label>
            個数: {count}
            <input
              type="range"
              min="4"
              max="60"
              step="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <label>
            fallSpeed（rem/秒）: {fallSpeed}
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={fallSpeed}
              onChange={(e) => setFallSpeed(Number(e.target.value))}
            />
          </label>
          <label>
            swayAmplitude（横揺れ幅）: {swayAmplitude.toFixed(1)}
            <input
              type="range"
              min="0"
              max="4"
              step="0.1"
              value={swayAmplitude}
              onChange={(e) => setSwayAmplitude(Number(e.target.value))}
            />
          </label>
          <label>
            swayFrequency（横揺れの速さ）: {swayFrequency.toFixed(1)}
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.1"
              value={swayFrequency}
              onChange={(e) => setSwayFrequency(Number(e.target.value))}
            />
          </label>
          <label>
            durationSeconds: {durationSeconds.toFixed(1)}
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.1"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
            />
          </label>
          <label>
            spreadX（横方向の広がり）: {spreadX}
            <input
              type="range"
              min="2"
              max="24"
              step="1"
              value={spreadX}
              onChange={(e) => setSpreadX(Number(e.target.value))}
            />
          </label>
          <label className="playground-checkbox">
            <input type="checkbox" checked={natural} onChange={(e) => setNatural(e.target.checked)} />
            自然にバラける（乱数で物理演算っぽく散らす）
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
            <p className="section-hint" style={{ margin: 0 }}>
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

// 構造テンプレートのデモ・その3：ボーダー系は実質2機構（glowのbox-shadowパルス/
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
    <section className="doc-section">
      <p className="section-title">
        <span>🖼️</span>
        <span>構造テンプレート：ボーダー（glow/conicRing）</span>
      </p>
      <p className="section-hint">
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

// 構造テンプレートのデモ・その4：ClipReveal（軸I=マスク・リビール）。
// RadialBurst/ParticleField/StrokePathとは別の描画軸（覆いをclip-pathで動かして
// 中身を出し入れする）であることの実演。中身には自作コンポーネント（画像の代わりに絵文字）を置く。
const CLIP_REVEAL_EDGES: readonly ClipRevealEdge[] = ["left", "right", "top", "bottom", "center"];

const GIFT_CONTENT_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff7e6",
};

function ClipRevealDemo() {
  const [edge, setEdge] = useState<ClipRevealEdge>("left");
  const [direction, setDirection] = useState<"reveal" | "cover">("reveal");
  const [color, setColor] = useState("#2b2b2b");
  const [fireKey, setFireKey] = useState(0);
  // ClipRevealは他のTier3プリミティブ（RadialBurst/ParticleField等）と同じく
  // 「マウントした瞬間から即アニメーションが始まる」一発仕込みの構造で、celebrate()の
  // 使い方（発火した瞬間だけマウントする）を前提にしている。このdemoでも同様に、
  // 発火するまでは実体をマウントせず、静止した「発火前の状態」だけを描く
  // （reveal＝覆われている、cover＝開いている）。ページ読み込み時から常時マウントしていると、
  // 見る頃にはアニメーションがとっくに終わって逆の状態で静止して見える。
  const [fired, setFired] = useState(false);

  // 一度発火した後にedge/direction/colorを変えても、前回発火したClipRevealが
  // 最終状態のまま残り続けて画面が更新されない（fireKeyを変えて再発火するまで
  // 何も反映されない）と、「設定を変えたのに前回の残像が今の設定の初期状態に
  // 見えてしまい、向きが逆に見える」という混乱の元になる。設定が変わったら
  // 毎回、発火前の静止状態まで一旦戻す。
  useEffect(() => {
    setFired(false);
  }, [edge, direction, color]);

  const code = `<ClipReveal edge="${edge}" direction="${direction}" color="${color}">\n  <span>🎁</span>\n</ClipReveal>`;

  return (
    <section className="doc-section">
      <p className="section-title">
        <span>🎬</span>
        <span>構造テンプレート：ClipReveal（軸I=マスク・リビール）</span>
      </p>
      <p className="section-hint">
        RadialBurst（scale+opacity）/ParticleField（粒）/StrokePath（線）とは別の軸： 覆いを<code>clip-path</code>
        で動かして中身を出し入れする（緞帳ワイプ）。
        <code>direction="cover"</code>は同じ経路の逆再生（覆いが閉じる）。
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
            <select value={direction} onChange={(e) => setDirection(e.target.value as "reveal" | "cover")}>
              <option value="reveal">reveal（覆いが晴れる）</option>
              <option value="cover">cover（覆いが閉じる）</option>
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
      <button
        className="combo-button"
        onClick={() => {
          setFireKey((k) => k + 1);
          setFired(true);
        }}
      >
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
        {fired ? (
          <ClipReveal key={fireKey} edge={edge} direction={direction} color={color}>
            <span style={GIFT_CONTENT_STYLE}>🎁</span>
          </ClipReveal>
        ) : direction === "reveal" ? (
          // 発火前の静止した状態（reveal＝覆われている）。ClipReveal自体はマウント直後から
          // アニメーションが動き出すため、静止画は生のdivで代用する（celebrate-clip-revealの
          // クラスを付けるとその場でアニメーションが始まってしまうため使えない）。
          <span style={{ width: "100%", height: "100%", background: color }} />
        ) : (
          // 発火前の静止した状態（cover＝開いている）。
          <span style={GIFT_CONTENT_STYLE}>🎁</span>
        )}
      </div>
    </section>
  );
}

// 構造テンプレートのデモ・その5：Sequence（合成層。軸F=staged-sequence）。
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
    <section className="doc-section">
      <p className="section-title">
        <span>🎞️</span>
        <span>合成層：Sequence</span>
      </p>
      <p className="section-hint">
        <code>with</code>（parallel相当・同時に重ねる）とは別軸：前段が終わってから次段が始まり、
        前段の実行結果（ここでは「落下地点のx座標」）を次段の<code>render</code>へ渡せる。 各ステップの
        <code>onEnter</code>で効果音・振動をステップ単位に鳴らせる（ここではログ表示で代用）。
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
                setLog((prev) => [
                  ...prev,
                  `2段目：着地（前段の結果 landedAtRem=${result?.landedAtRem} を受け取った）`,
                ]),
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
  if (options.sizeRem !== undefined) lines.push(`  sizeRem: ${options.sizeRem},`);
  if (options.rotateDeg !== undefined) lines.push(`  rotateDeg: ${options.rotateDeg},`);
  if (options.shape !== undefined) lines.push(`  shape: "${options.shape}",`);
  if (options.colors) lines.push(`  colors: [${options.colors.map((c) => `"${c}"`).join(", ")}],`);
  if (options.theme) lines.push(`  theme: { ...DEFAULT_CELEBRATE_THEME, stampColor: "${options.theme.stampColor}" },`);
  if (lines.length === 0) return "";
  return `, {\n${lines.join("\n")}\n}`;
}

// このvariantにこのoptionが実際に効くかどうか（recipes.tsxのrender関数が
// 実際に参照しているかどうかと一致させる）。合わないoptionをUIに出しっぱなしにすると
// 「効かないのに設定できるように見える」ミスリードになるため、Playgroundでは
// 選んだvariantに応じてコントロール自体を出し分ける。
const TEXT_VARIANTS = new Set<CelebrateVariant>(["stamp", "record", "bounce", "medal", "popup"]);
const NOTE_VARIANTS = new Set<CelebrateVariant>(["record"]);
const SIZE_VARIANTS = new Set<CelebrateVariant>(["firework", "pop", "ripple", "ring", "flash"]);
const ROTATE_VARIANTS = new Set<CelebrateVariant>(["stamp"]);
const SHAPE_VARIANTS = new Set<CelebrateVariant>(["stamp"]);
const STAMP_SHAPES: readonly CelebrateStampShape[] = ["rounded", "circle", "square", "star"];
// 色の指定方法がvariantによって違う：RadialBurst系(pop/ripple/ring/flash)・stamp系・record等は
// theme.stampColorの単色上書き（options.color→なければtheme経由）で効くが、粒の集合を
// 複数トーンで塗るvariant（confetti/sparkle/cracker/rain/firework）はtheme.confettiColors
// （4色パレット）かoptions.colorsでしか色を変えられず、stampColorを変えても何も起きない
// （実際にこれで「fireworkで色を変えても反映されない」というバグを踏んだ）。
// Playgroundの1つの色スウォッチをどちらに流し込むかを、選んだvariantで出し分ける。
const PALETTE_VARIANTS = new Set<CelebrateVariant>(["confetti", "sparkle", "cracker", "rain", "firework"]);

function Playground() {
  const celebrate = useCelebrate();
  const [variant, setVariant] = useState<CelebrateVariant>("confetti");
  const [withList, setWithList] = useState<CelebrateVariant[]>([]);
  const [intensity, setIntensity] = useState(1);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(DEFAULT_PLAYGROUND_COLOR);
  const [sizeRem, setSizeRem] = useState<number | null>(null);
  const [rotateDeg, setRotateDeg] = useState<number | null>(null);
  const [shape, setShape] = useState<CelebrateStampShape | null>(null);
  const supportsText = TEXT_VARIANTS.has(variant);
  const supportsNote = NOTE_VARIANTS.has(variant);
  const supportsSize = SIZE_VARIANTS.has(variant);
  const supportsRotate = ROTATE_VARIANTS.has(variant);
  const supportsShape = SHAPE_VARIANTS.has(variant);
  const usesPalette = PALETTE_VARIANTS.has(variant);

  const toggleWith = (target: CelebrateVariant) => {
    setWithList((prev) => (prev.includes(target) ? prev.filter((v) => v !== target) : [...prev, target]));
  };

  const options = useMemo<CelebrateVariantOptions>(() => {
    const o: CelebrateVariantOptions = {};
    if (withList.length > 0) o.with = withList;
    if (supportsText && text) o.text = text;
    if (supportsNote && note) o.note = note;
    if (intensity !== 1) o.intensity = intensity;
    if (supportsSize && sizeRem !== null) o.sizeRem = sizeRem;
    if (supportsRotate && rotateDeg !== null) o.rotateDeg = rotateDeg;
    if (supportsShape && shape !== null) o.shape = shape;
    if (color !== DEFAULT_PLAYGROUND_COLOR) {
      if (usesPalette) {
        o.colors = [color];
      } else {
        o.theme = { ...DEFAULT_CELEBRATE_THEME, stampColor: color };
      }
    }
    return o;
  }, [
    withList,
    text,
    note,
    intensity,
    sizeRem,
    rotateDeg,
    shape,
    color,
    supportsText,
    supportsNote,
    supportsSize,
    supportsRotate,
    supportsShape,
    usesPalette,
  ]);

  const code = `celebrate("${variant}"${formatOptionsSnippet(options, withList)});`;

  return (
    <section className="doc-section">
      <p className="section-title">
        <span>🛝</span>
        <span>The playground（options全体を試す・Tier 1）</span>
      </p>
      <p className="section-hint">
        上のカタログが1 variant＝1個のシンプルな呼び出しだったのに対し、こちらは
        <code>with</code>/<code>intensity</code>/<code>text</code>等の<code>CelebrateVariantOptions</code>を
        自由に組み合わせて試せる。構造テンプレート（下記）は名前を経由せず生のパラメータを直接いじる、さらに下の層。
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
          {supportsSize && (
            <>
              <label className="playground-checkbox">
                <input
                  type="checkbox"
                  checked={sizeRem !== null}
                  onChange={(e) => setSizeRem(e.target.checked ? 5 : null)}
                />
                sizeRem を指定する（絶対サイズ）
              </label>
              {sizeRem !== null && (
                <label>
                  sizeRem: {sizeRem.toFixed(1)}rem
                  <input
                    type="range"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={sizeRem}
                    onChange={(e) => setSizeRem(Number(e.target.value))}
                  />
                </label>
              )}
            </>
          )}
          {supportsRotate && (
            <>
              <label className="playground-checkbox">
                <input
                  type="checkbox"
                  checked={rotateDeg !== null}
                  onChange={(e) => setRotateDeg(e.target.checked ? -6 : null)}
                />
                rotateDeg を指定する（傾き）
              </label>
              {rotateDeg !== null && (
                <label>
                  rotateDeg: {rotateDeg}deg
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={rotateDeg}
                    onChange={(e) => setRotateDeg(Number(e.target.value))}
                  />
                </label>
              )}
            </>
          )}
          {supportsShape && (
            <label>
              shape
              <select
                value={shape ?? ""}
                onChange={(e) => setShape(e.target.value === "" ? null : (e.target.value as CelebrateStampShape))}
              >
                <option value="">（既定：rounded）</option>
                {STAMP_SHAPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}
          {supportsText && (
            <label>
              text
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="例：合格" />
            </label>
          )}
          {supportsNote && (
            <label>
              note
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例：れんぞく 7問"
              />
            </label>
          )}
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
    <section className="doc-section">
      <p className="section-title">
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
      <p className="docs-tagline">
        React向けの祝福・反応エフェクトライブラリ。名前で選ぶだけのカタログから、生のパラメータを直接いじる構造テンプレートまで、3段階の自由度で使える。
      </p>
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
      <p className="docs-examples-link">
        <Link to="/examples">🎮 実装例を見る（花火大会・クイズ・ミニゲーム）→</Link>
      </p>
    </header>
  );
}

const QUICKSTART_CODE = `import { CelebrateProvider, useCelebrate } from "@celebrate-js/celebrate/react";

function App() {
  return (
    <CelebrateProvider>
      <AnswerButton />
    </CelebrateProvider>
  );
}

function AnswerButton() {
  const celebrate = useCelebrate();
  return <button onClick={() => celebrate("confetti")}>正解</button>;
}`;

function Quickstart() {
  return (
    <section className="doc-section">
      <p className="section-title">
        <span>🚀</span>
        <span>Quickstart</span>
      </p>
      <p className="section-hint">
        <code>npm install @celebrate-js/celebrate</code>。あとは
        <code>{"<CelebrateProvider>"}</code>で包んで<code>useCelebrate()</code>を呼ぶだけ。
        3段階（Tier）の自由度がある：①名前で選ぶカタログ（下記）、②複数局面を順番に切り替える合成層 （<code>with</code>/
        <code>Sequence</code>）、③構造テンプレートに生のパラメータを渡すTier 3。 詳細は
        <a href="#catalog">上のカタログ</a>と<a href="#api-reference">下のAPIリファレンス</a>参照（リポジトリの
        <code>docs/</code>にも同内容のmarkdown版がある）。
      </p>
      <pre className="playground-code">
        <code>{QUICKSTART_CODE}</code>
      </pre>
    </section>
  );
}

function SectionDivider({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="section-divider">
      <h2>
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      <p>{description}</p>
    </div>
  );
}

// APIリファレンス：docs/api-reference.mdの内容をこのページ上でも読めるようにしたもの
// （リンクだけだと生のmarkdownファイルへ飛ぶだけになり、ドキュメントページとして
// 情報量が足りないため、propsの型・既定値・説明の一覧をそのまま埋め込む）。
interface ApiRow {
  name: string;
  type: string;
  defaultValue?: string;
  desc: string;
}

function ApiTable({ rows }: { rows: readonly ApiRow[] }) {
  return (
    <table className="api-table">
      <thead>
        <tr>
          <th>prop</th>
          <th>type</th>
          <th>既定値</th>
          <th>説明</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>
              <code>{row.name}</code>
            </td>
            <td>
              <code>{row.type}</code>
            </td>
            <td>{row.defaultValue ?? "-"}</td>
            <td>{row.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ApiSubsection({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="api-subsection">
      <h3>{title}</h3>
      {note && <p className="section-hint">{note}</p>}
      {children}
    </div>
  );
}

const CELEBRATE_PROVIDER_PROPS: readonly ApiRow[] = [
  {
    name: "theme",
    type: "CelebrateTheme",
    defaultValue: "組み込みの既定テーマ",
    desc: "意匠（色・角丸・書体）。個々のcelebrate()呼び出しで上書き可能。",
  },
  {
    name: "container",
    type: "RefObject<HTMLElement | null>",
    desc: "指定すると、rain/lightning/shatterのような画面全体エフェクトをviewport全体ではなくこの要素の内側に閉じ込める（position: relativeをこの要素に設定しておくこと）。省略時はdocument.body。",
  },
];

const CELEBRATE_OPTIONS: readonly ApiRow[] = [
  {
    name: "anchor",
    type: "RefObject<HTMLElement | null>",
    desc: "演出の基準にする要素。省略＝画面中央（グローバル）。渡す＝その要素の中心（ローカル）。",
  },
  {
    name: "text",
    type: "string",
    defaultValue: '""',
    desc: "stamp / record / bounce / medal / popupで大きく出す文字。",
  },
  { name: "note", type: "string", desc: "recordで大きい文字の下に添える一言（例：「れんぞく 7問」）。" },
  { name: "size", type: '"md" | "lg"', defaultValue: '"md"', desc: "stampの印影の大きさ。" },
  { name: "rotateDeg", type: "number", defaultValue: "-6", desc: "stamp：収まった後の傾き（度）。" },
  {
    name: "shape",
    type: '"rounded" | "circle" | "square" | "star"',
    defaultValue: '"rounded"',
    desc: "stamp：外枠の形。roundedはtheme.stampRadius任せの角丸（既定）。",
  },
  {
    name: "with",
    type: "CelebrateVariant | ReactNode | (...)[]",
    desc: "重ねて同時に出すもの。登録済みの名前・生のReactNode・その配列（混在可）。",
  },
  { name: "theme", type: "CelebrateTheme", defaultValue: "Providerのtheme", desc: "この呼び出しだけ意匠を上書き。" },
  { name: "sound", type: "boolean", defaultValue: "true", desc: "効果音を鳴らすか。登録済みの名前にだけ効果を持つ。" },
  {
    name: "haptic",
    type: "boolean",
    defaultValue: "true",
    desc: "端末を振動させるか。登録済みの名前にだけ効果を持つ。",
  },
  {
    name: "seed",
    type: "number",
    defaultValue: "ランダム",
    desc: "sparkle/sakura/heart/star/emoji/cracker：再現可能なテスト・デモ用。",
  },
  {
    name: "glyphs",
    type: "readonly string[]",
    defaultValue: "variantごとの定番セット",
    desc: "heart/star/emoji：撒く文字・絵文字を上書き。",
  },
  {
    name: "glyph",
    type: "string",
    defaultValue: "CSSで描いた雲形",
    desc: "float：漂わせる文字を指定（絵文字ではなく雲がデフォルト）。",
  },
  {
    name: "color",
    type: "string",
    defaultValue: "淡いピンク／theme",
    desc: "sakura：花びらの色。pop/ripple/ring/flash：色の既定値を上書き。",
  },
  {
    name: "scale",
    type: "number",
    defaultValue: "1",
    desc: "見た目の大きさ倍率。firework/pop/ripple/ring/flashが対応。",
  },
  {
    name: "sizeRem",
    type: "number",
    defaultValue: "-",
    desc: "見た目の大きさの絶対値（rem）。scaleと違い基準サイズを意識せず直接remで指定できる。両方指定するとsizeRemが優先される。",
  },
  {
    name: "colors",
    type: "readonly string[]",
    defaultValue: "theme.confettiColors",
    desc: "confetti/sparkle/cracker/rain/firework：色パレットの上書き。theme.stampColorではなくtheme.confettiColorsで塗るため、単色を変えたい場合はcolorではなくこちら。",
  },
  {
    name: "fireworkStyle",
    type: '"peony" | "willow" | "ring" | "kiku" | "star" | "senrin" | "hachi"',
    defaultValue: '"peony"',
    desc: "firework：花火の種類（牡丹・柳・輪・菊・型物/星形・千輪・蜂）。",
  },
  {
    name: "intensity",
    type: "number",
    defaultValue: "1",
    desc: "演出の強度。拡大率・duration・音量・振動に対数カーブで反映。",
  },
  {
    name: "soundPreset",
    type: "number",
    defaultValue: "variantごとの既定音",
    desc: "効果音のpreset番号（SPARKLE_SOUND_PRESETSの添字）を上書きする。色やscaleと同じく、どの音を鳴らすかは呼び出し側が目的・用途に応じて決めるもの。",
  },
  {
    name: "durationMs",
    type: "number",
    defaultValue: "自動計算",
    desc: "表示し続ける時間の明示的な上書き。withに生のReactNodeを渡した場合、そのdurationはカタログから引けないためここで指定する。",
  },
];

const RADIAL_BURST_LAYER_PROPS: readonly ApiRow[] = [
  { name: "shape", type: '"fill" | "outline" | "glow"', desc: "塗り方。" },
  { name: "scaleFrom", type: "number", desc: "開始時のscale。" },
  { name: "scaleTo", type: "number", desc: "終了時のscale。" },
  { name: "size", type: "number", desc: "要素の基準直径（rem）。" },
  { name: "color", type: "string", defaultValue: "呼び出し側の色", desc: "このlayerだけ色を上書き。" },
  { name: "durationMs", type: "number", defaultValue: "500", desc: "このlayer自体のアニメーション長。" },
  { name: "delayMs", type: "number", defaultValue: "0", desc: "発火からの遅延。複数layerを時間差で重ねる場合に使う。" },
];

const RADIAL_BURST_PROPS: readonly ApiRow[] = [
  { name: "scale", type: "number", defaultValue: "1", desc: "見た目の大きさ倍率。各layerのsizeにだけ掛かる。" },
  {
    name: "color",
    type: "string",
    defaultValue: "theme.stampColor",
    desc: "色の既定値。layer自身のcolorが優先される。",
  },
  {
    name: "origin",
    type: "readonly RadialOriginKeyframe[]",
    desc: "原点（全layer共通の中心点）が経路上を移動する場合の経由点（2点以上）。省略時は原点固定。{offset: 0〜1, xRem, yRem}の配列で、Element.animateで駆動する。",
  },
  { name: "originDurationMs", type: "number", defaultValue: "800", desc: "原点移動アニメーションの長さ。" },
];

const PARTICLE_SPEC_PROPS: readonly ApiRow[] = [
  {
    name: "motion",
    type: "MotionProfile<P>",
    desc: "(elapsedSeconds, params) => ParticleStateを満たす関数。プリセット（fallMotion等）か自作関数。",
  },
  { name: "params", type: "P", desc: "motionに渡すパラメータ。" },
  { name: "durationSeconds", type: "number", desc: "この粒の表示時間。" },
  { name: "delaySeconds", type: "number", defaultValue: "0", desc: "発火からの遅延。" },
  {
    name: "render",
    type: "ReactNode | ((state) => ReactNode)",
    defaultValue: "defaultRender",
    desc: "見た目。状態に応じて変えたい場合は関数で渡す。",
  },
];

const STROKE_LINE_PROPS: readonly ApiRow[] = [
  { name: "points", type: "string", desc: "SVG polylineのpoints属性にそのまま渡せる文字列（直線区間のみ）。" },
  { name: "d", type: "string", desc: "SVG pathのd属性にそのまま渡せる文字列（円弧などの曲線も表現できる）。" },
  { name: "strokeWidth", type: "number", desc: "線の太さ。" },
  { name: "dashLength", type: "number", desc: "stroke-dasharray/dashoffsetに使う値（経路のおおよその長さ）。" },
  { name: "color", type: "string", defaultValue: '"#fff"', desc: "線の色。" },
  { name: "opacity", type: "number", defaultValue: "1", desc: "不透明度。" },
  {
    name: "glow",
    type: '"soft" | "electric"',
    desc: "グローの強さ。electric＝稲光相当、soft＝ヒビ相当。省略でグローなし。",
  },
  { name: "durationMs", type: "number", desc: "描き下ろしのアニメーション長。" },
  { name: "delayMs", type: "number", defaultValue: "0", desc: "発火からの遅延。" },
];

const CLIP_REVEAL_PROPS: readonly ApiRow[] = [
  {
    name: "edge",
    type: '"left" | "right" | "top" | "bottom" | "center"',
    defaultValue: '"left"',
    desc: "どの方向へワイプするか。centerは円形のワイプ。",
  },
  {
    name: "direction",
    type: '"reveal" | "cover"',
    defaultValue: '"reveal"',
    desc: "reveal＝覆いが晴れて中身が見える。cover＝覆いが閉じて中身を隠す（同じ経路の逆再生）。",
  },
  { name: "durationMs", type: "number", defaultValue: "500", desc: "アニメーション長。" },
  { name: "delayMs", type: "number", defaultValue: "0", desc: "発火からの遅延。" },
  { name: "color", type: "string", defaultValue: '"#000"', desc: "カーテン自体の色。" },
  { name: "children", type: "ReactNode", desc: "カーテンの下に見える内容。省略時は単色のカーテンだけを描く。" },
];

const SEQUENCE_PROPS: readonly ApiRow[] = [
  { name: "steps", type: "readonly SequenceStep<TResult>[]", desc: "ステップの一覧。順番に表示する。" },
];

const SEQUENCE_STEP_PROPS: readonly ApiRow[] = [
  {
    name: "render",
    type: "(prevResult) => ReactNode",
    desc: "このステップの内容。前ステップの結果（初段はundefined）を受け取れる。",
  },
  {
    name: "durationMs",
    type: "number",
    desc: "このステップの表示時間。省略時はこのステップで止まる（最後のステップに使う）。",
  },
  {
    name: "computeResult",
    type: "(prevResult) => TResult",
    defaultValue: "前段の結果を引き継ぐ",
    desc: "次のステップに渡す値を計算する。",
  },
  {
    name: "onEnter",
    type: "(prevResult) => void",
    desc: "このステップが始まった瞬間に1回だけ呼ばれる（効果音・振動などをステップ単位に持たせる）。",
  },
];

const ENTER_SETTLE_OPTIONS: readonly ApiRow[] = [
  { name: "scaleFrom", type: "number", defaultValue: "1", desc: "開始時のscale。" },
  { name: "scaleTo", type: "number", defaultValue: "1", desc: "終了時のscale。" },
  {
    name: "translateYFromRem",
    type: "number",
    defaultValue: "0",
    desc: "開始時の縦方向オフセット（rem。負で上から）。",
  },
  { name: "rotateFromDeg", type: "number", defaultValue: "0", desc: "開始時の回転（度）。" },
  {
    name: "rotateToDeg",
    type: "number",
    defaultValue: "0",
    desc: "終了時の回転（度）。傾いたまま留めたい場合（stamp）はここも指定する。",
  },
  {
    name: "easing",
    type: '"settle" | "overshoot"',
    defaultValue: '"settle"',
    desc: "settle＝素直に収まる。overshoot＝行き過ぎてから戻るバネ的な動き（record相当）。",
  },
  { name: "durationMs", type: "number", defaultValue: "300", desc: "アニメーション長。" },
];

const USE_CELEBRATE_BORDER_RETURN: readonly ApiRow[] = [
  { name: "ref", type: "RefObject<T | null>", desc: "装飾したい要素に渡す。" },
  {
    name: "celebrateBorder",
    type: "(trigger?, options?) => void",
    desc: "発火する。triggerはカタログの名前（BorderEffectKind）か、glowPreset()等が返す生のプリセット。",
  },
];

const CELEBRATE_BORDER_OPTIONS: readonly ApiRow[] = [
  {
    name: "intensity",
    type: "number",
    defaultValue: "1",
    desc: "演出の強度。durationに対数カーブで反映される（全機構＝glow/conicRing/class共通で効く）。",
  },
];

interface BorderKindRow {
  kind: string;
  mechanism: string;
  durationMs: number;
  desc: string;
}

const BORDER_KIND_ROWS: readonly BorderKindRow[] = [
  { kind: "glow", mechanism: "glow", durationMs: 900, desc: "box-shadowを外へ広げながらフェードする1回パルス。" },
  { kind: "neon", mechanism: "glow", durationMs: 1000, desc: "ネオンサインのように明滅してから消える。" },
  { kind: "fire", mechanism: "glow", durationMs: 1100, desc: "暖色2色のゆらめき。" },
  { kind: "ice", mechanism: "glow", durationMs: 1100, desc: "寒色2色の静かなシマー。" },
  { kind: "electric", mechanism: "glow", durationMs: 700, desc: "稲妻のような離散的なジッター（neonより速い）。" },
  { kind: "spin", mechanism: "conicRing", durationMs: 1200, desc: "外周をconic-gradientのリングが回り続ける。" },
  { kind: "rainbow", mechanism: "conicRing", durationMs: 900, desc: "虹色のリングが一度だけ現れて消える。" },
  { kind: "ring", mechanism: "class", durationMs: 800, desc: "輪郭のはっきりした二重リングが外へ広がって消える。" },
  { kind: "ants", mechanism: "class", durationMs: 1200, desc: "破線の輪がゆっくり回転する（マーチングアンツ）。" },
  { kind: "shine", mechanism: "class", durationMs: 700, desc: "斜めの光沢が一度だけ横切る。" },
];

function BorderKindTable() {
  return (
    <table className="api-table">
      <thead>
        <tr>
          <th>kind</th>
          <th>機構</th>
          <th>既定duration</th>
          <th>説明</th>
        </tr>
      </thead>
      <tbody>
        {BORDER_KIND_ROWS.map((row) => (
          <tr key={row.kind}>
            <td>
              <code>{row.kind}</code>
            </td>
            <td>
              <code>{row.mechanism}</code>
            </td>
            <td>{row.durationMs}ms</td>
            <td>{row.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const USE_CONTAINER_MODIFIER_ARGS: readonly ApiRow[] = [
  { name: "className", type: "string", desc: "<html>に付け外しするクラス名。" },
  { name: "durationMs", type: "number", desc: "このクラスを保持する時間。" },
];

const REWARD_TIER_PROPS: readonly ApiRow[] = [
  { name: "chance", type: "number", desc: "この階級が選ばれる相対重み（合計が1である必要はない）。" },
  { name: "with", type: "W", desc: "この階級で重ねるもの（celebrate()のoptions.withにそのまま渡せる）。" },
];

// variant一覧テーブル：名前・カテゴリ・duration・sound/hapticの有無。
// ハードコードした数値を別途持つと実装とズレる（SSOTでなくなる）ため、
// CATALOG_CATEGORIES（カタログセクションと共通のデータ）とdurationForCelebration()/
// hasSoundForCelebration()/hasHapticForCelebration()（recipes.tsxの実データ）から
// 実行時に組み立てる。
const VARIANT_TO_CATEGORY = new Map<CelebrateVariant, string>(
  CATALOG_CATEGORIES.flatMap((category) => category.variants.map((v) => [v.variant, category.title] as const))
);

function VariantTable() {
  return (
    <table className="api-table">
      <thead>
        <tr>
          <th>variant</th>
          <th>category</th>
          <th>duration</th>
          <th>sound</th>
          <th>haptic</th>
        </tr>
      </thead>
      <tbody>
        {CELEBRATE_VARIANT_NAMES.map((variant) => (
          <tr key={variant}>
            <td>
              <code>{variant}</code>
            </td>
            <td>{VARIANT_TO_CATEGORY.get(variant) ?? "-"}</td>
            <td>{durationForCelebration(variant)}ms</td>
            <td>{hasSoundForCelebration(variant) ? "🔈" : "-"}</td>
            <td>{hasHapticForCelebration(variant) ? "📳" : "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ApiReferenceSection() {
  return (
    <section id="api-reference" className="doc-section">
      <p className="section-title">
        <span>📚</span>
        <span>API リファレンス</span>
      </p>
      <p className="section-hint">
        各propsの型・既定値・説明の一覧（<code>docs/api-reference.md</code>
        と同内容）。使い方の説明・コード例はこのページの上のセクション、または
        <code>docs/guide.md</code>参照。
      </p>

      <ApiSubsection
        title="CelebrateVariant 一覧"
        note={
          <>
            登録済みの{CELEBRATE_VARIANT_NAMES.length}
            variant。durationMs/sound/hapticは実装から実行時に取得した値（ハードコードではない）。
          </>
        }
      >
        <VariantTable />
      </ApiSubsection>

      <ApiSubsection title="CelebrateProviderProps">
        <ApiTable rows={CELEBRATE_PROVIDER_PROPS} />
      </ApiSubsection>

      <ApiSubsection title="CelebrateOptions" note={<>celebrate(content, options)の第二引数。</>}>
        <ApiTable rows={CELEBRATE_OPTIONS} />
      </ApiSubsection>

      <ApiSubsection title="RadialBurstLayer / RadialBurst">
        <ApiTable rows={RADIAL_BURST_LAYER_PROPS} />
        <p className="section-hint" style={{ marginTop: "0.75rem" }}>
          RadialBurst自体のprops（layers/children/theme/classNameに加えて）：
        </p>
        <ApiTable rows={RADIAL_BURST_PROPS} />
      </ApiSubsection>

      <ApiSubsection title="ParticleSpec<P>">
        <ApiTable rows={PARTICLE_SPEC_PROPS} />
      </ApiSubsection>

      <ApiSubsection
        title="StrokeLine"
        note={<>pointsとdはどちらか一方を指定する（直線区間のみならpoints、円弧など曲線を含むならd）。</>}
      >
        <ApiTable rows={STROKE_LINE_PROPS} />
      </ApiSubsection>

      <ApiSubsection
        title="ClipReveal"
        note={<>覆いをclip-pathで動かして中身を出し入れするプリミティブ（軸I=clip-reveal）。</>}
      >
        <ApiTable rows={CLIP_REVEAL_PROPS} />
      </ApiSubsection>

      <ApiSubsection title="Sequence / SequenceStep<TResult>">
        <ApiTable rows={SEQUENCE_PROPS} />
        <p className="section-hint" style={{ marginTop: "0.75rem" }}>
          <code>SequenceStep&lt;TResult&gt;</code>：
        </p>
        <ApiTable rows={SEQUENCE_STEP_PROPS} />
      </ApiSubsection>

      <ApiSubsection
        title="enterSettleStyle(options)"
        note={
          <>「入って、そのまま残る」構造テンプレート（stamp/medal/recordが共有）。EnterSettleOptionsは全て省略可。</>
        }
      >
        <ApiTable rows={ENTER_SETTLE_OPTIONS} />
      </ApiSubsection>

      <ApiSubsection title="useCelebrateBorder()">
        <p className="section-hint">戻り値：</p>
        <ApiTable rows={USE_CELEBRATE_BORDER_RETURN} />
        <p className="section-hint" style={{ marginTop: "0.75rem" }}>
          <code>CelebrateBorderOptions</code>：
        </p>
        <ApiTable rows={CELEBRATE_BORDER_OPTIONS} />
        <p className="section-hint" style={{ marginTop: "0.75rem" }}>
          <code>BORDER_EFFECT_KINDS</code>（10種）は実質2機構＋単純なCSSクラス3種に集約されている：
        </p>
        <BorderKindTable />
      </ApiSubsection>

      <ApiSubsection title="useContainerModifier()">
        <ApiTable rows={USE_CONTAINER_MODIFIER_ARGS} />
      </ApiSubsection>

      <ApiSubsection title="RewardTier<W>">
        <ApiTable rows={REWARD_TIER_PROPS} />
      </ApiSubsection>
    </section>
  );
}

/** ドキュメントページ本体（旧App）。ルーティングはApp.tsx側で行う。 */
export function DocsPage() {
  return (
    <>
      <DocsHeader />
      <Quickstart />
      <Features />
      <CatalogSection />
      <BorderEffectDemo />
      <Playground />
      <ComboDemo />
      <SectionDivider
        icon="🧬"
        title="合成層（Tier 2）"
        description="複数局面を順番に切り替える。前段の実行結果を次段のパラメータとして渡せる。"
      />
      <SequenceDemo />
      <SectionDivider
        icon="🧱"
        title="構造テンプレート（Tier 3）"
        description="variant名のカタログを経由せず、構造テンプレートに生のパラメータを直接渡す。カタログの各variantは全部これのプリセット違いでしかない。"
      />
      <RadialBurstBuilder />
      <ParticleFallBuilder />
      <ClipRevealDemo />
      <BorderMechanismBuilder />
      <EngineDemo />
      <ReactNodeDemo />
      <ScopedDemo />
      <ApiReferenceSection />
    </>
  );
}

// CelebrateProviderはルート1箇所（ここ）だけに置く。各ページはその内側の
// ルートで切り替わるだけなので、ページ遷移をまたいでもProviderは再マウントされない。
export function App() {
  return (
    <BrowserRouter>
      <CelebrateProvider>
        <Routes>
          <Route path="/" element={<DocsPage />} />
          <Route path="/examples" element={<ExamplesIndex />} />
          <Route path="/examples/fireworks" element={<FireworksShowcase />} />
          <Route path="/examples/quiz" element={<QuizExample />} />
          <Route path="/examples/game" element={<GameExample />} />
        </Routes>
      </CelebrateProvider>
    </BrowserRouter>
  );
}
