import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { clsx } from "./clsx";
import { SnapshotShatter } from "./SnapshotShatter";

export interface ShatterScreenProps {
  className?: string;
  /** 再現可能な破片メッシュを使うテスト・デモ用。 */
  seed?: number;
}

/**
 * 現在のviewportを一度だけCanvasへ撮影し、撮影した画素を画面全体で割る。
 * 画面の内容を直接崩すため、ひびの上に抽象的な板を重ねるだけの演出にはしない。
 */
export function ShatterScreen({ className, seed }: ShatterScreenProps) {
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const [captured, setCaptured] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const captureViewport = async () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const image = await html2canvas(document.body, {
        backgroundColor: null,
        logging: false,
        useCORS: true,
        x: window.scrollX,
        y: window.scrollY,
        width,
        height,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
      });
      if (cancelled || !sourceRef.current) return;

      const source = sourceRef.current;
      source.width = image.width;
      source.height = image.height;
      const context = source.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0);
      setCompleted(false);
      setCaptured(true);
    };

    void captureViewport();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!captured || completed) return;
    // SnapshotShatterのCanvasはCelebrateProviderのportal（body直下）に残し、アプリ本体だけを
    // 一時的に隠す。これをしないと、動いた破片の下から元のDOMが見えて「割れていない」ように見える。
    const roots = [...document.body.children].filter(
      (element) => !element.classList.contains("celebrate-overlay-root")
    ) as HTMLElement[];
    const previousVisibilities = roots.map((element) => element.style.visibility);
    roots.forEach((element) => {
      element.style.visibility = "hidden";
    });
    return () => {
      roots.forEach((element, index) => {
        element.style.visibility = previousVisibilities[index]!;
      });
    };
  }, [captured, completed]);

  return (
    <span aria-hidden="true" data-shatter-screen="" className={clsx("celebrate-shatter", className)}>
      <canvas ref={sourceRef} className="celebrate-shatter-snapshot-source" />
      {captured && (
        <SnapshotShatter
          sourceRef={sourceRef}
          seed={seed}
          columns={8}
          rows={6}
          durationMs={2200}
          onComplete={() => setCompleted(true)}
        />
      )}
    </span>
  );
}
