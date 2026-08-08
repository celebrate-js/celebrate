import { Link } from "react-router-dom";
import { useT, LanguageToggle } from "../i18n";

interface ExampleCard {
  path: string;
  icon: string;
  title: string;
  description: string;
}

const TEXT = {
  ja: {
    backLink: "← ドキュメントに戻る",
    title: "実装例",
    hint: (
      <>
        カタログの1個1個の呼び出し方だけでなく、実際のアプリでどう組み合わせて使うかの実装例。 いずれもソースは
        <code>demo/src/examples/</code>にある。
      </>
    ),
    examples: [
      {
        path: "/examples/fireworks",
        icon: "🎆",
        title: "花火大会",
        description: "大量のfireworkを時間差で打ち上げて画面を盛り上げる。フィナーレのような一斉演出の実装例。",
      },
      {
        path: "/examples/quiz",
        icon: "📝",
        title: "クイズ",
        description: "正解するとstampとconfettiが出て、連続正解（streak）が伸びるとrecord演出に切り替わる実装例。",
      },
      {
        path: "/examples/game",
        icon: "🎯",
        title: "ミニゲーム",
        description:
          "出てくるターゲットをクリックするゲーム。1ヒットごとの軽い演出と、スコア到達時の派手な演出を使い分ける実装例。",
      },
      {
        path: "/examples/popit",
        icon: "🫧",
        title: "ポップイット",
        description:
          "タップするだけで可愛いミニエフェクトが見れるタイル集め。カタログのvariantをanchorで発火するものと、カタログに無い独自の動きをReactNodeでそのまま発火するものが混在する実装例。",
      },
    ] satisfies ExampleCard[],
  },
  en: {
    backLink: "← Back to documentation",
    title: "Examples",
    hint: (
      <>
        Not just how to call each catalog variant, but how to combine them in a real app. Every example's source lives
        in <code>demo/src/examples/</code>.
      </>
    ),
    examples: [
      {
        path: "/examples/fireworks",
        icon: "🎆",
        title: "Fireworks show",
        description: "Launches lots of fireworks with staggered timing to build up a finale-style display.",
      },
      {
        path: "/examples/quiz",
        icon: "📝",
        title: "Quiz",
        description:
          "Correct answers trigger stamp and confetti; a growing answer streak switches to the record celebration.",
      },
      {
        path: "/examples/game",
        icon: "🎯",
        title: "Mini game",
        description: "Click the targets as they appear — a light hit effect plus a bigger one on score milestones.",
      },
      {
        path: "/examples/popit",
        icon: "🫧",
        title: "Pop It",
        description:
          "A grid of tappable mini-effect tiles. Mixes catalog variants fired via anchor with custom one-off ReactNode effects not in the catalog.",
      },
    ] satisfies ExampleCard[],
  },
};

/** 実装例ページの一覧。 */
export function ExamplesIndex() {
  const t = useT(TEXT);
  return (
    <>
      <div className="lang-toggle-row">
        <LanguageToggle />
      </div>
      <p className="example-back-link">
        <Link to="/">{t.backLink}</Link>
      </p>
      <header className="doc-section">
        <p className="section-title">
          <span>🎮</span>
          <span>{t.title}</span>
        </p>
        <p className="section-hint">{t.hint}</p>
      </header>
      <section className="doc-section">
        <div className="catalog-grid">
          {t.examples.map((example) => (
            <Link key={example.path} to={example.path} className="example-index-card">
              <p className="example-index-card-title">
                <span>{example.icon}</span>
                <span>{example.title}</span>
              </p>
              <p className="example-index-card-description">{example.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
