// 専用の粒生成ファイル（sparkle.ts / cracker.ts / rain.ts など）を持たない
// variant の duration 置き場。単体のCSSアニメーションだけで完結する variant は
// ここにまとめる（アニメーション自体は celebrate.css 側の @keyframes に定義があり、
// ここは「片付けまでの時間」を一元管理するための数値だけを持つ＝CSSと二重管理しない）。
// 中身は雑多（②達成・③報酬・④環境・⑤キャラクターが混在）で、分類は variants.ts
// 冒頭のコメント表を参照すること（このファイル名 = カテゴリではない）。

export const RIPPLE_DURATION_MS = 550;
export const RING_DURATION_MS = 850;
export const BOUNCE_DURATION_MS = 550;
export const MEDAL_DURATION_MS = 650;
export const FLASH_DURATION_MS = 550;
export const CHECKMARK_DURATION_MS = 700;
export const SHAKE_DURATION_MS = 450;
export const HITSTOP_DURATION_MS = 350;
export const POPUP_DURATION_MS = 900;
export const VIGNETTE_DURATION_MS = 650;
export const LIGHTNING_DURATION_MS = 500;
export const FLOAT_DURATION_MS = 2400;
