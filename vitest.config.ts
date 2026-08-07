import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/index.ts", "src/react.ts"],
      reporter: ["text", "html"],
      // 現状（2026-08時点、vitest4のv8カバレッジ計測）の実測値からやや下げた
      // 「回帰を防ぐだけ」の閾値。目標値ではない。
      // 残る低カバレッジはCelebrateProvider.tsx/context.ts/useContainerModifier.ts
      // （useEffect主体で、renderToStaticMarkupでは実行されない）と、recipes.tsx
      // （25 variantの巨大なdispatch表で、テストが触れていない分岐がまだ多い）。
      thresholds: {
        lines: 75,
        statements: 75,
        branches: 65,
        functions: 60,
      },
    },
  },
});
