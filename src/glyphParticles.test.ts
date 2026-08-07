import { describe, expect, it } from "vitest";
import { createGlyphParticles, createSeededRandom, GLYPH_BURST_PARTICLE_COUNT } from "./glyphParticles";

const GLYPHS = ["♥", "★", "✦"] as const;

describe("glyph particles", () => {
  it("既定個数を生成し、IDが一意になる", () => {
    const particles = createGlyphParticles(GLYPHS, undefined, createSeededRandom(1));
    expect(particles).toHaveLength(GLYPH_BURST_PARTICLE_COUNT);
    expect(new Set(particles.map((p) => p.id)).size).toBe(GLYPH_BURST_PARTICLE_COUNT);
  });

  it("countを指定すればその数だけ生成する", () => {
    const particles = createGlyphParticles(GLYPHS, 3, createSeededRandom(1));
    expect(particles).toHaveLength(3);
  });

  it("同じseedなら同じ散らばり方になる", () => {
    expect(createGlyphParticles(GLYPHS, undefined, createSeededRandom(3))).toEqual(
      createGlyphParticles(GLYPHS, undefined, createSeededRandom(3))
    );
  });

  it("glyphは渡した配列の中からだけ選ばれる", () => {
    const particles = createGlyphParticles(GLYPHS, 20, createSeededRandom(5));
    expect(particles.every((p) => GLYPHS.includes(p.glyph as (typeof GLYPHS)[number]))).toBe(true);
  });

  it("glyphsが空でも例外を投げず、空文字にフォールバックする", () => {
    const particles = createGlyphParticles([], 2, createSeededRandom(1));
    expect(particles.every((p) => p.glyph === "")).toBe(true);
  });

  it("x/y/rotate/size/delayは単位付きの文字列（rem/deg/s）で返る", () => {
    const [particle] = createGlyphParticles(GLYPHS, 1, createSeededRandom(2));
    expect(particle!.x).toMatch(/^-?[\d.]+rem$/);
    expect(particle!.y).toMatch(/^-?[\d.]+rem$/);
    expect(particle!.rotate).toMatch(/^-?\d+deg$/);
    expect(particle!.size).toMatch(/^[\d.]+rem$/);
    expect(particle!.delay).toMatch(/^[\d.]+s$/);
  });
});
