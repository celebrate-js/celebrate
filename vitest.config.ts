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
      // 「回帰を防ぐだけ」の閾値。目標値ではない。branches算出方法がvitest2時代から
      // 変わり数値が下がったため、vitest4アップグレード時に合わせて調整している。
      // 特にParticleField系コンポーネント（BounceText/MedalBadge/FireworkBurst等）は
      // レンダリングの単体テストが無く低いままなので、上げていくのは別途の作業。
      thresholds: {
        lines: 60,
        statements: 60,
        branches: 50,
        functions: 40,
      },
    },
  },
});
