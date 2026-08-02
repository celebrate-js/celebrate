// コンボ・連鎖のような「変数を受け取って演出が連続的に派手になる」ケース向けの、
// intensity（強度）→ 各チャネルの倍率への変換。
//
// 呼び出し側は combo 数のような生の値をそのまま渡してよい
// （celebrate("confetti", { intensity: comboCount })）。線形にスケールすると
// すぐ画面が壊れるほど巨大化するため、対数カーブで頭打ちにする。
// intensity=1（既定・「1コンボ目」に相当）で必ず倍率1.0＝通常運転になるよう、
// log2(intensity) を軸にする（log2(1)=0 なので intensity=1 で必ず基準値に一致する）。

function curve(intensity: number, slope: number, min: number, max: number): number {
  const clamped = Math.max(0.1, intensity);
  const value = 1 + Math.log2(clamped) * slope;
  return Math.min(max, Math.max(min, value));
}

/** 見た目の拡大率（transform: scale に使う）。 */
export function intensityToScale(intensity: number): number {
  return curve(intensity, 0.4, 0.5, 2.4);
}

/** duration の倍率（激しいほど少しだけ長く見せる）。 */
export function intensityToDurationMultiplier(intensity: number): number {
  return curve(intensity, 0.12, 0.7, 1.6);
}

/** 効果音のゲイン倍率。 */
export function intensityToGainMultiplier(intensity: number): number {
  return curve(intensity, 0.2, 0.4, 1.8);
}

/** 振動パターンの倍率。 */
export function intensityToHapticMultiplier(intensity: number): number {
  return curve(intensity, 0.25, 0.4, 1.8);
}
