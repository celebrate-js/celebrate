// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

// src/ = ライブラリ本体（ブラウザ向け）、demo/ = ドキュメント兼サンプルサイト（別tsconfig）。
// dist/はビルド成果物なので対象外（.gitignore同様、lintも通す意味がない）。
export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "demo/dist/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}", "demo/src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.es2020 },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // ライブラリ全体でReact.FC等を使わず素直な関数宣言のコンポーネントで統一しているため、
      // 未使用変数はTypeScript側（noUnusedLocals/noUnusedParameters）で既に検知している。
      // ESLint側は「_」始まりの意図的な未使用引数だけ緩める。
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  // フォーマットに関わるルール（インデント・クォート等）はPrettierに一本化する。
  // 必ず配列の最後に置き、上のconfigが有効化したstyle系ルールを打ち消す。
  eslintConfigPrettier
);
