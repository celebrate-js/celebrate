import { useState, type CSSProperties } from "react";
import { clsx } from "./clsx";
import { createSeededShatterRandom, createShatterScene, type ShatterScene } from "./shatter";
import { StrokePath } from "./StrokePath";

export interface ShatterScreenProps {
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
}

/**
 * 画面ひび割れ崩壊（⑤段階エフェクト）。①ヒビが入る→②広がる→③バキバキ（シェイク）→
 * ④破片が崩れ落ちる、の4局面を1回の発火にまとめてある。`rain` / `lightning` と同じく
 * 実体を持つ全画面コンテンツなので、CelebrateProvider が変換されていない入れ物へ
 * そのまま描画する（isFullScreenContent("shatter") が true）。
 */
export function ShatterScreen({ className, seed }: ShatterScreenProps) {
  const [scene] = useState<ShatterScene>(() =>
    createShatterScene(seed === undefined ? Math.random : createSeededShatterRandom(seed))
  );

  return (
    <span aria-hidden="true" data-shatter-screen="" className={clsx("celebrate-shatter", className)}>
      <span className="celebrate-shatter-shake-layer">
        <StrokePath
          lines={scene.cracks.map((crack) => ({
            points: crack.points,
            strokeWidth: 0.5,
            dashLength: 160,
            color: "rgba(255, 255, 255, 0.92)",
            glow: "soft",
            durationMs: 280,
            delayMs: parseFloat(crack.delay) * 1000,
          }))}
        />
        {scene.shards.map((shard) => (
          <span
            key={shard.id}
            data-shatter-shard=""
            className="celebrate-shatter-shard"
            style={
              {
                clipPath: shard.clipPath,
                "--celebrate-shatter-fall-x": shard.fallX,
                "--celebrate-shatter-fall-y": shard.fallY,
                "--celebrate-shatter-rotate": shard.rotate,
                animationDelay: shard.delay,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </span>
  );
}
