import { marked } from "marked";
import { useEffect, useState, type MouseEvent } from "react";
import { createRoot } from "react-dom/client";
import "./site.css";

import apiReference from "../../docs/api-reference.md?raw";
import assetProvenance from "../../docs/asset-provenance.md?raw";
import catalogRationale from "../../docs/catalog-rationale.md?raw";
import effectTaxonomy from "../../docs/effect-structure-taxonomy.md?raw";
import guide from "../../docs/guide.md?raw";

type DocumentId = "guide" | "api-reference" | "catalog-rationale" | "effect-structure-taxonomy" | "asset-provenance";

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

function currentDocumentId(): DocumentId | undefined {
  const id = window.location.hash.slice(1).split("#")[0];
  return documentById.has(id as DocumentId) ? (id as DocumentId) : undefined;
}

function documentHref(id: DocumentId): string {
  return `#${id}`;
}

function DocsApp() {
  const [documentId, setDocumentId] = useState<DocumentId | undefined>(currentDocumentId);
  const activeDocument = documentId ? documentById.get(documentId) : undefined;

  useEffect(() => {
    const updateDocument = () => setDocumentId(currentDocumentId());
    window.addEventListener("hashchange", updateDocument);
    return () => window.removeEventListener("hashchange", updateDocument);
  }, []);

  useEffect(() => {
    document.title = activeDocument ? `${activeDocument.label} | Celebrate.js Docs` : "Celebrate.js Docs";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [activeDocument]);

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
          <a href="https://www.npmjs.com/package/@celebrate-js/celebrate">npm</a>
          <a href="https://github.com/sato0825/celebrate-js">GitHub</a>
        </nav>
      </header>

      <div className="site-layout">
        <aside className="sidebar" aria-label="ドキュメント">
          <p className="sidebar-label">DOCUMENTATION</p>
          <nav>
            {documents.map((document) => (
              <a
                className={document.id === documentId ? "is-active" : undefined}
                href={documentHref(document.id)}
                key={document.id}
              >
                {document.label}
              </a>
            ))}
          </nav>
        </aside>

        <main id="top">
          {activeDocument && renderedDocument ? (
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
        <a href="https://github.com/sato0825/celebrate-js/issues">Issue を開く</a>
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

createRoot(document.getElementById("root")!).render(<DocsApp />);
