// 「入って、そのまま残る」構造テンプレート（軸F=enter-and-persist）。
//
// stamp/medal/recordは実装としては全部「scale・縦位置・回転がease-outで収まって
// opacityが0→1になり、そのまま留まる」という同じ形で、違うのは開始値と
// イージング（recordだけ行き過ぎてから戻るバネ的な動き）だけだった。
// RadialBurst/ParticleField/StrokePathと違い、この軸は「新しいDOMを描く」ではなく
// 「呼び出し側の要素自身に entrance の class+style を足す」だけなので、
// 専用コンポーネントではなく、既存要素へ合成する薄いヘルパー関数として提供する
// （呼び出し側の`celebrate-stamp`のような自前のレイアウト用CSSと共存できるように）。
//
//   <div
//     className={clsx("celebrate-stamp", "celebrate-enter-settle")}
//     style={enterSettleStyle({ scaleFrom: 1.7, rotateFromDeg: -14, rotateToDeg: -6 })}
//   >

export interface EnterSettleOptions {
  /** 開始時のscale。既定1（拡大なし）。 */
  scaleFrom?: number;
  /** 終了時のscale。既定1。 */
  scaleTo?: number;
  /** 開始時の縦方向オフセット（rem。負で上から）。既定0。 */
  translateYFromRem?: number;
  /** 開始時の回転（度）。既定0。 */
  rotateFromDeg?: number;
  /** 終了時の回転（度）。stampのように傾いたまま留めたい場合はここも指定する。既定0。 */
  rotateToDeg?: number;
  /**
   * イージング。"settle"=素直に収まる（ease-out）。
   * "overshoot"=行き過ぎてから戻るバネ的な動き（record相当）。1つのkeyframe（from/to）の
   * まま、イージング関数だけでオーバーシュートを表現する（cubic-bezierのovershoot）。
   * 既定"settle"。
   */
  easing?: "settle" | "overshoot";
  durationMs?: number;
}

const OVERSHOOT_EASING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

/** `.celebrate-enter-settle`クラスと組み合わせて使う、entranceパラメータのstyleを作る。 */
export function enterSettleStyle(options: EnterSettleOptions = {}): Record<string, string | number> {
  const {
    scaleFrom = 1,
    scaleTo = 1,
    translateYFromRem = 0,
    rotateFromDeg = 0,
    rotateToDeg = 0,
    easing = "settle",
    durationMs = 300,
  } = options;
  return {
    "--celebrate-enter-scale-from": scaleFrom,
    "--celebrate-enter-scale-to": scaleTo,
    "--celebrate-enter-translate-y": `${translateYFromRem}rem`,
    "--celebrate-enter-rotate-from": `${rotateFromDeg}deg`,
    "--celebrate-enter-rotate-to": `${rotateToDeg}deg`,
    animationDuration: `${durationMs}ms`,
    animationTimingFunction: easing === "overshoot" ? OVERSHOOT_EASING : "ease-out",
  };
}
