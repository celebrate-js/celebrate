import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { clsx } from "./clsx";

// 合成層「sequence」（複数局面が順番に変わる。軸F=staged-sequenceの汎用実装）。
// 既に実装済みの`with`（celebrate()のoptions.with）は「parallel」相当（同時に重ねる）で、
// 名前・ReactNodeを問わずそのまま並べられる。sequenceはそれとは別の軸：
// 「前段が終わってから次段が始まる」かつ「前段の実行結果（例：着地座標）を次段の
// パラメータとして受け取れる」必要がある（「落下＋着地衝撃」のようなハンドオフ）。
// 単純な `(...leaves) => leaf[]` という純粋関数だけでは、ステップ間の状態（前段の結果を
// 覚えておいて次段に渡す）を表現できないため、ここでは状態を持つReactコンポーネントとして
// 実装した（結果の受け渡しはReactのstateが自然に担う）。

export interface SequenceStep<TResult = unknown> {
  /** このステップの内容。前ステップの結果（初段は`undefined`）を受け取れる。 */
  render: (prevResult: TResult | undefined) => ReactNode;
  /** このステップの表示時間。省略時はこのステップで止まる（sequenceの最後のステップに使う）。 */
  durationMs?: number;
  /**
   * 次のステップに渡す値を計算する。省略時は前ステップの結果をそのまま引き継ぐ。
   * 「着地座標を次段へ渡す」ようなハンドオフに使う。
   */
  computeResult?: (prevResult: TResult | undefined) => TResult;
  /** このステップが始まった瞬間に1回だけ呼ばれる（効果音・振動などをleaf単位に持たせる）。 */
  onEnter?: (prevResult: TResult | undefined) => void;
}

export interface SequenceProps<TResult = unknown> {
  steps: readonly SequenceStep<TResult>[];
  className?: string;
}

/**
 * 複数局面を順番に切り替える構造テンプレート（軸F=staged-sequence）。
 *
 *   <Sequence steps={[
 *     { render: () => <FallingCoin />, durationMs: 400, computeResult: () => ({ landedAtRem: 3.2 }) },
 *     { render: (result) => <ImpactBurst xRem={result.landedAtRem} /> },
 *   ]} />
 */
export function Sequence<TResult = unknown>({ steps, className }: SequenceProps<TResult>): ReactElement | null {
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<TResult | undefined>(undefined);
  const enteredIndexRef = useRef(-1);

  const step = steps[index];

  useEffect(() => {
    if (!step) return;
    if (enteredIndexRef.current !== index) {
      enteredIndexRef.current = index;
      step.onEnter?.(result);
    }
    if (step.durationMs === undefined) return;
    const timer = setTimeout(() => {
      setResult(step.computeResult ? step.computeResult(result) : result);
      setIndex((i) => i + 1);
    }, step.durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, step]);

  if (!step) return null;
  return (
    <span aria-hidden="true" data-sequence="" className={clsx("celebrate-anchor", className)}>
      {step.render(result)}
    </span>
  );
}
