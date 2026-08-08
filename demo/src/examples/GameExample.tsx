import { useEffect, useRef, useState } from "react";
import { useCelebrate } from "../../../src/react";
import { ExamplePageLayout } from "./ExamplePageLayout";
import { useT } from "../i18n";

const GAME_DURATION_SECONDS = 15;
const TARGET_LIFETIME_MS = 1100;
const FIREWORK_MILESTONE = 5;

const GAME_TEXT = {
  ja: {
    title: "ミニゲーム",
    description: (durationSeconds: number, milestone: number) =>
      `制限時間${durationSeconds}秒でターゲットをクリック。1ヒットごとに celebrate("pop", { anchor, scale }) の軽い演出（コンボが続くほど大きくなる）、${milestone}点ごとに celebrate("firework") のボーナス演出、終了時に celebrate("record") で結果を表示する。`,
    score: "スコア",
    combo: "コンボ",
    timeLeft: "残り",
    seconds: "秒",
    target: "ターゲット",
    start: "🎯 スタート",
    retry: "🔄 もう一度",
    gameOver: "ゲーム終了！",
    scoreNote: (score: number) => `スコア ${score}`,
  },
  en: {
    title: "Mini game",
    description: (durationSeconds: number, milestone: number) =>
      `Click the targets within ${durationSeconds} seconds. Each hit fires a light celebrate("pop", { anchor, scale }) effect (bigger the longer your combo runs), every ${milestone} points fires a celebrate("firework") bonus, and celebrate("record") shows the result at the end.`,
    score: "Score",
    combo: "Combo",
    timeLeft: "Time left",
    seconds: "s",
    target: "Target",
    start: "🎯 Start",
    retry: "🔄 Try again",
    gameOver: "Game over!",
    scoreNote: (score: number) => `Score ${score}`,
  },
};

interface TargetPosition {
  id: number;
  leftPercent: number;
  topPercent: number;
}

function randomPosition(id: number): TargetPosition {
  return {
    id,
    leftPercent: 10 + Math.random() * 80,
    topPercent: 10 + Math.random() * 70,
  };
}

type GameStatus = "idle" | "playing" | "finished";

/** ヒットで軽い演出、スコア到達で派手な演出が出るミニゲームの実装例。 */
export function GameExample() {
  const celebrate = useCelebrate();
  const t = useT(GAME_TEXT);
  const targetRef = useRef<HTMLButtonElement | null>(null);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);
  const timeoutIds = useRef<number[]>([]);
  const nextTargetId = useRef(0);

  const [status, setStatus] = useState<GameStatus>("idle");
  const [secondsLeft, setSecondsLeft] = useState(GAME_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [target, setTarget] = useState<TargetPosition | null>(null);

  const clearAllTimeouts = () => {
    timeoutIds.current.forEach((id) => window.clearTimeout(id));
    timeoutIds.current = [];
  };

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];
    };
  }, []);

  const spawnTarget = () => {
    const position = randomPosition(nextTargetId.current++);
    setTarget(position);
    const id = window.setTimeout(() => {
      // 制限時間内にクリックされなければミス扱いでコンボが切れ、次のターゲットへ。
      setCombo(0);
      spawnTarget();
    }, TARGET_LIFETIME_MS);
    timeoutIds.current.push(id);
  };

  const startGame = () => {
    clearAllTimeouts();
    setScore(0);
    setCombo(0);
    setSecondsLeft(GAME_DURATION_SECONDS);
    setStatus("playing");
    spawnTarget();

    const tick = () => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearAllTimeouts();
          setStatus("finished");
          setTarget(null);
          return 0;
        }
        const id = window.setTimeout(tick, 1000);
        timeoutIds.current.push(id);
        return prev - 1;
      });
    };
    const firstTickId = window.setTimeout(tick, 1000);
    timeoutIds.current.push(firstTickId);
  };

  // ゲーム終了時、スコアに応じて〆の演出を1回だけ出す。
  useEffect(() => {
    if (status !== "finished") return;
    celebrate("record", {
      text: t.gameOver,
      note: t.scoreNote(score),
      with: score >= FIREWORK_MILESTONE ? ["confetti"] : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const hitTarget = () => {
    if (status !== "playing" || !target) return;
    clearAllTimeouts();
    const nextScore = score + 1;
    const nextCombo = combo + 1;
    setScore(nextScore);
    setCombo(nextCombo);

    // コンボが続くほど軽い演出のscaleを大きくして「乗ってきた」感を出す。
    celebrate("pop", { anchor: { current: targetRef.current }, scale: 1 + Math.min(nextCombo, 5) * 0.15 });

    if (nextScore % FIREWORK_MILESTONE === 0) {
      celebrate("firework", { anchor: { current: gameAreaRef.current } });
    }

    setTarget(null);
    const id = window.setTimeout(spawnTarget, 150);
    timeoutIds.current.push(id);
  };

  return (
    <ExamplePageLayout icon="🎯" title={t.title} description={t.description(GAME_DURATION_SECONDS, FIREWORK_MILESTONE)}>
      <section className="doc-section">
        <div className="game-stats">
          <span>
            {t.score}: {score}
          </span>
          <span>
            {t.combo}: {combo}
          </span>
          <span>
            {t.timeLeft}: {secondsLeft}
            {t.seconds}
          </span>
        </div>
        <div ref={gameAreaRef} className="game-area">
          {status === "playing" && target && (
            <button
              key={target.id}
              ref={targetRef}
              className="game-target"
              style={{ left: `${target.leftPercent}%`, top: `${target.topPercent}%` }}
              onClick={hitTarget}
              aria-label={t.target}
            />
          )}
          {status !== "playing" && (
            <div className="game-overlay">
              <button className="combo-button" onClick={startGame}>
                {status === "idle" ? t.start : t.retry}
              </button>
            </div>
          )}
        </div>
      </section>
    </ExamplePageLayout>
  );
}
