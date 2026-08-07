import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import { createSakuraPetals, createSeededSakuraRandom, type SakuraPetal } from "./sakura";
import { ParticleField, type ParticleSpec } from "./ParticleField";
import { fallMotion, type FallMotionParams } from "./motionProfile";

export interface SakuraBurstProps {
  /** 花びらの色。省略時は淡いピンク（季節色は theme に依らずここで既定を持つ）。 */
  color?: string;
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
}

const DEFAULT_SAKURA_COLOR = "#f4b6c2";

function toParticleSpec(petal: SakuraPetal, color: string): ParticleSpec<FallMotionParams> {
  return {
    motion: fallMotion,
    params: {
      fallSpeed: petal.fallSpeed,
      startX: petal.startX,
      swayAmplitude: petal.swayAmplitude,
      durationSeconds: petal.durationSeconds,
    },
    durationSeconds: petal.durationSeconds,
    delaySeconds: petal.delaySeconds,
    render: (
      <span
        data-sakura-petal=""
        className="celebrate-sakura-petal"
        style={{ width: `${petal.size}rem`, height: `${petal.size}rem`, backgroundColor: color } as CSSProperties}
      />
    ),
  };
}

/** 上から舞い落ちる桜の花びら（ワンショット）。実体は ParticleField + fallMotion のプリセット。 */
export function SakuraBurst({ color = DEFAULT_SAKURA_COLOR, className, seed }: SakuraBurstProps) {
  const [petals] = useState<readonly SakuraPetal[]>(() =>
    createSakuraPetals(seed === undefined ? Math.random : createSeededSakuraRandom(seed))
  );

  return (
    <span aria-hidden="true" data-sakura-burst="" className={clsx("celebrate-sakura-burst", className)}>
      <ParticleField particles={petals.map((p) => toParticleSpec(p, color))} />
    </span>
  );
}
