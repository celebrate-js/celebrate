import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/index.ts", "src/react.ts"],
      reporter: ["text", "html"],
      // 現状（2026-08時点）の実測値からやや下げた「回帰を防ぐだけ」の閾値。
      // 目標値ではない。特にParticleField系コンポーネント（BounceText/MedalBadge/
      // FireworkBurst等、37ファイル中）はレンダリングの単体テストが無く低いまま
      // なので、上げていくのは別途の作業として計測だけ先に導入する。
      thresholds: {
        lines: 60,
        statements: 60,
        branches: 80,
        functions: 40,
      },
    },
  },
});
