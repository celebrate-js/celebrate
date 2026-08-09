import { marked } from "marked";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  CelebrateProvider,
  CELEBRATE_VARIANT_NAMES,
  hasSoundForCelebration,
  isFullScreenContent,
  useCelebrate,
  type CelebrateStampShape,
  type CelebrateVariant,
  type CelebrateVariantOptions,
} from "../../src/react";
import { DEFAULT_CELEBRATE_THEME, type FireworkStyle } from "../../src";
import "../../src/celebrate.css";
import "./site.css";

import apiReference from "../../docs/api-reference.md?raw";
import assetProvenance from "../../docs/asset-provenance.md?raw";
import catalogRationale from "../../docs/catalog-rationale.md?raw";
import effectTaxonomy from "../../docs/effect-structure-taxonomy.md?raw";
import guide from "../../docs/guide.md?raw";

type DocumentId = "guide" | "api-reference" | "catalog-rationale" | "effect-structure-taxonomy" | "asset-provenance";
type PageId = DocumentId | "catalog";
type Language = "en" | "ja";

type DocumentPage = {
  id: DocumentId;
  label: string;
  summary: string;
  source: string;
};

const japaneseDocuments: readonly DocumentPage[] = [
  {
    id: "guide",
    label: "ガイド",
    summary: "導入、3層の設計、カタログの使い方",
    source: guide,
  },
  {
    id: "api-reference",
    label: "API リファレンス",
    summary: "props・optionsの型と既定値",
    source: apiReference,
  },
  {
    id: "catalog-rationale",
    label: "カタログ妥当性根拠",
    summary: "25 variantの選定根拠と出典",
    source: catalogRationale,
  },
  {
    id: "effect-structure-taxonomy",
    label: "エフェクト構造の分解",
    summary: "実装構造の分類と設計メモ",
    source: effectTaxonomy,
  },
  {
    id: "asset-provenance",
    label: "デモ素材の由来",
    summary: "アザラシ画像の公開・再配布に関する確認",
    source: assetProvenance,
  },
];

const englishDocuments: readonly DocumentPage[] = [
  {
    id: "guide",
    label: "Guide",
    summary: "Installation, the three-tier design, and the main React APIs.",
    source: `# Guide

## Requirements

- React 18.3 or React 19
- Node.js 20.19 or newer for local development, builds, and tests

## Quick start

\`\`\`tsx
import { CelebrateProvider, useCelebrate } from "@celebrate-js/celebrate/react";

function App() {
  return <CelebrateProvider><SubmitButton /></CelebrateProvider>;
}

function SubmitButton() {
  const celebrate = useCelebrate();
  return <button onClick={() => celebrate("confetti")}>Submit</button>;
}
\`\`\`

## Three tiers

| Tier | Use it for | Example |
| --- | --- | --- |
| **Tier 1: catalog** | A named, ready-made effect | \`celebrate("confetti")\` |
| **Tier 2: composition** | Layering names and custom React nodes | \`celebrate("stamp", { with: ["confetti"] })\` |
| **Tier 3: primitives** | Building a new effect from raw parameters | \`<RadialBurst><RadialBurstLayer ... /></RadialBurst>\` |

Named effects such as \`stamp\`, \`pop\`, \`ripple\`, \`ring\`, and \`flash\` are presets. When the catalog does not express the visual you need, move to the Tier 3 primitives rather than inventing another name.

## Provider and trigger

Mount \`<CelebrateProvider>\` once at the app root. \`useCelebrate()\` returns \`celebrate(content, options)\`, which must be called from a React component.

\`\`\`tsx
const celebrate = useCelebrate();
celebrate("stamp", { text: "PASS" });
celebrate("confetti", { anchor: buttonRef });
celebrate(<MyBadge />);
celebrate("stamp", { with: ["confetti", <MyBadge />] });
\`\`\`

Use \`anchor\` for a local effect at an element. Omit it for the viewport center. See the [API reference](./api-reference.md) for every option.

## Tier 3 primitives

- \`RadialBurst\`: expanding layers; used by \`pop\`, \`ripple\`, \`ring\`, and \`flash\`.
- \`ParticleField\`: arbitrary particles, render nodes, and motion profiles; used by confetti, sparkle, rain, sakura, and cracker.
- \`StrokePath\`: drawn paths such as lightning.
- \`SnapshotShatter\`: breaks a canvas or image snapshot into triangles.
- \`useCelebrateBorder()\`: decorates an existing element's border.

The Japanese guide contains the complete original design notes and examples.`,
  },
  {
    id: "api-reference",
    label: "API reference",
    summary: "Provider, trigger options, composition, and Tier 3 primitive types.",
    source: `# API reference

## \`CelebrateProvider\`

| Prop | Type | Purpose |
| --- | --- | --- |
| \`theme\` | \`CelebrateTheme\` | The default visual theme; individual calls can override it. |
| \`container\` | \`RefObject<HTMLElement \\| null>\` | Scopes overlays such as rain and lightning to an element. Use \`position: relative\` on that element. \`shatter\` always captures the viewport. |

## \`celebrate(content, options)\`

| Option | Purpose |
| --- | --- |
| \`anchor\` | The center point for a local effect; omit for the viewport center. |
| \`text\`, \`note\` | Copy for stamp, record, bounce, medal, and popup. |
| \`with\` | A named effect, React node, or list to render in parallel. |
| \`theme\`, \`colors\`, \`color\` | Per-call visual overrides. |
| \`intensity\` | A continuous scale for supported visual, audio, and haptic output. |
| \`sizeRem\`, \`rotateDeg\`, \`shape\` | Size and stamp-specific presentation controls. |
| \`sound\`, \`haptic\` | Enable or disable feedback independently. |
| \`seed\` | Reproducible particle generation for tests and demos. |

When the first argument is a literal variant name, TypeScript narrows the available options to the options that affect that variant.

## Components and hooks

- \`<Celebrate variant={...} />\` renders declaratively in place.
- \`<RadialBurst>\` and \`<RadialBurstLayer>\` build expanding layers.
- \`<ParticleField>\` receives particle specs with a motion profile, duration, delay, and React render node.
- \`<StrokePath>\` draws SVG lines and paths.
- \`<SnapshotShatter>\` shatters a canvas or image snapshot.
- \`<Sequence>\` plays typed stages in order and can pass results forward.
- \`useCelebrateBorder()\` and \`useContainerModifier()\` affect an existing element or the document container.

For the full field-by-field Japanese tables, switch to 日本語.`,
  },
  {
    id: "catalog-rationale",
    label: "Catalog rationale",
    summary: "Why the catalog has named effects and how the groups map to UX moments.",
    source: `# Catalog rationale

The 25 named Tier 1 effects are grouped by **UX meaning**, not by implementation. For example, \`pop\`, \`ripple\`, \`ring\`, and \`flash\` share the same radial structure but communicate different moments: a light acknowledgement, a tap ripple, an expanding ring, or a stronger reward.

The groups cover input feedback, achievement, reward, reaction, character or narrative, environmental effects, staged effects, and text channels. A name belongs in the catalog only when it is a useful word for a product moment; a new visual that needs raw parameters belongs in Tier 3 instead.

The Japanese source includes the research notes and the detailed mapping from categories to motion and gamification references.`,
  },
  {
    id: "effect-structure-taxonomy",
    label: "Effect structure taxonomy",
    summary: "A design map for rendering scope, emission, motion, time, composition, and masking.",
    source: `# Effect structure taxonomy

This design note separates an effect into independent axes:

1. **Rendering scope** — local element, container, or viewport.
2. **Emission shape** — point, line, area, or an existing surface.
3. **Element count** — one actor or a field of particles.
4. **Per-element motion** — radial, ballistic, falling, static, orbiting, or custom.
5. **Painting** — CSS, SVG, Canvas, DOM, image, or a custom React node.
6. **Time** — a single transition, a staged sequence, or a persistent state.
7. **Composition** — parallel layers, ordered stages, and independent effects.
8. **Computation** — CSS, Web Animations, requestAnimationFrame, or a physics calculation.
9. **Mask/reveal** — transforming or removing an existing visible surface.

The public primitives follow this map: \`ParticleField\` owns field motion, \`RadialBurst\` owns expanding layers, \`StrokePath\` owns drawn paths, \`Sequence\` owns ordered phases, and \`SnapshotShatter\` owns captured-pixel breakup.

The Japanese document retains the full design audit, examples, and proposed future work.`,
  },
  {
    id: "asset-provenance",
    label: "Asset provenance",
    summary: "Ownership and redistribution status for images used in the demos.",
    source: `# Asset provenance

The seal images used in the demo were generated for this project at the creator's direction. They are project assets, not third-party stock material. The project keeps the original Japanese asset record as the detailed provenance note.`,
  },
];

const documentIds = new Set<DocumentId>([
  "guide",
  "api-reference",
  "catalog-rationale",
  "effect-structure-taxonomy",
  "asset-provenance",
]);

function currentPageId(): PageId | undefined {
  const id = window.location.hash.slice(1).split("#")[0];
  if (id === "catalog") return id;
  return documentIds.has(id as DocumentId) ? (id as DocumentId) : undefined;
}

function documentHref(id: DocumentId): string {
  return `#${id}`;
}

function DocsApp() {
  const [pageId, setPageId] = useState<PageId | undefined>(currentPageId);
  const [language, setLanguage] = useState<Language>("en");
  const documents = language === "en" ? englishDocuments : japaneseDocuments;
  const documentById = useMemo(() => new Map(documents.map((document) => [document.id, document])), [documents]);
  const activeDocument = pageId && pageId !== "catalog" ? documentById.get(pageId) : undefined;
  const copy =
    language === "en"
      ? {
          catalog: "Try the catalog",
          documentation: "DOCUMENTATION",
          footer: "Open an issue",
          home: "Celebrate.js Docs",
        }
      : { catalog: "カタログを試す", documentation: "ドキュメント", footer: "Issue を開く", home: "Celebrate.js Docs" };

  useEffect(() => {
    const updatePage = () => setPageId(currentPageId());
    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = activeDocument
      ? `${activeDocument.label} | Celebrate.js Docs`
      : pageId === "catalog"
        ? "Catalog | Celebrate.js Docs"
        : "Celebrate.js Docs";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeDocument, language, pageId]);

  function handleArticleClick(event: MouseEvent<HTMLElement>) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a");
    const href = link?.getAttribute("href");
    if (!href?.startsWith("./") || !href.includes(".md")) return;

    const [filename, anchor] = href.slice(2).split("#");
    const target = documents.find((document) => `${document.id}.md` === filename);
    if (!target) return;

    event.preventDefault();
    window.location.hash = anchor ? `${target.id}#${anchor}` : target.id;
  }

  const renderedDocument = activeDocument ? marked.parse(activeDocument.source, { async: false }) : undefined;

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label={copy.home}>
          <span>Celebrate.js</span>
          <small>Docs</small>
        </a>
        <nav aria-label="外部リンク">
          <a href="#catalog">{copy.catalog}</a>
          <a href="https://www.npmjs.com/package/@celebrate-js/celebrate">npm</a>
          <a href="https://github.com/celebrate-js/celebrate">GitHub</a>
          <span className="language-toggle" aria-label="Documentation language">
            <button
              type="button"
              className={language === "en" ? "is-active" : undefined}
              onClick={() => setLanguage("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={language === "ja" ? "is-active" : undefined}
              onClick={() => setLanguage("ja")}
            >
              日本語
            </button>
          </span>
        </nav>
      </header>

      <div className="site-layout">
        <aside className="sidebar" aria-label={copy.documentation}>
          <p className="sidebar-label">{copy.documentation}</p>
          <nav>
            <a className={pageId === "catalog" ? "is-active" : undefined} href="#catalog">
              {copy.catalog}
            </a>
            {documents.map((document) => (
              <a
                className={document.id === pageId ? "is-active" : undefined}
                href={documentHref(document.id)}
                key={document.id}
              >
                {document.label}
              </a>
            ))}
          </nav>
        </aside>

        <main id="top">
          {pageId === "catalog" ? (
            <CatalogPage language={language} />
          ) : activeDocument && renderedDocument ? (
            <article
              className="document"
              onClick={handleArticleClick}
              dangerouslySetInnerHTML={{ __html: renderedDocument }}
            />
          ) : (
            <Home language={language} documents={documents} />
          )}
        </main>
      </div>

      <footer>
        <span>MIT License</span>
        <a href="https://github.com/celebrate-js/celebrate/issues">{copy.footer}</a>
      </footer>
    </div>
  );
}

function Home({ language, documents }: { language: Language; documents: readonly DocumentPage[] }) {
  const isEnglish = language === "en";
  return (
    <div className="home">
      <p className="eyebrow">REACT CELEBRATION EFFECTS</p>
      <h1>
        {isEnglish ? "Make every moment" : "決まった瞬間に、"}
        <br />
        {isEnglish ? "feel complete." : "演出を。"}
      </h1>
      <p className="lead">
        {isEnglish ? (
          <>
            <code>@celebrate-js/celebrate</code> adds visual feedback to React apps: ink stamps, confetti, fireworks,
            lightning, and more.
          </>
        ) : (
          <>
            <code>@celebrate-js/celebrate</code>{" "}
            は、印影スタンプ、紙吹雪、花火、稲光などの視覚的フィードバックをReactアプリへ加えるライブラリです。
          </>
        )}
      </p>
      <div className="install-block">
        <span>npm</span>
        <code>npm install @celebrate-js/celebrate</code>
      </div>
      <p className="runtime-note">
        {isEnglish
          ? "React 18.3 / 19. Node.js 20.19 or newer for development and builds."
          : "React 18.3 / 19対応。開発・ビルドにはNode.js 20.19以降が必要です。"}
      </p>

      <a className="catalog-launch" href="#catalog">
        <span>
          <strong>{isEnglish ? "Interactive catalog" : "試せるカタログ"}</strong>
          <small>
            {isEnglish ? "Try all 25 effects directly in the browser." : "25種類のエフェクトを、その場で発火できます。"}
          </small>
        </span>
        <span aria-hidden="true">→</span>
      </a>

      <section aria-labelledby="start-heading">
        <div className="section-heading">
          <p className="eyebrow">START HERE</p>
          <h2 id="start-heading">{isEnglish ? "Reference" : "リファレンス"}</h2>
        </div>
        <div className="document-grid">
          {documents.map((document) => (
            <a className="document-card" href={documentHref(document.id)} key={document.id}>
              <h3>{document.label}</h3>
              <p>{document.summary}</p>
              <span aria-hidden="true">→</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

type CatalogVariantSpec = {
  variant: CelebrateVariant;
  description: string;
  text?: string;
  note?: string;
};

type CatalogCategory = {
  title: string;
  description: string;
  variants: readonly CatalogVariantSpec[];
};

const catalogCategories: readonly CatalogCategory[] = [
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
    variants: [{ variant: "shatter", description: "画面全体を撮影し、その画素を本当に破片として崩す。" }],
  },
  {
    title: "⑧ テキストチャネル",
    description: "浮遊する数値・文字。",
    variants: [{ variant: "popup", description: "「+1」のような数値・文字が浮かんで消える。", text: "+1" }],
  },
];

const englishCatalogCategories: Record<string, { title: string; description: string }> = {
  "① 入力フィードバック": { title: "① Input feedback", description: "A light confirmation for pressing a control." },
  "② 達成": { title: "② Achievement", description: "Signals a correct answer, completion, or placement." },
  "③ 報酬": { title: "③ Reward", description: "A bigger moment: a bonus, a jackpot, or a win." },
  "④ リアクション": { title: "④ Reaction", description: "Express a feeling through emoji." },
  "⑤ キャラクター・ナラティブ": {
    title: "⑤ Character / narrative",
    description: "One actor moves rather than a field of particles.",
  },
  "⑥ 環境演出": { title: "⑥ Environment", description: "Effects that act across the whole screen." },
  "⑦ 段階エフェクト": { title: "⑦ Staged effect", description: "Several phases play out over time." },
  "⑧ テキストチャネル": { title: "⑧ Text channel", description: "A floating number or short piece of text." },
};

const englishCatalogVariants: Record<CelebrateVariant, string> = {
  pop: "Expands from the center and fades — the lightest feedback.",
  ripple: "Spreads out like a ripple for a tap confirmation.",
  checkmark: "A circle draws in, then a checkmark.",
  stamp: "A short piece of text lands like an ink stamp.",
  medal: "A ribboned medal that feels awarded.",
  bounce: "A short text label that bounces in.",
  confetti: "Classic falling confetti.",
  sparkle: "Sparkles scatter outward.",
  record: "A full-screen banner for a new personal best.",
  flash: "A brief, intense flash.",
  ring: "A double ring expands and fades.",
  firework: "Fireworks bloom from several staggered points.",
  heart: "Hearts float up.",
  star: "Stars float up.",
  emoji: "Emoji float up (🎉✨🎊👍 by default).",
  cracker: "A party popper bursts with streamers.",
  float: "Text or a cloud shape drifts gently.",
  sakura: "Cherry blossom petals drift down.",
  shake: "The whole screen shakes.",
  hitstop: "A brief freeze, like a stopped frame.",
  vignette: "Screen edges darken for a low-health look.",
  rain: "Confetti rains down across the screen.",
  lightning: "A bolt strikes from top to bottom.",
  shatter: "Captures the screen and breaks those exact pixels into shards.",
  popup: "Text such as “+1” floats up and fades.",
};

const fireworkStyles: readonly FireworkStyle[] = ["peony", "willow", "ring", "kiku", "star", "senrin", "hachi"];
const SHATTER_CATALOG_LOCK_MS = 3_500;

function CatalogCard({ spec, language }: { spec: CatalogVariantSpec; language: Language }) {
  const celebrate = useCelebrate();
  const [fireworkStyle, setFireworkStyle] = useState<FireworkStyle>("peony");
  const [isShatterPlaying, setIsShatterPlaying] = useState(false);
  const effectAnchorRef = useRef<HTMLSpanElement | null>(null);
  const shatterLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirework = spec.variant === "firework";
  const isFullScreen = isFullScreenContent(spec.variant);
  const options: CelebrateVariantOptions = { text: spec.text, note: spec.note };
  if (isFirework) options.fireworkStyle = fireworkStyle;
  const code = `celebrate("${spec.variant}"${
    options.text || options.note || (isFirework && fireworkStyle !== "peony")
      ? `, { ${[
          options.text && `text: "${options.text}"`,
          options.note && `note: "${options.note}"`,
          isFirework && fireworkStyle !== "peony" && `fireworkStyle: "${fireworkStyle}"`,
        ]
          .filter(Boolean)
          .join(", ")} }`
      : ""
  });`;

  useEffect(
    () => () => {
      if (shatterLockTimer.current) clearTimeout(shatterLockTimer.current);
    },
    []
  );

  function fire() {
    if (spec.variant === "shatter") {
      if (shatterLockTimer.current) return;
      setIsShatterPlaying(true);
      shatterLockTimer.current = setTimeout(() => {
        shatterLockTimer.current = null;
        setIsShatterPlaying(false);
      }, SHATTER_CATALOG_LOCK_MS);
    }

    if (isFullScreen) {
      celebrate(spec.variant, options);
    } else {
      celebrate(spec.variant, { ...options, anchor: effectAnchorRef });
    }
  }

  return (
    <article className="catalog-card">
      <div className="catalog-card-head">
        <code>{spec.variant}</code>
        {hasSoundForCelebration(spec.variant) && (
          <span title={language === "en" ? "Sound included" : "効果音あり"}>🔈</span>
        )}
      </div>
      <p>{language === "en" ? englishCatalogVariants[spec.variant] : spec.description}</p>
      {isFirework && (
        <label>
          {language === "en" ? "Style" : "種類"}
          <select value={fireworkStyle} onChange={(event) => setFireworkStyle(event.target.value as FireworkStyle)}>
            {fireworkStyles.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </label>
      )}
      <pre>
        <code>{code}</code>
      </pre>
      <div className="catalog-card-action">
        <span ref={effectAnchorRef} aria-hidden="true" className="catalog-card-effect-anchor" />
        <button type="button" disabled={isShatterPlaying} onClick={fire}>
          {isShatterPlaying ? (language === "en" ? "Playing…" : "再生中…") : language === "en" ? "Try it" : "試す"}
        </button>
      </div>
    </article>
  );
}

const CATALOG_PLAYGROUND_VARIANTS = CELEBRATE_VARIANT_NAMES;
const CATALOG_PLAYGROUND_DEFAULT_COLOR = "#d64545";
const CATALOG_PLAYGROUND_TEXT_VARIANTS = new Set<CelebrateVariant>(["stamp", "record", "bounce", "medal", "popup"]);
const CATALOG_PLAYGROUND_NOTE_VARIANTS = new Set<CelebrateVariant>(["record"]);
const CATALOG_PLAYGROUND_SIZE_VARIANTS = new Set<CelebrateVariant>(["firework", "pop", "ripple", "ring", "flash"]);
const CATALOG_PLAYGROUND_ROTATE_VARIANTS = new Set<CelebrateVariant>(["stamp"]);
const CATALOG_PLAYGROUND_SHAPE_VARIANTS = new Set<CelebrateVariant>(["stamp"]);
const CATALOG_PLAYGROUND_PALETTE_VARIANTS = new Set<CelebrateVariant>([
  "confetti",
  "sparkle",
  "cracker",
  "rain",
  "firework",
]);
const CATALOG_PLAYGROUND_STAMP_SHAPES: readonly CelebrateStampShape[] = ["rounded", "circle", "square", "star"];

function catalogPlaygroundOptionsSnippet(
  options: CelebrateVariantOptions,
  withList: readonly CelebrateVariant[]
): string {
  const lines: string[] = [];
  if (withList.length > 0) lines.push(`  with: [${withList.map((variant) => `"${variant}"`).join(", ")}],`);
  if (options.text) lines.push(`  text: "${options.text}",`);
  if (options.note) lines.push(`  note: "${options.note}",`);
  if (options.intensity !== undefined) lines.push(`  intensity: ${options.intensity},`);
  if (options.sizeRem !== undefined) lines.push(`  sizeRem: ${options.sizeRem},`);
  if (options.rotateDeg !== undefined) lines.push(`  rotateDeg: ${options.rotateDeg},`);
  if (options.shape !== undefined) lines.push(`  shape: "${options.shape}",`);
  if (options.colors) lines.push(`  colors: [${options.colors.map((color) => `"${color}"`).join(", ")}],`);
  if (options.theme) {
    lines.push(`  theme: { ...DEFAULT_CELEBRATE_THEME, stampColor: "${options.theme.stampColor}" },`);
  }
  return lines.length > 0 ? `, {\n${lines.join("\n")}\n}` : "";
}

function CatalogPlayground({ language }: { language: Language }) {
  const celebrate = useCelebrate();
  const isEnglish = language === "en";
  const [variant, setVariant] = useState<CelebrateVariant>("confetti");
  const [withList, setWithList] = useState<CelebrateVariant[]>([]);
  const [intensity, setIntensity] = useState(1);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(CATALOG_PLAYGROUND_DEFAULT_COLOR);
  const [sizeRem, setSizeRem] = useState<number | null>(null);
  const [rotateDeg, setRotateDeg] = useState<number | null>(null);
  const [shape, setShape] = useState<CelebrateStampShape | null>(null);
  const effectAnchorRef = useRef<HTMLSpanElement | null>(null);
  const supportsText = CATALOG_PLAYGROUND_TEXT_VARIANTS.has(variant);
  const supportsNote = CATALOG_PLAYGROUND_NOTE_VARIANTS.has(variant);
  const supportsSize = CATALOG_PLAYGROUND_SIZE_VARIANTS.has(variant);
  const supportsRotate = CATALOG_PLAYGROUND_ROTATE_VARIANTS.has(variant);
  const supportsShape = CATALOG_PLAYGROUND_SHAPE_VARIANTS.has(variant);
  const usesPalette = CATALOG_PLAYGROUND_PALETTE_VARIANTS.has(variant);

  const toggleWith = (target: CelebrateVariant) => {
    setWithList((previous) =>
      previous.includes(target) ? previous.filter((item) => item !== target) : [...previous, target]
    );
  };

  const options = useMemo<CelebrateVariantOptions>(() => {
    const next: CelebrateVariantOptions = {};
    if (withList.length > 0) next.with = withList;
    if (supportsText && text) next.text = text;
    if (supportsNote && note) next.note = note;
    if (intensity !== 1) next.intensity = intensity;
    if (supportsSize && sizeRem !== null) next.sizeRem = sizeRem;
    if (supportsRotate && rotateDeg !== null) next.rotateDeg = rotateDeg;
    if (supportsShape && shape !== null) next.shape = shape;
    if (color !== CATALOG_PLAYGROUND_DEFAULT_COLOR) {
      if (usesPalette) next.colors = [color];
      else next.theme = { ...DEFAULT_CELEBRATE_THEME, stampColor: color };
    }
    return next;
  }, [
    color,
    intensity,
    note,
    rotateDeg,
    shape,
    sizeRem,
    supportsNote,
    supportsRotate,
    supportsShape,
    supportsSize,
    supportsText,
    text,
    usesPalette,
    withList,
  ]);

  const code = `celebrate("${variant}"${catalogPlaygroundOptionsSnippet(options, withList)});`;
  const fire = () => {
    if (isFullScreenContent(variant)) celebrate(variant, options);
    else celebrate(variant, { ...options, anchor: effectAnchorRef });
  };

  return (
    <section className="catalog-playground" aria-labelledby="catalog-playground-title">
      <div>
        <p className="eyebrow">CUSTOM PLAYGROUND</p>
        <h2 id="catalog-playground-title">{isEnglish ? "Customize and try it" : "カスタムして試す"}</h2>
        <p>
          {isEnglish
            ? "Change options, preview the call, and trigger the real effect without leaving the catalog."
            : "名前だけのカードではなく、optionsを変えながら実際の呼び出しと見た目を確認できます。"}
        </p>
      </div>
      <div className="catalog-playground-grid">
        <div className="catalog-playground-controls">
          <label>
            variant
            <select
              value={variant}
              onChange={(event) => {
                const nextVariant = event.target.value as CelebrateVariant;
                setVariant(nextVariant);
                setWithList((previous) => previous.filter((item) => item !== nextVariant));
              }}
            >
              {CATALOG_PLAYGROUND_VARIANTS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>{isEnglish ? "with (layered effects)" : "with（重ねる演出）"}</legend>
            <div className="catalog-playground-with-list">
              {CATALOG_PLAYGROUND_VARIANTS.filter((item) => item !== variant).map((item) => (
                <label key={item}>
                  <input type="checkbox" checked={withList.includes(item)} onChange={() => toggleWith(item)} />
                  {item}
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
              onChange={(event) => setIntensity(Number(event.target.value))}
            />
          </label>
          {supportsSize && (
            <label>
              sizeRem: {sizeRem?.toFixed(1) ?? (isEnglish ? "default" : "既定")}
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={sizeRem ?? 5}
                onChange={(event) => setSizeRem(Number(event.target.value))}
              />
            </label>
          )}
          {supportsRotate && (
            <label>
              rotateDeg: {rotateDeg ?? 0}deg
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={rotateDeg ?? 0}
                onChange={(event) => setRotateDeg(Number(event.target.value))}
              />
            </label>
          )}
          {supportsShape && (
            <label>
              shape
              <select
                value={shape ?? ""}
                onChange={(event) =>
                  setShape(event.target.value === "" ? null : (event.target.value as CelebrateStampShape))
                }
              >
                <option value="">{isEnglish ? "default (rounded)" : "既定（rounded）"}</option>
                {CATALOG_PLAYGROUND_STAMP_SHAPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          )}
          {supportsText && (
            <label>
              text
              <input
                type="text"
                value={text}
                placeholder={isEnglish ? "e.g. PASS" : "例：合格"}
                onChange={(event) => setText(event.target.value)}
              />
            </label>
          )}
          {supportsNote && (
            <label>
              note
              <input
                type="text"
                value={note}
                placeholder={isEnglish ? "e.g. 7 in a row" : "例：れんぞく 7問"}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>
          )}
          <label>
            color
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
        </div>
        <pre className="catalog-playground-code">
          <code>{code}</code>
        </pre>
      </div>
      <div className="catalog-playground-action">
        <span ref={effectAnchorRef} aria-hidden="true" className="catalog-card-effect-anchor" />
        <button type="button" onClick={fire}>
          {isEnglish ? "Trigger custom effect" : "カスタム設定で発火"}
        </button>
      </div>
    </section>
  );
}

function CatalogPage({ language }: { language: Language }) {
  const isEnglish = language === "en";
  return (
    <section className="catalog-page">
      <p className="eyebrow">INTERACTIVE CATALOG · TIER 1</p>
      <h1>{isEnglish ? "Interactive catalog" : "試せるカタログ"}</h1>
      <p className="catalog-lead">
        {isEnglish
          ? "Press Try on any card to trigger its effect. The catalog includes full-screen effects as well."
          : "カードの「試す」を押すと、その場でエフェクトが発火します。画面全体を使う演出も含みます。"}
      </p>
      <CatalogPlayground language={language} />
      {catalogCategories.map((category) => (
        <section className="catalog-category" key={category.title}>
          <h2>{isEnglish ? englishCatalogCategories[category.title]!.title : category.title}</h2>
          <p>{isEnglish ? englishCatalogCategories[category.title]!.description : category.description}</p>
          <div className="catalog-grid">
            {category.variants.map((spec) => (
              <CatalogCard key={spec.variant} spec={spec} language={language} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

createRoot(document.getElementById("root")!).render(
  <CelebrateProvider>
    <DocsApp />
  </CelebrateProvider>
);
