import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "ja" | "en";

const STORAGE_KEY = "celebrate-demo-lang";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

function detectInitialLang(): Lang {
  if (typeof window === "undefined") return "ja";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "ja";
}

/** サイト全体の言語トグル（日本語⇔英語）。localStorageに保存し、次回訪問時も引き継ぐ。 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(detectInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

/** {ja, en}の両方を持つ辞書オブジェクトから、現在の言語の値を選ぶ。 */
export function useT<T>(dict: { ja: T; en: T }): T {
  const { lang } = useLang();
  return dict[lang];
}

/** ヘッダー等に置く、日本語⇔英語の切り替え。現在の言語が常にどちらかで分かるよう、
 * 「切り替え先」の1ボタンではなく「日本語｜English」の2択（現在地はハイライト）にする。
 * ボタン1個＋切り替え先ラベルの表示だと、英語表示中に「日本語」という文字が見えて
 * 「これは今の状態なのか切り替え先なのか」紛らわしいという指摘を受けての修正。 */
export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className="lang-toggle-option"
        data-active={lang === "ja" || undefined}
        onClick={() => setLang("ja")}
      >
        日本語
      </button>
      <button
        type="button"
        className="lang-toggle-option"
        data-active={lang === "en" || undefined}
        onClick={() => setLang("en")}
      >
        English
      </button>
    </div>
  );
}
