// 紙吹雪の粒（`ConfettiBurst` が描画する見た目のデータ）。
//
// React に依存しない素のデータとして切り出してあるのは、e2e が「演出が実際に出た」ことを
// 確かめるのに粒数を import して使うため（テスト側に数を書き写すと二重管理になる＝SSOT）。
//
// 散る方向・大きさ・遅れをここで一元管理する。色だけは粒に直接持たせず
// 「パレットの何色目か」(`tone`) で持つ＝同じ散り方のままアプリごとに色を差し替えられる。
//
// 実体は ParticleField + radialMotion（Tier3の構造テンプレート）のプリセット。
// 元の意匠（座標）はデザイン時に決めた x/y（rem）のまま管理し、
// angleRad/speed への変換はモジュール読み込み時に1回だけ行う。

export const CONFETTI_DURATION_SECONDS = 0.7;

interface ConfettiPieceSource {
  /** 中心からの相対位置（rem）。角度・速さの算出元。 */
  x: number;
  y: number;
  rotateDeg: number;
  /** 粒の一辺（rem）。大小のメリハリを付けて散らかり感を出す。 */
  size: number;
  /** `CelebrateTheme.confettiColors` の何番目の色を使うか（0..3）。 */
  tone: 0 | 1 | 2 | 3;
  delaySeconds: number;
  /** 丸い粒か（false は角の粒）。 */
  round: boolean;
}

const CONFETTI_PIECE_SOURCES: readonly ConfettiPieceSource[] = [
  { x: -3.1, y: -2.5, rotateDeg: 120, size: 0.5, tone: 0, delaySeconds: 0, round: false },
  { x: 2.8, y: -2.7, rotateDeg: -90, size: 0.45, tone: 1, delaySeconds: 0.04, round: false },
  { x: -2.5, y: 1.9, rotateDeg: 60, size: 0.35, tone: 2, delaySeconds: 0.08, round: true },
  { x: 3.2, y: 1.2, rotateDeg: -140, size: 0.5, tone: 3, delaySeconds: 0.06, round: false },
  { x: 0.3, y: -3.4, rotateDeg: 80, size: 0.3, tone: 1, delaySeconds: 0.1, round: true },
  { x: -0.5, y: 3.3, rotateDeg: -60, size: 0.45, tone: 0, delaySeconds: 0.12, round: true },
  { x: -3.6, y: 0.4, rotateDeg: -100, size: 0.3, tone: 0, delaySeconds: 0.02, round: true },
  { x: 3.7, y: -0.6, rotateDeg: 150, size: 0.4, tone: 2, delaySeconds: 0.14, round: false },
  { x: -2.1, y: -3.2, rotateDeg: 40, size: 0.4, tone: 1, delaySeconds: 0.16, round: false },
  { x: 2.2, y: 3.1, rotateDeg: -30, size: 0.3, tone: 3, delaySeconds: 0.09, round: true },
  { x: -1.2, y: 2.9, rotateDeg: 100, size: 0.5, tone: 2, delaySeconds: 0.18, round: false },
  { x: 1.4, y: -3.6, rotateDeg: -70, size: 0.45, tone: 0, delaySeconds: 0.2, round: true },
];

export interface ConfettiPiece {
  /** ラジアン。飛ぶ方向。 */
  angleRad: number;
  /** rem/秒。 */
  speed: number;
  /** 度。粒自体の固定的な向き。 */
  rotateDeg: number;
  size: number;
  tone: 0 | 1 | 2 | 3;
  delaySeconds: number;
  round: boolean;
}

export const CONFETTI_PIECES: readonly ConfettiPiece[] = CONFETTI_PIECE_SOURCES.map((source) => ({
  angleRad: Math.atan2(source.y, source.x),
  speed: Math.hypot(source.x, source.y) / CONFETTI_DURATION_SECONDS,
  rotateDeg: source.rotateDeg,
  size: source.size,
  tone: source.tone,
  delaySeconds: source.delaySeconds,
  round: source.round,
}));

/** 紙吹雪の粒の数（e2e が「演出が出た」ことを機械的に確かめるために参照する）。 */
export const CONFETTI_PIECE_COUNT = CONFETTI_PIECES.length;

/**
 * 演出が消えるまでの時間（ms）。
 * スタンプの押印 0.3s ＋ 紙吹雪の最大 delay 0.2s ＋ 飛散 0.7s に余白を足した値。
 * `CelebrateProvider` が命令的に出した演出を片付けるタイミングとして使う。
 */
export const CELEBRATE_DURATION_MS = 1200;
