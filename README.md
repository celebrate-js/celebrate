# @celebrate-js/celebrate

A React library for “moment” effects — stamp seals, confetti, fireworks, lightning, glowing borders, and more. Add clear visual feedback to UI interactions out of the box.

> This repository contains the package itself (`src/`) and a local sandbox (`demo/`) for development checks. The `demo/` directory is not included in the published npm package (see `files` in `package.json`). The public documentation site and interactive catalog are available at [celebrate-js-docs.pages.dev](https://celebrate-js-docs.pages.dev).

## Requirements

- React 18.3 or React 19
- Node.js 20.19 or later for local development, builds, and tests

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
