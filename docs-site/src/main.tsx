import { marked } from "marked";
import { useEffect, useState, type MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  CelebrateProvider,
  hasSoundForCelebration,
  useCelebrate,
  type CelebrateVariant,
  type CelebrateVariantOptions,
} from "../../src/react";
import type { FireworkStyle } from "../../src";
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
          <span className="brand-mark" aria-hidden="true">
            ✦
          </span>
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

function CatalogCard({ spec }: { spec: CatalogVariantSpec }) {
  const celebrate = useCelebrate();
  const [fireworkStyle, setFireworkStyle] = useState<FireworkStyle>("peony");
  const isFirework = spec.variant === "firework";
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
      <button type="button" onClick={() => celebrate(spec.variant, options)}>
        試す
      </button>
    </article>
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
