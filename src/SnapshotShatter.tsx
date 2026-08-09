import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { clsx } from "./clsx";
import {
  createSeededSnapshotShatterRandom,
  createSnapshotShatterScene,
  SNAPSHOT_SHATTER_DURATION_MS,
  type SnapshotShatterScene,
} from "./snapshotShatterScene";

/** Canvasまたは画像は、ブラウザ標準APIだけで画素単位のスナップショットを取得できる。 */
export type SnapshotShatterSource = HTMLCanvasElement | HTMLImageElement;

export interface SnapshotShatterProps {
  /** 割る対象。任意DOMの撮影は意図的に担わず、Canvasまたは画像に限定する。 */
  sourceRef: RefObject<SnapshotShatterSource | null>;
  className?: string;
  /** 再現可能なテスト・デモ用。 */
  seed?: number;
  /** 破片が消えるまでの長さ。既定は1150ms。 */
  durationMs?: number;
  /** 横方向のメッシュ分割数。画面全体では6〜8程度が目安。 */
  columns?: number;
  /** 縦方向のメッシュ分割数。画面全体では4〜6程度が目安。 */
  rows?: number;
  /** 終了時に呼ばれる。通常はここでコンポーネントをunmountする。 */
  onComplete?: () => void;
}

interface CapturedSnapshot {
  bitmap: HTMLCanvasElement;
  scene: SnapshotShatterScene;
  width: number;
  height: number;
  left: number;
  top: number;
  source: SnapshotShatterSource;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function easeOutCubic(value: number): number {
  return 1 - (1 - value) ** 3;
}

function drawSnapshot(
  context: CanvasRenderingContext2D,
  bitmap: HTMLCanvasElement,
  width: number,
  height: number
): void {
  context.drawImage(bitmap, 0, 0, width, height);
}

function drawCracks(context: CanvasRenderingContext2D, scene: SnapshotShatterScene, progress: number): void {
  const reveal = clamp(progress / 0.24);
  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const crack of scene.cracks) {
    const local = clamp((reveal - crack.delay) / 0.45);
    if (local === 0) continue;
    const visibleSegments = Math.max(1, Math.ceil((crack.points.length - 1) * local));
    context.beginPath();
    context.moveTo(crack.points[0]!.x, crack.points[0]!.y);
    for (let pointIndex = 1; pointIndex <= visibleSegments; pointIndex++) {
      const point = crack.points[pointIndex]!;
      context.lineTo(point.x, point.y);
    }
    context.strokeStyle = "rgba(8, 12, 24, 0.48)";
    context.lineWidth = 2.2;
    context.stroke();
    context.strokeStyle = "rgba(255, 255, 255, 0.78)";
    context.lineWidth = 0.75;
    context.stroke();
  }
  context.restore();
}

function drawShards(
  context: CanvasRenderingContext2D,
  bitmap: HTMLCanvasElement,
  scene: SnapshotShatterScene,
  width: number,
  height: number,
  progress: number
): void {
  const shatterProgress = clamp((progress - 0.22) / 0.78);
  for (const shard of scene.shards) {
    const local = clamp((shatterProgress - shard.delay) / (1 - shard.delay));
    const eased = easeOutCubic(local);
    const opacity = 1 - clamp((local - 0.68) / 0.32);
    const dropY = shard.fallY * (0.22 * eased + 0.78 * eased * eased);
    context.save();
    context.globalAlpha = opacity;
    context.translate(shard.center.x + shard.fallX * eased, shard.center.y + dropY);
    context.rotate((shard.rotateDeg * eased * Math.PI) / 180);
    context.translate(-shard.center.x, -shard.center.y);
    context.beginPath();
    context.moveTo(shard.points[0]!.x, shard.points[0]!.y);
    context.lineTo(shard.points[1]!.x, shard.points[1]!.y);
    context.lineTo(shard.points[2]!.x, shard.points[2]!.y);
    context.closePath();
    context.clip();
    context.drawImage(bitmap, 0, 0, width, height);
    context.restore();
  }
}

/**
 * Canvas/画像を一度だけ撮影し、その画素そのものを三角形の破片として崩すTier 3プリミティブ。
 * 任意DOMのスクリーンショットは正確性・CORS・依存サイズの問題があるため、ここでは扱わない。
 */
export function SnapshotShatter({
  sourceRef,
  className,
  seed,
  durationMs = SNAPSHOT_SHATTER_DURATION_MS,
  columns,
  rows,
  onComplete,
}: SnapshotShatterProps) {
  const [capture, setCapture] = useState<CapturedSnapshot | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // React Strict Mode は開発時にlayout effectを再実行する。撮影準備を二度走らせると、
  // 同じスナップショットからCanvasとrAFの系統が二重に生まれ、「一回のshatterが二回割れる」
  // 見た目になるため、同じ入力の初期化は一度だけにする。
  const initializedCapture = useRef<{
    source: SnapshotShatterSource;
    seed: number | undefined;
    columns: number | undefined;
    rows: number | undefined;
  } | null>(null);

  useLayoutEffect(() => {
    const source = sourceRef.current;
    if (!source) return;
    if (source instanceof HTMLImageElement && (!source.complete || source.naturalWidth === 0)) return;

    const previous = initializedCapture.current;
    if (
      previous?.source === source &&
      previous.seed === seed &&
      previous.columns === columns &&
      previous.rows === rows
    ) {
      return;
    }

    const rect = source.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const pixelRatio = window.devicePixelRatio || 1;
    const bitmap = document.createElement("canvas");
    bitmap.width = Math.ceil(rect.width * pixelRatio);
    bitmap.height = Math.ceil(rect.height * pixelRatio);
    const bitmapContext = bitmap.getContext("2d");
    if (!bitmapContext) return;
    bitmapContext.drawImage(source, 0, 0, bitmap.width, bitmap.height);
    bitmapContext.scale(pixelRatio, pixelRatio);

    initializedCapture.current = { source, seed, columns, rows };
    setCapture({
      bitmap,
      scene: createSnapshotShatterScene(
        rect.width,
        rect.height,
        seed === undefined ? Math.random : createSeededSnapshotShatterRandom(seed),
        columns,
        rows
      ),
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      source,
    });
  }, [columns, rows, seed, sourceRef]);

  useEffect(() => {
    if (!capture || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.ceil(capture.width * pixelRatio);
    canvas.height = Math.ceil(capture.height * pixelRatio);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    const previousVisibility = capture.source.style.visibility;
    if (!reducedMotion) capture.source.style.visibility = "hidden";
    let frameId = 0;
    let startTime: number | null = null;
    let finished = false;

    const restoreSource = () => {
      capture.source.style.visibility = previousVisibility;
    };

    const complete = () => {
      if (finished) return;
      finished = true;
      restoreSource();
      onComplete?.();
    };

    const frame = (now: number) => {
      if (startTime === null) startTime = now;
      const progress = clamp((now - startTime) / durationMs);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, capture.width, capture.height);

      if (reducedMotion) {
        drawSnapshot(context, capture.bitmap, capture.width, capture.height);
        context.fillStyle = `rgba(255, 255, 255, ${0.35 * (1 - progress)})`;
        context.fillRect(0, 0, capture.width, capture.height);
      } else {
        drawShards(context, capture.bitmap, capture.scene, capture.width, capture.height, progress);
        if (progress < 0.42) drawCracks(context, capture.scene, progress);
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(frame);
      } else {
        complete();
      }
    };

    frameId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(frameId);
      // Strict Modeの開発用cleanupや親側のunmountでは、sourceだけ確実に戻す。
      // ここでonCompleteまで呼ぶと、開発時は最初のeffect cleanupで即unmountしてしまう。
      restoreSource();
    };
  }, [capture, durationMs, onComplete]);

  if (!capture) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={clsx("celebrate-snapshot-shatter", className)}
      style={
        {
          position: "fixed",
          zIndex: 2147483647,
          pointerEvents: "none",
          left: capture.left,
          top: capture.top,
          width: capture.width,
          height: capture.height,
        } as CSSProperties
      }
    />
  );
}
