import { ExamplePageLayout } from "./ExamplePageLayout";
import { PopItGrid } from "./PopItStage";

/** ポップイットのタイル一覧（グリッド）。各タイルは専用ページ（/examples/popit/:id）へのリンク。
 * 単体アプリとして切り出したもの（popit.html）は PopItStandaloneApp.tsx を参照。 */
export function PopIt() {
  return (
    <ExamplePageLayout
      icon="🫧"
      title="ポップイット"
      description="シリコンのプチプチ（Pop It）のように、タップするだけで可愛いエフェクトが見れるタイル集め。タイルを押すとそのテーマ専用のページ（暗い夜空・水面・雪景色…）に入り、そこでタップするたびに何度でも演出が見られる。ほとんどはカタログの既存variantをanchorで舞台に発火するだけだが、❄️雪と🌀渦だけはカタログに無い独自の動き（ParticleField + 自作/既存のMotionProfile）をcelebrate(<SnowFall/>)のようにReactNodeとしてそのまま渡している。⚡️雷・☔️雨・💔ひび割れは画面全体演出なのでanchor無し。🥎だけは仕組みが違い、ミニゲーム（/examples/game）と同じ「出てくるターゲットをタップする」形式。単体アプリとしても切り出してあり、<code>demo/popit.html</code>から独立して動く。"
    >
      <section className="doc-section">
        <PopItGrid basePath="/examples/popit" />
      </section>
    </ExamplePageLayout>
  );
}
