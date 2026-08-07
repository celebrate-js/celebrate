import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ExamplePageLayout } from "./ExamplePageLayout";
import { POPIT_TILES } from "./PopItStage";

/** ポップイットのタイル一覧（グリッド）。各タイルは専用ページ（/examples/popit/:id）へのリンク。 */
export function PopIt() {
  return (
    <ExamplePageLayout
      icon="🫧"
      title="ポップイット"
      description="シリコンのプチプチ（Pop It）のように、タップするだけで可愛いエフェクトが見れるタイル集め。タイルを押すとそのテーマ専用のページ（暗い夜空・水面・雪景色…）に入り、そこでタップするたびに何度でも演出が見られる。ほとんどはカタログの既存variantをanchorで舞台に発火するだけだが、❄️雪と🌀渦だけはカタログに無い独自の動き（ParticleField + 自作/既存のMotionProfile）をcelebrate(<SnowFall/>)のようにReactNodeとしてそのまま渡している。⚡️雷・☔️雨・💔ひび割れは画面全体演出なのでanchor無し。🥎だけは仕組みが違い、ミニゲーム（/examples/game）と同じ「出てくるターゲットをタップする」形式。"
    >
      <section className="doc-section">
        <div className="popit-grid">
          {POPIT_TILES.map((tile) => (
            <Link
              key={tile.id}
              to={`/examples/popit/${tile.id}`}
              className="popit-tile"
              style={{ background: tile.idleBg } as CSSProperties}
            >
              <span className="popit-tile-icon">{tile.icon}</span>
              <span className="popit-tile-label">{tile.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </ExamplePageLayout>
  );
}
