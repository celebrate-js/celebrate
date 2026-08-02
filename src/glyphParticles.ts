import { createSeededRandom, type RandomFn } from "./random";

// heart / star / emoji のような「文字・絵文字を撒く」variant 共通の粒データ生成。
// 色付き矩形（confetti）や幾何学粒（sparkle）と違い、文字そのものを粒として使う。

export interface GlyphParticle {
  id: number;
  glyph: string;
  x: string;
  y: string;
  rotate: string;
  size: string;
  delay: string;
}

export const GLYPH_BURST_PARTICLE_COUNT = 8;
export const GLYPH_BURST_DURATION_MS = 900;

export { createSeededRandom };
export type { RandomFn };

/** 中心から上寄りに散らして消える文字粒（heart/star/emoji で共有）。 */
export function createGlyphParticles(
  glyphs: readonly string[],
  count: number = GLYPH_BURST_PARTICLE_COUNT,
  random: RandomFn = Math.random
): readonly GlyphParticle[] {
  return Array.from({ length: count }, (_, id) => {
    const angle = (Math.PI * 2 * id) / count + (random() - 0.5) * 0.3;
    const distance = 2.2 + random() * 2.4;
    return {
      id,
      glyph: glyphs[Math.floor(random() * glyphs.length)] ?? glyphs[0] ?? "",
      x: `${(Math.cos(angle) * distance).toFixed(3)}rem`,
      // 上寄りに散らすことで「湧き上がる」感を出す（円対称ではなく上半分寄り）。
      y: `${(Math.sin(angle) * distance - 1.4).toFixed(3)}rem`,
      rotate: `${Math.round(random() * 60 - 30)}deg`,
      size: `${(1 + random() * 0.6).toFixed(3)}rem`,
      delay: `${(random() * 0.12).toFixed(3)}s`,
    };
  });
}
