import { Link } from "react-router-dom";

interface ExampleCard {
  path: string;
  icon: string;
  title: string;
  description: string;
}

const EXAMPLES: readonly ExampleCard[] = [
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
];

/** 実装例ページの一覧。 */
export function ExamplesIndex() {
  return (
    <>
      <p className="example-back-link">
        <Link to="/">← ドキュメントに戻る</Link>
      </p>
      <header className="doc-section">
        <p className="section-title">
          <span>🎮</span>
          <span>実装例</span>
        </p>
        <p className="section-hint">
          カタログの1個1個の呼び出し方だけでなく、実際のアプリでどう組み合わせて使うかの実装例。 いずれもソースは
          <code>demo/src/examples/</code>にある。
        </p>
      </header>
      <section className="doc-section">
        <div className="catalog-grid">
          {EXAMPLES.map((example) => (
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
