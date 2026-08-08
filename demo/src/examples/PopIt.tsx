import { ExamplePageLayout } from "./ExamplePageLayout";
import { PopItGrid } from "./PopItStage";
import { useT } from "../i18n";

const TEXT = {
  ja: {
    title: "ポップイット",
    description: (
      <>
        シリコンのプチプチ（Pop
        It）のように、タップするだけで可愛いエフェクトが見れるタイル集め。タイルを押すとそのテーマ専用のページ（暗い夜空・水面・雪景色…）に入り、そこでタップするたびに何度でも演出が見られる。ほとんどはカタログの既存variantをanchorで舞台に発火するだけだが、❄️雪と🌀渦だけはカタログに無い独自の動き（ParticleField
        +
        自作/既存のMotionProfile）をcelebrate(&lt;SnowFall/&gt;)のようにReactNodeとしてそのまま渡している。⚡️雷・☔️雨・💔ひび割れは画面全体演出なのでanchor無し。🥎だけは仕組みが違い、ミニゲーム（/examples/game）と同じ「出てくるターゲットをタップする」形式。単体アプリとしても切り出してあり、
        <code>demo/popit.html</code>から独立して動く。
      </>
    ),
  },
  en: {
    title: "Pop It",
    description: (
      <>
        A grid of tappable mini-effect tiles, like the silicone Pop It toy. Tap a tile to enter its themed stage (a dark
        night sky, a water surface, a snowy scene...) where tapping fires the effect again, as many times as you like.
        Most tiles simply fire an existing catalog variant anchored to the stage, but ❄️ Snow and 🌀 Swirl use custom
        motion not in the catalog (ParticleField + a custom/existing MotionProfile), passed straight through as a
        ReactNode via celebrate(&lt;SnowFall/&gt;). ⚡️ Lightning, ☔️ Rain, and 💔 Shatter are full-screen effects, so no
        anchor. 🥎 works differently — the same “tap the target as it appears” mechanic as the mini game
        (/examples/game). It's also split out as a standalone app, running independently from{" "}
        <code>demo/popit.html</code>.
      </>
    ),
  },
};

/** ポップイットのタイル一覧（グリッド）。各タイルは専用ページ（/examples/popit/:id）へのリンク。
 * 単体アプリとして切り出したもの（popit.html）は PopItStandaloneApp.tsx を参照。 */
export function PopIt() {
  const t = useT(TEXT);
  return (
    <ExamplePageLayout icon="🫧" title={t.title} description={t.description}>
      <section className="doc-section">
        <PopItGrid basePath="/examples/popit" />
      </section>
    </ExamplePageLayout>
  );
}
