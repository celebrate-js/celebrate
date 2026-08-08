import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CelebrateProvider } from "../../../src/react";
import { PopItGrid, PopItStage } from "./PopItStage";
import { LangProvider, useT, LanguageToggle } from "../i18n";

const STANDALONE_INDEX_TEXT = {
  ja: { title: "ポップイット" },
  en: { title: "Pop It" },
};

// ドキュメントサイト（demo/index.html）から切り出した、ポップイット単体のアプリ。
// エントリはdemo/popit.html。ドキュメント側のExamplePageLayoutやExamplesIndexへの
// 導線を一切持たず、"/"（タイル一覧）と"/:themeId"（各タイルの専用ページ）だけの
// 自己完結したルーティングを持つ。タイルの定義（POPIT_TILES）と各ページの実装は
// ドキュメント埋め込み版（examples/PopIt.tsx・examples/PopItStage.tsx）とまるごと共有している。
function PopItStandaloneIndex() {
  const t = useT(STANDALONE_INDEX_TEXT);
  return (
    <>
      <div className="lang-toggle-row">
        <LanguageToggle />
      </div>
      <header className="doc-section">
        <p className="section-title">
          <span>🫧</span>
          <span>{t.title}</span>
        </p>
      </header>
      <section className="doc-section">
        <PopItGrid basePath="" />
      </section>
    </>
  );
}

export function PopItStandaloneApp() {
  return (
    // このエントリはdemo/popit.htmlという単一ファイルとして配信される（"/"ではなく
    // "/popit.html"というパスに実体がある）ため、BrowserRouterのbasenameをそこに
    // 合わせないと、内部の"/"ルートが常に非マッチになってしまう。
    <BrowserRouter basename="/popit.html">
      <LangProvider>
        <CelebrateProvider>
          <Routes>
            <Route path="/" element={<PopItStandaloneIndex />} />
            <Route path="/:themeId" element={<PopItStage backTo="/" />} />
          </Routes>
        </CelebrateProvider>
      </LangProvider>
    </BrowserRouter>
  );
}
