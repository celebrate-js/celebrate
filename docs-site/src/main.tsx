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

type DocumentPage = {
  id: DocumentId;
  label: string;
  summary: string;
  source: string;
};

const documents: readonly DocumentPage[] = [
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

const documentById = new Map(documents.map((document) => [document.id, document]));

function currentPageId(): PageId | undefined {
  const id = window.location.hash.slice(1).split("#")[0];
  if (id === "catalog") return id;
  return documentById.has(id as DocumentId) ? (id as DocumentId) : undefined;
}

function documentHref(id: DocumentId): string {
  return `#${id}`;
}

function DocsApp() {
  const [pageId, setPageId] = useState<PageId | undefined>(currentPageId);
  const activeDocument = pageId && pageId !== "catalog" ? documentById.get(pageId) : undefined;

  useEffect(() => {
    const updatePage = () => setPageId(currentPageId());
    window.addEventListener("hashchange", updatePage);
    return () => window.removeEventListener("hashchange", updatePage);
  }, []);

  useEffect(() => {
    document.title = activeDocument
      ? `${activeDocument.label} | Celebrate.js Docs`
      : pageId === "catalog"
        ? "Catalog | Celebrate.js Docs"
        : "Celebrate.js Docs";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeDocument, pageId]);

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
        <a className="brand" href="#top" aria-label="Celebrate.js Docs ホーム">
          <span>Celebrate.js</span>
          <small>Docs</small>
        </a>
        <nav aria-label="外部リンク">
          <a href="#catalog">カタログを試す</a>
          <a href="https://www.npmjs.com/package/@celebrate-js/celebrate">npm</a>
          <a href="https://github.com/celebrate-js/celebrate">GitHub</a>
        </nav>
      </header>

      <div className="site-layout">
        <aside className="sidebar" aria-label="ドキュメント">
          <p className="sidebar-label">DOCUMENTATION</p>
          <nav>
            <a className={pageId === "catalog" ? "is-active" : undefined} href="#catalog">
              カタログを試す
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
            <CatalogPage />
          ) : activeDocument && renderedDocument ? (
            <article
              className="document"
              onClick={handleArticleClick}
              dangerouslySetInnerHTML={{ __html: renderedDocument }}
            />
          ) : (
            <Home />
          )}
        </main>
      </div>

      <footer>
        <span>MIT License</span>
        <a href="https://github.com/celebrate-js/celebrate/issues">Issue を開く</a>
      </footer>
    </div>
  );
}

function Home() {
  return (
    <div className="home">
      <p className="eyebrow">REACT CELEBRATION EFFECTS</p>
      <h1>
        決まった瞬間に、
        <br />
        演出を。
      </h1>
      <p className="lead">
        <code>@celebrate-js/celebrate</code>{" "}
        は、印影スタンプ、紙吹雪、花火、稲光などの視覚的フィードバックをReactアプリへ加えるライブラリです。
      </p>
      <div className="install-block">
        <span>npm</span>
        <code>npm install @celebrate-js/celebrate</code>
      </div>
      <p className="runtime-note">React 18.3 / 19対応。開発・ビルドにはNode.js 20.19以降が必要です。</p>

      <a className="catalog-launch" href="#catalog">
        <span>
          <strong>試せるカタログ</strong>
          <small>25種類のエフェクトを、その場で発火できます。</small>
        </span>
        <span aria-hidden="true">→</span>
      </a>

      <section aria-labelledby="start-heading">
        <div className="section-heading">
          <p className="eyebrow">START HERE</p>
          <h2 id="start-heading">リファレンス</h2>
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

const fireworkStyles: readonly FireworkStyle[] = ["peony", "willow", "ring", "kiku", "star", "senrin", "hachi"];
const SHATTER_CATALOG_LOCK_MS = 3_500;

function CatalogCard({ spec }: { spec: CatalogVariantSpec }) {
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
        {hasSoundForCelebration(spec.variant) && <span title="効果音あり">🔈</span>}
      </div>
      <p>{spec.description}</p>
      {isFirework && (
        <label>
          種類
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
          {isShatterPlaying ? "再生中…" : "試す"}
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

function CatalogPlayground() {
  const celebrate = useCelebrate();
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
        <h2 id="catalog-playground-title">カスタムして試す</h2>
        <p>名前だけのカードではなく、optionsを変えながら実際の呼び出しと見た目を確認できます。</p>
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
            <legend>with（重ねる演出）</legend>
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
              sizeRem: {sizeRem?.toFixed(1) ?? "既定"}
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
                <option value="">既定（rounded）</option>
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
                placeholder="例：合格"
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
                placeholder="例：れんぞく 7問"
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
          カスタム設定で発火
        </button>
      </div>
    </section>
  );
}

function CatalogPage() {
  return (
    <section className="catalog-page">
      <p className="eyebrow">INTERACTIVE CATALOG · TIER 1</p>
      <h1>試せるカタログ</h1>
      <p className="catalog-lead">
        カードの「試す」を押すと、その場でエフェクトが発火します。画面全体を使う演出も含みます。
      </p>
      <CatalogPlayground />
      {catalogCategories.map((category) => (
        <section className="catalog-category" key={category.title}>
          <h2>{category.title}</h2>
          <p>{category.description}</p>
          <div className="catalog-grid">
            {category.variants.map((spec) => (
              <CatalogCard key={spec.variant} spec={spec} />
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
