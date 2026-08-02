// 弾道運動（初速+重力）の閉じた式（解析解）。
//
// 「毎フレーム velocity += gravity*dt; position += velocity*dt」という反復積分（Euler法）は
// フレームレートに応じて誤差が蓄積し、tick数が変わると軌道も微妙に変わってしまう。
// 放物運動は既知の閉形式があるので、代わりに「経過時間 t を渡せば厳密な位置が返る」
// 関数として実装する＝rAFで毎フレーム呼んでも誤差が蓄積しない・巻き戻しや早送りも正確。

export interface BallisticParams {
  /** 発射角（ラジアン。0=右向き、-90°=真上）。 */
  angleRad: number;
  /** 初速（rem/秒）。 */
  speed: number;
  /** 重力加速度（rem/秒²）。CSSのtranslateと符号を合わせ、正の値で下方向。 */
  gravity: number;
}

export interface BallisticPosition {
  x: number;
  y: number;
}

/** 経過時間 t（秒）における位置を厳密に計算する。 */
export function ballisticPositionAt(params: BallisticParams, elapsedSeconds: number): BallisticPosition {
  const vx = Math.cos(params.angleRad) * params.speed;
  const vy = Math.sin(params.angleRad) * params.speed;
  const t = Math.max(0, elapsedSeconds);
  return {
    x: vx * t,
    y: vy * t + 0.5 * params.gravity * t * t,
  };
}
