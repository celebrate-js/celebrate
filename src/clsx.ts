/** 最小の className 結合ヘルパー（`clsx`/`classnames` 相当をこの規模のためだけに依存追加しない）。 */
export function clsx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
