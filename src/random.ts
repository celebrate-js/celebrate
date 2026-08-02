export type RandomFn = () => number;

/** 決定的な疑似乱数（LCG）。テスト・デモでの再現性のために使う。 */
export function createSeededRandom(seed: number): RandomFn {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
