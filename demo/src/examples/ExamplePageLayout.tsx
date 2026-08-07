import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ExamplePageLayoutProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * 実装例ページ共通のヘッダー（一覧へ戻るリンク＋タイトル）。
 * 動線はホーム ⇄ 実装例一覧（/examples） ⇄ 個々の実装例、という階層になるべきなので、
 * ここは常に一覧（/examples）へ戻す（ホームへ直接は戻さない。一覧側に別途ホームへの
 * リンクがある）。
 */
export function ExamplePageLayout({ icon, title, description, children }: ExamplePageLayoutProps) {
  return (
    <>
      <p className="example-back-link">
        <Link to="/examples">← 実装例一覧に戻る</Link>
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
