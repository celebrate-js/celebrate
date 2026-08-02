import { Children, isValidElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { clsx } from "./clsx";
import type { RadialLayer } from "./radialLayers";
import { DEFAULT_CELEBRATE_THEME, type CelebrateTheme } from "./theme";

/** 原点移動の経由点（スポットライトの掃引など。軸B「原点が経路上を移動」）。 */
export interface RadialOriginKeyframe {
  /** 0〜1（原点移動アニメーション全体に対する位置）。 */
  offset: number;
  /** 既定の中心位置からのオフセット（rem）。 */
  xRem: number;
  yRem: number;
}

export interface RadialBurstProps {
  /**
   * 描く輪の一覧をデータ（配列）で渡す方式。RADIAL_BURST_PRESETS のような
   * 「決まったプリセットをそのまま流し込む」場合はこちら。
   * `children` と両方渡した場合は `layers` が優先される。
   */
  layers?: readonly RadialLayer[];
  /**
   * 描く輪の一覧を <RadialBurstLayer/> の並びとして渡す方式。層ごとに独立した
   * JSX要素になるので、配列をハンドロールするより読みやすい（layersと等価、
   * どちらを使うかは好み）。
   *
   *   <RadialBurst>
   *     <RadialBurstLayer shape="outline" scaleFrom={0.3} scaleTo={2.4} size={2.4} delayMs={0} />
   *     <RadialBurstLayer shape="outline" scaleFrom={0.3} scaleTo={2.7} size={2.0} delayMs={140} />
   *   </RadialBurst>
   */
  children?: ReactNode;
  theme?: CelebrateTheme;
  className?: string;
  /** 見た目の大きさ倍率。既定1。各layerの`size`にだけ掛かる（scaleFrom/scaleToは相対的な伸縮率なので対象外）。 */
  scale?: number;
  /** 色の既定値を上書きする。layer自身が`color`を持つ場合はそちらが優先される。 */
  color?: string;
  /**
   * 原点（全layer共通の中心点）が経路上を移動する場合の経由点。2点以上でアニメーションする。
   * 省略時は原点固定（従来通り）。スポットライトの掃引などに使う。
   * CSS keyframesは実行時に決まる任意個の経由点を表現できないため、
   * Web Animations API（Element.animate）で駆動する（`borderGlow.ts`と同じ理由）。
   */
  origin?: readonly RadialOriginKeyframe[];
  /** 原点移動アニメーションの長さ。既定800ms。 */
  originDurationMs?: number;
}

/** <RadialBurst>の子として並べる、輪1つ分の設定。単体では何も描画しない（マーカー）。 */
export function RadialBurstLayer(_props: RadialLayer): null {
  return null;
}

function layersFromChildren(children: ReactNode): readonly RadialLayer[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === RadialBurstLayer) {
      return [child.props as RadialLayer];
    }
    return [];
  });
}

/**
 * 中心からscale＋opacityで広がって消える汎用プリミティブ。
 * pop/ripple/ring/flash は全てこれの見た目違い（RADIAL_BURST_PRESETS参照）。
 *
 *   <RadialBurst layers={[
 *     { shape: "outline", scaleFrom: 0.3, scaleTo: 2, size: 2 },
 *     { shape: "outline", scaleFrom: 0.3, scaleTo: 2.5, size: 1.5, delayMs: 150 },
 *   ]} />
 */
function originTransform(k: RadialOriginKeyframe): string {
  return `translate(${k.xRem}rem, ${k.yRem}rem)`;
}

export function RadialBurst({
  layers,
  children,
  theme = DEFAULT_CELEBRATE_THEME,
  className,
  scale = 1,
  color,
  origin,
  originDurationMs = 800,
}: RadialBurstProps) {
  const resolvedLayers = layers ?? layersFromChildren(children);
  const originRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = originRef.current;
    if (!el || !origin || origin.length < 2) return;
    const animation = el.animate(
      origin.map((k) => ({ offset: k.offset, transform: originTransform(k) })),
      { duration: originDurationMs, easing: "linear", fill: "forwards" }
    );
    return () => animation.cancel();
    // originの中身（配列参照）が呼び出しごとに変わっても、発火のたびにRadialBurst自体が
    // 新規マウントされる想定（celebrate()の使い方と同じ）なのでマウント時1回だけでよい。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span aria-hidden="true" data-radial-burst="" className={clsx("celebrate-anchor", className)}>
      <span
        ref={originRef}
        className="celebrate-radial-origin"
        style={origin && origin.length > 0 ? ({ transform: originTransform(origin[0]) } as CSSProperties) : undefined}
      >
        {resolvedLayers.map((layer, index) => (
          <span
            key={index}
            className={clsx("celebrate-radial", `celebrate-radial--${layer.shape}`)}
            style={
              {
                "--celebrate-radial-color": layer.color ?? color ?? theme.stampColor,
                "--celebrate-radial-scale-from": layer.scaleFrom,
                "--celebrate-radial-scale-to": layer.scaleTo,
                "--celebrate-radial-size": `${layer.size * scale}rem`,
                animationDelay: `${layer.delayMs ?? 0}ms`,
                animationDuration: `${layer.durationMs ?? 500}ms`,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </span>
  );
}
