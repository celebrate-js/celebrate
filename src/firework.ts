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

// 日本の花火の分類（割物：菊・牡丹・型物、小割物：千輪、ポカ物：柳・蜂 等）を参考にした
// バリエーション。peony=牡丹（均等な丸い粒）・willow=柳（重力強めで尾が垂れる）・
// ring=輪（重力なしの均等な輪）は既存。以下を追加：
//   kiku  = 菊（点ではなく外向きの線の尾を引く）
//   star  = 型物・星形（半径を角度で5回波打たせて星形の輪郭にする）
//   senrin= 千輪（1つの大きな爆発ではなく、小さな爆発が複数同時に咲く）
//   hachi = 蜂（消える前までずっとチカチカ明滅しながら不規則に散る）
export type FireworkStyle = "peony" | "willow" | "ring" | "kiku" | "star" | "senrin" | "hachi";

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
  /**
   * `senrin`専用：この粒が属す小爆発の中心の、shell中心からの相対オフセット（rem）。
   * 他のstyleでは常に0（shell中心の1点から爆発）。
   */
  originOffsetXRem?: number;
  originOffsetYRem?: number;
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

// 型物・星形：半径を角度でなめらかに波打たせる（cos(5θ)）だけだと丸まった5弁の花のような
// シルエットになり、星の「尖り」が出ない。実際の星型（五芒星）の輪郭に沿うよう、
// 外側の頂点（5点）と内側の谷（5点）を交互に直線でつなぐ区分線形の半径関数にする。
const STAR_POINTS = 5;
const STAR_INNER_RADIUS_RATIO = 0.42;

/** 星形の半径倍率（0〜1）を角度から求める区分線形関数。テストのため公開している。 */
export function starRadiusMultiplier(angleRad: number): number {
  const segmentCount = STAR_POINTS * 2; // 頂点10個（外側5・内側5）＝10区間
  const segmentWidth = (Math.PI * 2) / segmentCount;
  const normalized = ((angleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const segmentIndex = Math.floor(normalized / segmentWidth);
  const withinSegment = (normalized - segmentIndex * segmentWidth) / segmentWidth;
  const isRisingToOuter = segmentIndex % 2 === 1; // 谷→頂点へ向かう区間か
  const from = isRisingToOuter ? STAR_INNER_RADIUS_RATIO : 1;
  const to = isRisingToOuter ? 1 : STAR_INNER_RADIUS_RATIO;
  return from + (to - from) * withinSegment;
}

// 型物・星形：cos(5θ)の丸い波では輪郭を12点だけで拾いきれずボヤけるため、
// 尖った頂点・谷を密にサンプリングできるよう専用の粒数を使う。
export const STAR_PARTICLE_COUNT = 40;

function createStarParticles(random: RandomFn, shellDelaySeconds: number, scale: number): readonly FireworkParticle[] {
  return Array.from({ length: STAR_PARTICLE_COUNT }, (_, id) => {
    // 角度そのものをジッターさせると輪郭の頂点・谷の位置がなまってしまうため、
    // 角度は均等固定にし、距離だけにごくわずかな揺らぎを持たせる。
    const angleRad = (Math.PI * 2 * id) / STAR_PARTICLE_COUNT;
    const distance = (1.6 + starRadiusMultiplier(angleRad) * 2.6 + (random() - 0.5) * 0.15) * scale;
    return {
      id,
      angleRad,
      speed: distance / FIREWORK_PARTICLE_DURATION_SECONDS,
      gravity: (1 + random() * 1) * scale,
      durationSeconds: FIREWORK_PARTICLE_DURATION_SECONDS,
      size: (0.16 + random() * 0.08) * scale,
      tone: Math.floor(random() * 4),
      delaySeconds: shellDelaySeconds + random() * 0.03,
    };
  });
}

// 千輪：1つのshellを、小さな爆発の中心（クラスタ）いくつかに分けて咲かせる。
const SENRIN_CLUSTER_COUNT = 4;

function createSenrinParticles(
  random: RandomFn,
  shellDelaySeconds: number,
  scale: number
): readonly FireworkParticle[] {
  // クラスタ中心を完全ランダムに置くと偶然近い位置に固まり「複数の小爆発」に見えないことが
  // あったため、均等角度（90°ずつ）＋ジッターで確実に分散させる。各クラスタの発火にも
  // 少し時間差（cascade）を付け、順番に咲いていくように見せる。
  const clusterOrigins = Array.from({ length: SENRIN_CLUSTER_COUNT }, (_, i) => {
    const clusterAngle = (Math.PI * 2 * i) / SENRIN_CLUSTER_COUNT + (random() - 0.5) * 0.6;
    const clusterDistance = (1.6 + random() * 0.8) * scale;
    return {
      x: Math.cos(clusterAngle) * clusterDistance,
      y: Math.sin(clusterAngle) * clusterDistance,
      delay: i * 0.07 + random() * 0.03,
    };
  });
  return Array.from({ length: FIREWORK_PARTICLES_PER_SHELL }, (_, id) => {
    const cluster = clusterOrigins[id % SENRIN_CLUSTER_COUNT]!;
    const baseAngle = (Math.PI * 2 * id) / FIREWORK_PARTICLES_PER_SHELL;
    const angleRad = baseAngle + (random() - 0.5) * 0.9;
    // クラスタ自体が離れて配置されるようになった分、個々の小爆発は小さめに保つ
    // （大きいと隣のクラスタと重なって「1つの大きな爆発」に見えてしまう）。
    const distance = (0.55 + random() * 0.55) * scale;
    return {
      id,
      angleRad,
      speed: distance / FIREWORK_PARTICLE_DURATION_SECONDS,
      gravity: (3 + random() * 2) * scale,
      durationSeconds: FIREWORK_PARTICLE_DURATION_SECONDS,
      size: (0.16 + random() * 0.14) * scale,
      tone: Math.floor(random() * 4),
      delaySeconds: shellDelaySeconds + cluster.delay,
      originOffsetXRem: cluster.x,
      originOffsetYRem: cluster.y,
    };
  });
}

function createShellParticles(
  random: RandomFn,
  shellDelaySeconds: number,
  style: FireworkStyle,
  scale: number
): readonly FireworkParticle[] {
  if (style === "senrin") return createSenrinParticles(random, shellDelaySeconds, scale);
  if (style === "star") return createStarParticles(random, shellDelaySeconds, scale);

  return Array.from({ length: FIREWORK_PARTICLES_PER_SHELL }, (_, id) => {
    const baseAngle = (Math.PI * 2 * id) / FIREWORK_PARTICLES_PER_SHELL;
    let angleRad = baseAngle;
    let baseDistance = 2.2 + random() * 2;
    let gravityBase = 3;
    let gravityRange = 2.5;

    switch (style) {
      case "ring":
        // きっちり均等な輪にするため角度のジッターを入れず、重力もゼロにする。
        baseDistance = 3.4;
        gravityBase = 0;
        gravityRange = 0;
        break;
      case "willow":
        // 大きな重力で下に尾を引かせる（枝垂れ）。
        angleRad = baseAngle + (random() - 0.5) * 0.3;
        gravityBase = 10;
        gravityRange = 6;
        break;
      case "kiku":
        // 菊：外向きの線の尾で描く前提なので、輪郭が乱れすぎないよう角度のジッターは控えめに。
        angleRad = baseAngle + (random() - 0.5) * 0.12;
        baseDistance = 2.8 + random() * 2.6;
        gravityBase = 1.5;
        gravityRange = 1.5;
        break;
      case "hachi":
        // 蜂：不規則な散らばり（見た目のチカチカ明滅はFireworkBurst.tsx側のmotionで付与）。
        angleRad = baseAngle + (random() - 0.5) * 0.6;
        baseDistance = 1.8 + random() * 1.6;
        gravityBase = 4;
        gravityRange = 3;
        break;
      default:
        // peony（牡丹）：均等な丸い広がり。
        angleRad = baseAngle + (random() - 0.5) * 0.3;
        break;
    }

    const distance = baseDistance * scale;
    return {
      id,
      angleRad,
      speed: distance / FIREWORK_PARTICLE_DURATION_SECONDS,
      gravity: (gravityBase + random() * gravityRange) * scale,
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
