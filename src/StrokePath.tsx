import type { CSSProperties } from "react";
import { clsx } from "./clsx";

// 「経路に沿って線を描き下ろす」構造テンプレート（軸D=stroke-reveal）。
// lightning（稲光）も shatter のヒビも、実装は stroke-dasharray/dashoffset を
// 0まで動かすという同じ仕組みで、違うのは経路データ・太さ・色・duration・
// グローの強さ（"electric"=稲光の多重グロー、"soft"=ヒビの淡いグロー）だけだった。
// RadialBurst の layers と同じ形（配列で複数本を1つの svg にまとめる）にしてある。

export interface StrokeLine {
  /**
   * 経路。`points`（SVG polyline の points 属性、直線区間のみ）と `d`（SVG path の d 属性、
   * 円弧など曲線も表現できる）のどちらか一方を指定する。例：checkmarkの丸は円弧なので
   * `d` を使う（lightning・shatterのヒビは直線区間の折れ線なので `points` のまま）。
   */
  points?: string;
  d?: string;
  strokeWidth: number;
  /** stroke-dasharray/dashoffset に使う値（経路のおおよその長さ）。 */
  dashLength: number;
  color?: string;
  opacity?: number;
  glow?: "soft" | "electric";
  durationMs: number;
  delayMs?: number;
}

export interface StrokePathProps {
  lines: readonly StrokeLine[];
  viewBox?: string;
  className?: string;
}

export function StrokePath({ lines, viewBox = "0 0 100 100", className }: StrokePathProps) {
  return (
    <svg viewBox={viewBox} preserveAspectRatio="none" className={clsx("celebrate-stroke-path-svg", className)}>
      {lines.map((line, index) => {
        const className = clsx(
          "celebrate-stroke-path",
          line.glow === "electric" && "celebrate-stroke-path--glow-electric",
          line.glow === "soft" && "celebrate-stroke-path--glow-soft"
        );
        const style = {
          "--celebrate-stroke-color": line.color ?? "#fff",
          "--celebrate-stroke-width": line.strokeWidth,
          "--celebrate-stroke-dash": line.dashLength,
          "--celebrate-stroke-opacity": line.opacity ?? 1,
          "--celebrate-stroke-duration": `${line.durationMs}ms`,
          "--celebrate-stroke-delay": `${line.delayMs ?? 0}ms`,
        } as CSSProperties;
        return line.d !== undefined ? (
          <path key={index} d={line.d} className={className} style={style} />
        ) : (
          <polyline key={index} points={line.points} className={className} style={style} />
        );
      })}
    </svg>
  );
}
