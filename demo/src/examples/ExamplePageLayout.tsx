import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ExamplePageLayoutProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

/** 実装例ページ共通のヘッダー（ドキュメントへ戻るリンク＋タイトル）。 */
export function ExamplePageLayout({ icon, title, description, children }: ExamplePageLayoutProps) {
  return (
    <>
      <p className="example-back-link">
        <Link to="/">← ドキュメントに戻る</Link>
      </p>
      <header className="doc-section">
        <p className="section-title">
          <span>{icon}</span>
          <span>{title}</span>
        </p>
        <p className="section-hint">{description}</p>
      </header>
      {children}
    </>
  );
}
