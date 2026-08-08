# @celebrate-js/celebrate

日本語 | [English](README.en.md)

React向けの「決まった瞬間」の演出ライブラリ。印影スタンプ・紙吹雪・花火・稲光・ボーダーの発光など、UI操作への視覚的フィードバックをまとめて提供します。

> このリポジトリはパッケージ本体（`src/`）と、開発時に手元で動作確認するためのローカルサンドボックス（`demo/`）で構成されています。`demo/`はnpm公開物には含まれません（`package.json`の`files`参照）。公式ドキュメントサイトのようなものが必要になった場合は、別リポジトリ／別ディレクトリとして切り出すのが一般的です（このリポジトリの中に置くものではありません）。

## インストール

```bash
npm install @celebrate-js/celebrate
```

スタイルは1回だけimportしてください。

```ts
import "@celebrate-js/celebrate/celebrate.css";
```

## クイックスタート

```tsx
import { CelebrateProvider, useCelebrate } from "@celebrate-js/celebrate/react";

function App() {
  return (
    <CelebrateProvider>
      <SubmitButton />
    </CelebrateProvider>
  );
}

function SubmitButton() {
  const celebrate = useCelebrate();
  return <button onClick={() => celebrate("confetti")}>送信</button>;
}
```

## ドキュメント

- [ガイド](docs/guide.md) — 3層の設計思想・カタログ・各コンポーネントの使い方
- [API リファレンス](docs/api-reference.md) — props・optionsの型と既定値の一覧
- [カタログ妥当性根拠](docs/catalog-rationale.md) — 25 variantがなぜ入っているかの理論的根拠・出典
- [エフェクト構造の分解](docs/effect-structure-taxonomy.md) — 実装の構造的な分類・設計メモ

## 開発

```bash
npm run typecheck
npm test

# ローカルの動作確認用サンドボックス（npm公開物には含まれない）
npm --prefix demo run dev
```
