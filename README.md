<a id="english"></a>

# @celebrate-js/celebrate

English | [日本語](#japanese)

A React library for “moment” effects — stamp seals, confetti, fireworks, lightning, glowing borders, and more. Add clear visual feedback to UI interactions out of the box.

> This repository contains the package itself (`src/`) and a local sandbox (`demo/`) for development checks. The `demo/` directory is not included in the published npm package (see `files` in `package.json`). The public documentation site and interactive catalog are available at [celebrate-js-docs.pages.dev](https://celebrate-js-docs.pages.dev).

## Install

```bash
npm install @celebrate-js/celebrate
```

Import the stylesheet once.

```ts
import "@celebrate-js/celebrate/celebrate.css";
```

## Quickstart

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
  return <button onClick={() => celebrate("confetti")}>Submit</button>;
}
```

## Documentation

- [Online documentation and interactive catalog](https://celebrate-js-docs.pages.dev) — guides, API reference, and all 25 effects to try in the browser
- [Guide](docs/guide.md) — the 3-tier design philosophy, catalog, and component usage
- [API reference](docs/api-reference.md) — prop/option types and defaults
- [Catalog rationale](docs/catalog-rationale.md) — why the catalog contains 25 variants, with theory and sources
- [Effect structure taxonomy](docs/effect-structure-taxonomy.md) — a structural breakdown and design notes
- [Demo asset provenance](docs/asset-provenance.md) — publication and redistribution confirmation for the seal images

> The linked documentation is currently Japanese-only.

## Development

```bash
npm run typecheck
npm test

# Local sandbox for trying things out (not part of the published package)
npm --prefix demo run dev
```

---

<a id="japanese"></a>

# @celebrate-js/celebrate

[English](#english) | 日本語

React向けの「決まった瞬間」の演出ライブラリ。印影スタンプ・紙吹雪・花火・稲光・ボーダーの発光など、UI操作への視覚的フィードバックをまとめて提供します。

> このリポジトリはパッケージ本体（`src/`）と、開発時に手元で動作確認するためのローカルサンドボックス（`demo/`）で構成されています。`demo/`はnpm公開物には含まれません（`package.json`の`files`参照）。公開ドキュメントサイトと試せるカタログは[celebrate-js-docs.pages.dev](https://celebrate-js-docs.pages.dev)で公開しています。

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
