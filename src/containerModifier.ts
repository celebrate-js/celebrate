// <html> へ一時的に class を付け外しする、軸A=container-modifier の共有実装。
//
// shake/hitstop/vignette は「自分は何も描かず、既存の表示を揺らす/止める/暗くする」
// タイプの効果で、他の variant と違って自分のDOMを持たない。celebrate() 経由の発火
// （CelebrateProvider）と、Tier3として直接使う useContainerModifier() の両方が、
// この1つの ref カウント実装を共有する（複数の shake が重なって発火しても、
// 最後の1つが消えるまで class を残す）。

const counts = new Map<string, number>();

/**
 * className を1つ有効化し、durationMs 後に自動で解除する。
 * 呼び出し側が先に片付けたい場合（アンマウント等）は、返り値の関数を呼べば即座に解除できる
 * （複数回呼んでも安全＝2回目以降は何もしない）。
 */
export function activateContainerModifier(className: string, durationMs: number): () => void {
  const next = (counts.get(className) ?? 0) + 1;
  counts.set(className, next);
  if (next === 1 && typeof document !== "undefined") {
    document.documentElement.classList.add(className);
  }

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    const current = (counts.get(className) ?? 1) - 1;
    if (current <= 0) {
      counts.delete(className);
      if (typeof document !== "undefined") document.documentElement.classList.remove(className);
    } else {
      counts.set(className, current);
    }
  };

  if (durationMs <= 0) return release;
  const timer = setTimeout(release, durationMs);
  return () => {
    clearTimeout(timer);
    release();
  };
}
