import type { CSSProperties, ReactNode } from "react";
import { clsx } from "./clsx";

// マスク・リビール構造テンプレート（軸I=clip-reveal）の最初の実装。
// これまでのRadialBurst（scale+opacity）/ParticleField（粒の集合）/StrokePath（線）とは
// 別の描画軸：「覆いをclip-pathで動かして中身を出し入れする」（緞帳ワイプ・スポットライトの
// 開閉など）。shatterの破片（画面サイズのclip-pathマスク要素）はこの軸に属するが、
// ParticleFieldの小粒モデルとは根本的に噛み合わないため今回の移行対象ではない
// （実装としては別物のまま。将来的にshatterをこちらへ移行する余地はある）。

export type ClipRevealEdge = "left" | "right" | "top" | "bottom" | "center";

export interface ClipRevealProps {
  /** どの方向へワイプするか。既定 "left"（左から覆いが晴れる）。 */
  edge?: ClipRevealEdge;
  /** "in"=覆いが晴れて中身が見える（既定）。"out"=覆いが閉じて中身を隠す（同じ経路の逆再生）。 */
  direction?: "in" | "out";
  durationMs?: number;
  delayMs?: number;
  /** カーテン自体の色。既定は黒。 */
  color?: string;
  /** カーテンの下に見える内容。省略時は単色のカーテンだけを描く。 */
  children?: ReactNode;
  className?: string;
}

/**
 * 覆いをclip-pathで動かして中身を出し入れするプリミティブ（軸I=clip-reveal）。
 *
 *   <ClipReveal edge="left" direction="in" color="#000">
 *     <img src="result.png" />
 *   </ClipReveal>
 */
export function ClipReveal({
  edge = "left",
  direction = "in",
  durationMs = 500,
  delayMs = 0,
  color = "#000",
  children,
  className,
}: ClipRevealProps) {
  return (
    <span
      aria-hidden="true"
      data-clip-reveal=""
      className={clsx(
        "celebrate-clip-reveal",
        `celebrate-clip-reveal--${edge}`,
        direction === "out" && "celebrate-clip-reveal--out",
        className
      )}
      style={
        {
          "--celebrate-clip-reveal-color": color,
          animationDuration: `${durationMs}ms`,
          animationDelay: `${delayMs}ms`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
