import { createSeededRandom, type RandomFn } from "./random";

// 花火。confetti/sparkle と違い「1点から爆散」ではなく、複数の破裂点（shell）が
// 時間差で咲く。各 shell はさらに sparkle と同じ放射状の粒を持つ（入れ子構造）。
// 実体は shell ごとに1つの ParticleField + ballisticMotion（Tier3の構造テンプレート）。
//
// React から使うときに size/color を渡して調整できるよう、purely な生成関数側に
// scale（大きさ倍率）と style（粒の散らし方）を引数として持たせてある。
// 色そのものはここでは決めない（tone という「パレットの何番目か」だけを持ち、
// 実際の色は呼び出し側の colors 配列 or theme.confettiColors を使う＝confetti/sparkle
// と同じ「色はここに書かない」設計を踏襲）。

export type FireworkStyle = "peony" | "willow" | "ring";

const FIREWORK_PARTICLE_DURATION_SECONDS = 0.85;

export interface FireworkParticle {
  id: number;
  /** ラジアン。 */
  angleRad: number;
  /** rem/秒。 */
  speed: number;
  /** rem/秒²。willowだけ大きく垂れ下がるようにする（0=無重力＝ringの均等な輪）。 */
  gravity: number;
  durationSeconds: number;
  /** rem。 */
  size: number;
  /** パレットの何番目を使うか（0以上。実際の色数で呼び出し側が mod を取る）。 */
  tone: number;
  delaySeconds: number;
}

export interface FireworkShell {
  id: number;
  /** 破裂位置（中心からの相対オフセット、rem）。 */
  offsetXRem: number;
  offsetYRem: number;
  /** 咲き始めるまでの遅延（shell 間で時間差を作る）。 */
  delaySeconds: number;
  particles: readonly FireworkParticle[];
}

export const FIREWORK_SHELL_COUNT = 3;
export const FIREWORK_PARTICLES_PER_SHELL = 12;
export const FIREWORK_DURATION_MS = 1300;

function createShellParticles(
  random: RandomFn,
  shellDelaySeconds: number,
  style: FireworkStyle,
  scale: number
): readonly FireworkParticle[] {
  return Array.from({ length: FIREWORK_PARTICLES_PER_SHELL }, (_, id) => {
    const baseAngle = (Math.PI * 2 * id) / FIREWORK_PARTICLES_PER_SHELL;
    // ring はきっちり均等な輪にするため角度のジッターを入れない。
    const angleRad = style === "ring" ? baseAngle : baseAngle + (random() - 0.5) * 0.3;
    const baseDistance = style === "ring" ? 3.4 : 2.2 + random() * 2;
    const distance = baseDistance * scale;
    // willow（枝垂れ）だけ大きく重力で下に尾を引かせる。ringは重力なし＝均等な輪のまま。
    const gravity = style === "ring" ? 0 : (style === "willow" ? 10 + random() * 6 : 3 + random() * 2.5) * scale;
    return {
      id,
      angleRad,
      speed: distance / FIREWORK_PARTICLE_DURATION_SECONDS,
      gravity,
      durationSeconds: FIREWORK_PARTICLE_DURATION_SECONDS,
      size: (0.18 + random() * 0.16) * scale,
      tone: Math.floor(random() * 4),
      delaySeconds: shellDelaySeconds + random() * 0.05,
    };
  });
}

/** 中心の上方に散らした複数の破裂点（shell）を、時間差付きで生成する。 */
export function createFireworkShells(
  random: RandomFn = Math.random,
  style: FireworkStyle = "peony",
  scale = 1
): readonly FireworkShell[] {
  return Array.from({ length: FIREWORK_SHELL_COUNT }, (_, id) => {
    const delaySeconds = id * 0.16 + random() * 0.06;
    return {
      id,
      offsetXRem: (random() - 0.5) * 7 * scale,
      offsetYRem: (-1 - random() * 2.5) * scale,
      delaySeconds,
      particles: createShellParticles(random, delaySeconds, style, scale),
    };
  });
}

export { createSeededRandom as createSeededFireworkRandom };
