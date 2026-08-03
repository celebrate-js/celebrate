import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { clsx } from "./clsx";
import type { MotionProfile, ParticleState } from "./motionProfile";

// 拡張可能なParticleエンジンの核。
//
// これまでの各variantは「見た目（render）」と「動き（motion）」が同じコンポーネントに
// ベタ書きされていた。ここでは両方とも呼び出し側が差し替えられる関数として受け取る：
//   - motion: 型さえ満たせば MOTION_PROFILES にない自作の動きを渡せる
//   - render: 決まったshapeしか描けなかった従来と違い、任意の ReactNode（画像・アイコン・
//     ゲームキャラのスプライトなど）を渡せる（"あるコンポーネントを使ったエフェクト"に対応）
// 新しい軸が今後も見つかり続ける前提で、コア（このファイル）を変更せずに
// 拡張できることを優先した設計。

export interface ParticleSpec<P = unknown> {
  motion: MotionProfile<P>;
  params: P;
  durationSeconds: number;
  delaySeconds?: number;
  /**
   * 見た目。省略時は `defaultRender` を使う。ReactNode を直接渡してもいいし
   * （毎回同じ見た目でよい場合）、状態（scale/opacityなど）に応じて変えたいなら
   * 関数で渡す。
   */
  render?: ReactNode | ((state: ParticleState) => ReactNode);
}

export interface ParticleFieldProps {
  // 粒子ごとに異なる P（パラメータの型）を持てるよう、配列要素は any で受ける
  // （呼び出し側の `ParticleSpec<SpiralParams>` のような具体型はそのまま書ける）。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  particles: readonly ParticleSpec<any>[];
  /** `particles[i].render` を省略した粒子に使う既定の見た目。 */
  defaultRender?: (state: ParticleState) => ReactNode;
  className?: string;
}

function resolveRender(
  spec: ParticleSpec,
  state: ParticleState,
  defaultRender?: (state: ParticleState) => ReactNode
): ReactNode {
  if (spec.render === undefined) return defaultRender?.(state) ?? null;
  return typeof spec.render === "function" ? spec.render(state) : spec.render;
}

function applyState(el: HTMLElement, state: ParticleState): void {
  el.style.transform = `translate(-50%, -50%) translate(${state.x}rem, ${state.y}rem) scale(${state.scale}) rotate(${state.rotate}deg)`;
  el.style.opacity = String(Math.max(0, Math.min(1, state.opacity)));
}

/**
 * rAFで毎フレーム `motion(elapsedSeconds, params)` を評価し、DOM要素に直接
 * transform/opacityを書き込む（Reactの再レンダーを経由しないので粒子数が
 * 増えても軽い）。見た目が変わる粒子（例：`render`が状態依存）は
 * `needsReactRender` を立てて、その粒子だけ通常のReact stateで再描画する。
 */
export function ParticleField({ particles, defaultRender, className }: ParticleFieldProps) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  // 呼び出し側が`particles`を毎レンダー新しい配列リテラルとして渡すのはごく普通の書き方
  // （<ParticleField particles={items.map(...)} />）。それを effect の依存配列に入れると、
  // 無関係な親の再レンダーのたびに参照が変わって startTime がリセットされ、
  // アニメーションが先頭に巻き戻ってしまう。ref で最新の値だけ差し替え、
  // rAFループ自体はマウント時に1回だけ開始する（再発火させたい場合は呼び出し側が
  // `key`を変えて再マウントさせる、というのが既存のTier3の使い方と一貫する）。
  const particlesRef = useRef(particles);
  particlesRef.current = particles;

  useEffect(() => {
    // ParticleFieldはCSSではなくJSでtransform/opacityを直接書き込むため、
    // 他のCSS駆動の演出のように `@media (prefers-reduced-motion: reduce)` では
    // 効かない（インラインstyleの方が優先される）。ここでJS側で同じ方針
    // （動きを完全に消すのではなく、移動をやめて短いフェードだけ残す）を踏襲する。
    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    const REDUCED_FADE_SECONDS = 0.15;

    // startTimeは「effectが走った時刻」ではなく「最初のrAFコールバックが実際に
    // 呼ばれた時刻」を基準にする。バックグラウンドタブ等で最初のrAFが大きく遅延すると
    // （体感1フレームでも実時間は数秒経っていることがある）、effect実行時刻を基準にした
    // 場合はここでelapsedが最初のtickの時点で既にdurationSecondsを超えてしまい、
    // 1回も可視状態を描画しないまま「終了」してしまう（見えないまま消える不具合）。
    let startTime: number | null = null;
    let frameId: number;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsedSinceStart = now - startTime;
      let stillActive = false;

      particlesRef.current.forEach((spec, i) => {
        const el = refs.current[i];
        if (!el) return;
        const elapsed = elapsedSinceStart / 1000 - (spec.delaySeconds ?? 0);
        if (elapsed < 0) {
          el.style.opacity = "0";
          stillActive = true;
          return;
        }

        if (prefersReducedMotion) {
          const fadeDuration = Math.min(REDUCED_FADE_SECONDS, spec.durationSeconds);
          if (elapsed > fadeDuration) {
            el.style.opacity = "0";
            return;
          }
          stillActive = true;
          el.style.transform = "translate(-50%, -50%)";
          el.style.opacity = String(1 - elapsed / fadeDuration);
          return;
        }

        if (elapsed > spec.durationSeconds) {
          el.style.opacity = "0";
          return;
        }
        stillActive = true;
        applyState(el, spec.motion(elapsed, spec.params));
      });

      if (stillActive) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
    // `render` が状態に応じて中身を変える関数の場合でも、見た目（テキスト/アイコン）は
    // マウント時に一度だけ解決する（transformはDOM直操作で毎フレーム動くが、中身の
    // 差し替えはReact再レンダーが要るため、今のv1では"動きは軽量・中身は静的"を優先）。
  }, []);

  return (
    <span aria-hidden="true" data-particle-field="" className={clsx("celebrate-anchor", className)}>
      {particles.map((spec, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="celebrate-particle-field-item"
          style={{ opacity: 0 } as CSSProperties}
        >
          {resolveRender(spec, spec.motion(0, spec.params), defaultRender)}
        </span>
      ))}
    </span>
  );
}

export type { MotionProfile, ParticleState } from "./motionProfile";
export type { RefObject };
