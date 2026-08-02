import type { RandomFn } from "./random";

// 「まれに演出を格上げする」variable ratio（可変比率）強化のための抽選ユーティリティ。
//
// celebrate() の内部には仕込まない＝呼び出し側が明示的に使う組み立て部品として提供する。
// このパッケージではかつて sound/confetti を特定 variant にハードコードしてしまい、
// 「その variant だけ特別扱い」という壊れやすい設計になった反省がある（#623〜のリファクタ参照）。
// 抽選ロジックを celebrate() 内に隠すと同じ轍を踏むため、ここは純粋関数として切り出し、
// 呼び出し側が結果（with に渡す値）を明示的に受け取って使う。
//
// `with` の型はあえて汎用（W）にしてある。celebrate() の `with` は登録済みの名前と
// ReactNode の両方を受け取れるが、ここは React に依存しない純粋ロジック側なので、
// 呼び出し側の `with` の実際の型をそのまま素通しする。

export interface RewardTier<W = unknown> {
  /** この階級が選ばれる相対重み（合計が1である必要はない。比率として扱われる）。 */
  chance: number;
  /** この階級で重ねるもの（celebrate() の `options.with` にそのまま渡せる）。 */
  with?: W;
}

/**
 * 重み付き抽選で1つの階級を選ぶ。
 *
 * ```ts
 * const tier = rollRewardTier([
 *   { chance: 0.7 },                                          // 通常
 *   { chance: 0.25, with: ["confetti"] },                     // ちょっと豪華
 *   { chance: 0.05, with: ["confetti", "sparkle", "ring"] },  // 大当たり
 * ]);
 * celebrate("stamp", { with: tier.with });
 * ```
 */
export function rollRewardTier<T extends RewardTier>(
  tiers: readonly T[],
  random: RandomFn = Math.random
): T {
  if (tiers.length === 0) {
    throw new Error("rollRewardTier には最低1つ tier が必要です");
  }
  const total = tiers.reduce((sum, tier) => sum + tier.chance, 0);
  let roll = random() * total;
  for (const tier of tiers) {
    roll -= tier.chance;
    if (roll <= 0) return tier;
  }
  return tiers[tiers.length - 1]!;
}
