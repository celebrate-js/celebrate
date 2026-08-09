# @celebrate-js/celebrate

英語版のREADMEは[README.md](README.md)です。

React向けの「決まった瞬間」の演出ライブラリ。印影スタンプ・紙吹雪・花火・稲光・ボーダーの発光など、UI操作への視覚的フィードバックをまとめて提供します。

> このリポジトリはパッケージ本体（`src/`）と、開発時に手元で動作確認するためのローカルサンドボックス（`demo/`）で構成されています。`demo/`はnpm公開物には含まれません（`package.json`の`files`参照）。公開ドキュメントサイトと試せるカタログは[celebrate-js-docs.pages.dev](https://celebrate-js-docs.pages.dev)で公開しています。

## 動作要件

- React 18.3 または React 19
- ローカル開発・ビルド・テストにはNode.js 20.19以降

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

- [公開ドキュメント・試せるカタログ](https://celebrate-js-docs.pages.dev) — ガイド、APIリファレンス、25種類のエフェクトをブラウザで試せます
- [ガイド](docs/guide.md) — 3層の設計思想・カタログ・各コンポーネントの使い方
- [API リファレンス](docs/api-reference.md) — props・optionsの型と既定値の一覧
- [カタログ妥当性根拠](docs/catalog-rationale.md) — 25 variantがなぜ入っているかの理論的根拠・出典
- [エフェクト構造の分解](docs/effect-structure-taxonomy.md) — 実装の構造的な分類・設計メモ
- [デモ素材の由来](docs/asset-provenance.md) — アザラシ画像の公開・再配布に関する確認

> リンク先のドキュメントは現在日本語のみです。

## 開発

```bash
npm run typecheck
npm test

# ローカルの動作確認用サンドボックス（npm公開物には含まれない）
npm --prefix demo run dev
```
