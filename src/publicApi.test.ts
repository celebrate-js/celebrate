// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import * as indexExports from "./index";
import * as reactExports from "./react";

// 公開APIの「うっかり削除・rename」を検知するためのスナップショットテスト。
// 型だけのexportは実行時のObject.keysには出てこない（TypeScriptの型消去のため）ので、
// ここで守れるのは値のexport（関数・定数・コンポーネント）だけ。型のrename/削除は、
// それを参照している既存コードがある限りtscが検知する。
//
// スナップショットが変わった場合：
// - 意図した追加/削除/renameなら `vitest run -u` で更新してよい。
// - 意図しない変化なら公開APIが壊れているサイン。
function sortedExportNames(mod: object): string[] {
  return Object.keys(mod).sort();
}

describe("公開APIの値export一覧（うっかり削除・renameの検知用）", () => {
  it("'.'（src/index.ts）", () => {
    expect(sortedExportNames(indexExports)).toMatchSnapshot();
  });

  it("'./react'（src/react.ts）", () => {
    expect(sortedExportNames(reactExports)).toMatchSnapshot();
  });
});
