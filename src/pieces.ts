// 紙吹雪の粒（`ConfettiBurst` が描画する見た目のデータ）。
//
// React に依存しない素のデータとして切り出してあるのは、e2e が「演出が実際に出た」ことを
// 確かめるのに粒数を import して使うため（テスト側に数を書き写すと二重管理になる＝SSOT）。
//
// 散る方向・大きさ・遅れをここで一元管理する。色だけは粒に直接持たせず
// 「パレットの何色目か」(`tone`) で持つ＝同じ散り方のままアプリごとに色を差し替えられる。

export interface ConfettiPiece {
  /** 飛ぶ先（中心からの相対位置）。 */
  x: string;
  y: string;
  /** 飛びながら回る角度。 */
  rotate: string;
  /** 粒の一辺。大小のメリハリを付けて散らかり感を出す。 */
  size: string;
  /** `CelebrateTheme.confettiColors` の何番目の色を使うか（0..3）。 */
  tone: 0 | 1 | 2 | 3;
  delay: string;
  /** 丸い粒か（false は角の粒）。 */
  round: boolean;
}

export const CONFETTI_PIECES: readonly ConfettiPiece[] = [
  { x: "-3.1rem", y: "-2.5rem", rotate: "120deg", size: "0.5rem", tone: 0, delay: "0s", round: false },
  { x: "2.8rem", y: "-2.7rem", rotate: "-90deg", size: "0.45rem", tone: 1, delay: "0.04s", round: false },
  { x: "-2.5rem", y: "1.9rem", rotate: "60deg", size: "0.35rem", tone: 2, delay: "0.08s", round: true },
  { x: "3.2rem", y: "1.2rem", rotate: "-140deg", size: "0.5rem", tone: 3, delay: "0.06s", round: false },
  { x: "0.3rem", y: "-3.4rem", rotate: "80deg", size: "0.3rem", tone: 1, delay: "0.1s", round: true },
  { x: "-0.5rem", y: "3.3rem", rotate: "-60deg", size: "0.45rem", tone: 0, delay: "0.12s", round: true },
  { x: "-3.6rem", y: "0.4rem", rotate: "-100deg", size: "0.3rem", tone: 0, delay: "0.02s", round: true },
  { x: "3.7rem", y: "-0.6rem", rotate: "150deg", size: "0.4rem", tone: 2, delay: "0.14s", round: false },
  { x: "-2.1rem", y: "-3.2rem", rotate: "40deg", size: "0.4rem", tone: 1, delay: "0.16s", round: false },
  { x: "2.2rem", y: "3.1rem", rotate: "-30deg", size: "0.3rem", tone: 3, delay: "0.09s", round: true },
  { x: "-1.2rem", y: "2.9rem", rotate: "100deg", size: "0.5rem", tone: 2, delay: "0.18s", round: false },
  { x: "1.4rem", y: "-3.6rem", rotate: "-70deg", size: "0.45rem", tone: 0, delay: "0.2s", round: true },
];

/** 紙吹雪の粒の数（e2e が「演出が出た」ことを機械的に確かめるために参照する）。 */
export const CONFETTI_PIECE_COUNT = CONFETTI_PIECES.length;

/**
 * 演出が消えるまでの時間（ms）。
 * スタンプの押印 0.3s ＋ 紙吹雪の最大 delay 0.2s ＋ 飛散 0.7s に余白を足した値。
 * `CelebrateProvider` が命令的に出した演出を片付けるタイミングとして使う。
 */
export const CELEBRATE_DURATION_MS = 1200;
