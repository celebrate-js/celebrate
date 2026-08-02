// 中心からscale＋opacityで広がって消える「空のエフェクト構造」。
//
// 以前は pop/ripple/ring/flash がそれぞれ別コンポーネント・別CSSキーフレームとして
// 実装されていたが、中身を比べると「scale(from→to) + opacity(from→0)」という
// 同一メカニズムに、塗り方（塗りつぶし／輪郭／グロー）とサイズ・色・速さの違いしかなかった。
// ここでは構造（layers）だけを定義し、pop/ripple/ring/flash はその上のプリセット
// （＝パラメータの組み合わせ）として表現する。
//
// layers を複数持たせられるため、「大きさの違う輪を時間差で重ねる」ような表現
// （ripple の水滴らしさ、ring の二重リングなど）も同じ構造の中でパラメータだけで作れる。

export type RadialBurstShape = "fill" | "outline" | "glow";

export interface RadialLayer {
  shape: RadialBurstShape;
  /** 開始時のscale。 */
  scaleFrom: number;
  /** 終了時のscale。 */
  scaleTo: number;
  /** 要素の基準直径（rem）。 */
  size: number;
  /** 発火からの遅延（ms）。複数layerを時間差で重ねるときに使う。 */
  delayMs?: number;
  /** このlayer自体のアニメーション長（ms）。省略時は500ms。 */
  durationMs?: number;
  /** このlayerだけ色を上書きしたいとき。省略時は呼び出し側の色（theme.stampColor等）。 */
  color?: string;
}

export interface RadialBurstPreset {
  /** 片付けまでの目安時間（ms）。celebrate()側のduration表と一致させる。 */
  durationMs: number;
  layers: readonly RadialLayer[];
}

/** pop/ripple/ring/flash は全てこの構造のプリセット（パラメータの組み合わせ）。 */
export const RADIAL_BURST_PRESETS = {
  // ポップイット用の軽量な塗りつぶし円。1layerだけ。
  pop: {
    durationMs: 260,
    layers: [{ shape: "fill", scaleFrom: 0.3, scaleTo: 1.05, size: 2.6, durationMs: 260 }],
  },
  // 水滴が落ちた波紋。3つの輪が少しずつ小さく始まり、時間差で広がる
  // （実際の水面の波紋のように、後から出る輪ほど大きく速く広がる）。
  ripple: {
    durationMs: 700,
    layers: [
      { shape: "outline", scaleFrom: 0.3, scaleTo: 2.2, size: 2.4, delayMs: 0, durationMs: 460 },
      { shape: "outline", scaleFrom: 0.3, scaleTo: 2.6, size: 1.8, delayMs: 140, durationMs: 460 },
      { shape: "outline", scaleFrom: 0.3, scaleTo: 3.0, size: 1.3, delayMs: 280, durationMs: 420 },
    ],
  },
  // 二重リング。ripple より力強く、遅延も1段だけ。
  ring: {
    durationMs: 850,
    layers: [
      { shape: "outline", scaleFrom: 0.5, scaleTo: 2.2, size: 2, delayMs: 0, durationMs: 600 },
      { shape: "outline", scaleFrom: 0.5, scaleTo: 2.2, size: 2, delayMs: 120, durationMs: 600 },
    ],
  },
  // 柔らかいグロー光彩。1layer。
  flash: {
    durationMs: 550,
    layers: [{ shape: "glow", scaleFrom: 0.2, scaleTo: 1.8, size: 4, durationMs: 500 }],
  },
} as const satisfies Record<"pop" | "ripple" | "ring" | "flash", RadialBurstPreset>;

export type RadialBurstPresetName = keyof typeof RADIAL_BURST_PRESETS;
