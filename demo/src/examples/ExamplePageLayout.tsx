import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useT, LanguageToggle } from "../i18n";

interface ExamplePageLayoutProps {
  icon: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

const TEXT = {
  ja: { backLink: "← 実装例一覧に戻る" },
  en: { backLink: "← Back to examples" },
};

/**
 * 実装例ページ共通のヘッダー（一覧へ戻るリンク＋タイトル）。
 * 動線はホーム ⇄ 実装例一覧（/examples） ⇄ 個々の実装例、という階層になるべきなので、
 * ここは常に一覧（/examples）へ戻す（ホームへ直接は戻さない。一覧側に別途ホームへの
 * リンクがある）。
 */
export function ExamplePageLayout({ icon, title, description, children }: ExamplePageLayoutProps) {
  const t = useT(TEXT);
  return (
    <>
      <div className="lang-toggle-row">
        <LanguageToggle />
      </div>
      <p className="example-back-link">
        <Link to="/examples">{t.backLink}</Link>
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
