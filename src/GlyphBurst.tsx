import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import { createGlyphParticles, createSeededRandom, type GlyphParticle } from "./glyphParticles";

export interface GlyphBurstProps {
  /** 散らす文字・絵文字（粒ごとにランダム選択）。 */
  glyphs: readonly string[];
  /** 文字の色。省略時はブラウザ既定（絵文字は色指定を無視するため主に heart/star 用）。 */
  color?: string;
  count?: number;
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
}

/** 文字・絵文字を中心から撒く汎用バースト（heart/star/emoji が共有する実装）。 */
export function GlyphBurst({ glyphs, color, count, className, seed }: GlyphBurstProps) {
  const [particles] = useState<readonly GlyphParticle[]>(() =>
    createGlyphParticles(glyphs, count, seed === undefined ? Math.random : createSeededRandom(seed))
  );

  return (
    <span aria-hidden="true" data-glyph-burst="" className={clsx("celebrate-glyph-burst", className)}>
      {particles.map((particle) => (
        <span
          key={particle.id}
          data-glyph-particle=""
          className="celebrate-glyph-particle"
          style={
            {
              "--celebrate-glyph-x": particle.x,
              "--celebrate-glyph-y": particle.y,
              "--celebrate-glyph-rotate": particle.rotate,
              "--celebrate-glyph-size": particle.size,
              animationDelay: particle.delay,
              color,
            } as CSSProperties
          }
        >
          {particle.glyph}
        </span>
      ))}
    </span>
  );
}
