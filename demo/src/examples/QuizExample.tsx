import { useState } from "react";
import { useCelebrate } from "../../../src/react";
import { ExamplePageLayout } from "./ExamplePageLayout";

interface Question {
  text: string;
  choices: readonly string[];
  correctIndex: number;
}

const QUESTIONS: readonly Question[] = [
  { text: "1 + 1 は？", choices: ["1", "2", "3", "11"], correctIndex: 1 },
  { text: "日本の首都は？", choices: ["大阪", "京都", "東京", "名古屋"], correctIndex: 2 },
  { text: "1週間は何日？", choices: ["5日", "6日", "7日", "8日"], correctIndex: 2 },
  { text: "水の化学式は？", choices: ["CO2", "H2O", "O2", "NaCl"], correctIndex: 1 },
  { text: "赤・青・黄はまとめて何と呼ぶ？", choices: ["寒色", "三原色", "補色", "単色"], correctIndex: 1 },
];

// この数だけ連続正解すると、通常のstampより一段上のrecord演出に切り替える。
const STREAK_CELEBRATION_THRESHOLD = 3;

type AnswerState = "unanswered" | "correct" | "wrong";

/** 正解時に演出を出すクイズの実装例。連続正解（streak）でrecordに切り替わる。 */
export function QuizExample() {
  const celebrate = useCelebrate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  const question = QUESTIONS[questionIndex];
  const isFinished = questionIndex >= QUESTIONS.length;

  const handleAnswer = (choiceIndex: number, buttonEl: HTMLButtonElement) => {
    if (!question || answerState !== "unanswered") return;
    const isCorrect = choiceIndex === question.correctIndex;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 1);
      setAnswerState("correct");
      if (nextStreak >= STREAK_CELEBRATION_THRESHOLD) {
        // 連続正解が閾値に達したら、いつものstampではなく一段上のrecordを画面中央に出す
        // （これは「クリックした場所」ではなく「達成そのもの」を祝う演出なのでanchorしない）。
        celebrate("record", { text: "連続正解！", note: `${nextStreak}問れんぞく`, with: ["confetti"] });
      } else {
        // クリックした選択肢のすぐ上で演出が起きるようanchorする。中央に薄く出るだけだと
        // 「操作と反応が繋がっている」感が弱く、クリックした本人には効果が実感しづらい。
        celebrate("stamp", { text: "正解", with: ["sparkle"], anchor: { current: buttonEl } });
      }
    } else {
      setStreak(0);
      setAnswerState("wrong");
      // 不正解には「できた」演出とは違う、失敗を示す軽いフィードバックを返す
      // （画面全体を揺らす。音は鳴らさず振動だけ）。
      celebrate("shake");
    }
  };

  const goNext = () => {
    setAnswerState("unanswered");
    setQuestionIndex((i) => i + 1);
  };

  const restart = () => {
    setQuestionIndex(0);
    setAnswerState("unanswered");
    setStreak(0);
    setScore(0);
  };

  return (
    <ExamplePageLayout
      icon="📝"
      title="クイズ"
      description={`正解すると celebrate("stamp", { with: ["sparkle"], anchor }) がクリックした選択肢の上で起きる（画面中央に薄く出すだけだと操作との繋がりが弱いので、anchorでクリック位置に紐付ける）。${STREAK_CELEBRATION_THRESHOLD}問連続正解すると celebrate("record", { with: ["confetti"] }) に切り替わる（これは画面中央）。不正解には celebrate("shake") で画面を揺らすフィードバックを返す。テキストで「正解！」と重ねて言わず、演出そのものと選択肢の色分けだけで結果を伝えるのがポイント。`}
    >
      <section className="doc-section">
        {!isFinished && question && (
          <>
            <p className="quiz-progress">
              第{questionIndex + 1}問 / {QUESTIONS.length}問（現在{streak}連続正解）
            </p>
            <p className="quiz-question">{question.text}</p>
            <div className="quiz-choices">
              {question.choices.map((choice, i) => (
                <button
                  key={choice}
                  className="quiz-choice-button"
                  onClick={(e) => handleAnswer(i, e.currentTarget)}
                  disabled={answerState !== "unanswered"}
                  data-state={
                    answerState === "unanswered" ? undefined : i === question.correctIndex ? "correct" : "neutral"
                  }
                >
                  {choice}
                </button>
              ))}
            </div>
            {answerState !== "unanswered" && (
              <div className="quiz-feedback">
                {/* 正誤はcelebrate()の演出（stamp+sparkle／shake）と選択肢の色分けで伝わるため、
                    「正解！」のような重複するテキストは出さない。効果そのものが結果を語る。 */}
                <button className="combo-button" onClick={goNext}>
                  次の問題へ
                </button>
              </div>
            )}
          </>
        )}
        {isFinished && (
          <div className="quiz-feedback">
            <p className="quiz-question">
              終了！ {QUESTIONS.length}問中{score}問正解でした。
            </p>
            <button className="combo-button" onClick={restart}>
              もう一度挑戦する
            </button>
          </div>
        )}
      </section>
    </ExamplePageLayout>
  );
}
