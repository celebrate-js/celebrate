# @celebrate-js/celebrate

[日本語](README.md) | English

A React library for "moment" effects — stamp seals, confetti, fireworks, lightning, glowing borders, and more, giving you visual feedback for UI interactions out of the box.

> This repo contains the package itself (`src/`) plus a local sandbox (`demo/`) used to try things out during development. `demo/` is not part of the published npm package (see `files` in `package.json`). If you need something like a public docs site, the usual approach is to split it into a separate repo/directory rather than keep it here.

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

- [Guide](docs/guide.md) — the 3-tier design philosophy, the catalog, and how to use each component
- [API reference](docs/api-reference.md) — prop/option types and defaults
- [Catalog rationale](docs/catalog-rationale.md) — why these 25 variants, with theory and sources
- [Effect structure taxonomy](docs/effect-structure-taxonomy.md) — a structural breakdown of the implementation

Note: the docs linked above (`docs/*.md`) are Japanese-only for now.

## Development

```bash
npm run typecheck
npm test

# Local sandbox for trying things out (not part of the published package)
npm --prefix demo run dev
```
