import { useState } from "react";
import { useCelebrate } from "../../../src/react";
import { ExamplePageLayout } from "./ExamplePageLayout";
import { useT } from "../i18n";

interface Question {
  text: string;
  choices: readonly string[];
  correctIndex: number;
}

const QUESTIONS_TEXT = {
  ja: [
    { text: "1 + 1 は？", choices: ["1", "2", "3", "11"], correctIndex: 1 },
    { text: "日本の首都は？", choices: ["大阪", "京都", "東京", "名古屋"], correctIndex: 2 },
    { text: "1週間は何日？", choices: ["5日", "6日", "7日", "8日"], correctIndex: 2 },
    { text: "水の化学式は？", choices: ["CO2", "H2O", "O2", "NaCl"], correctIndex: 1 },
    { text: "赤・青・黄はまとめて何と呼ぶ？", choices: ["寒色", "三原色", "補色", "単色"], correctIndex: 1 },
  ] satisfies Question[],
  en: [
    { text: "What is 1 + 1?", choices: ["1", "2", "3", "11"], correctIndex: 1 },
    { text: "What is the capital of Japan?", choices: ["Osaka", "Kyoto", "Tokyo", "Nagoya"], correctIndex: 2 },
    { text: "How many days are in a week?", choices: ["5", "6", "7", "8"], correctIndex: 2 },
    { text: "What is the chemical formula for water?", choices: ["CO2", "H2O", "O2", "NaCl"], correctIndex: 1 },
    {
      text: "What do red, blue, and yellow together make up?",
      choices: ["Cool colors", "The 3 primary colors", "Complementary colors", "Monochrome"],
      correctIndex: 1,
    },
  ] satisfies Question[],
};

// この数だけ連続正解すると、通常のstampより一段上のrecord演出に切り替える。
const STREAK_CELEBRATION_THRESHOLD = 3;

const QUIZ_TEXT = {
  ja: {
    title: "クイズ",
    description: (threshold: number) =>
      `正解すると celebrate("stamp", { with: ["sparkle"], anchor }) がクリックした選択肢の上で起きる（画面中央に薄く出すだけだと操作との繋がりが弱いので、anchorでクリック位置に紐付ける）。${threshold}問連続正解すると celebrate("record", { with: ["confetti"] }) に切り替わる（これは画面中央）。不正解には celebrate("shake") で画面を揺らすフィードバックを返す。テキストで「正解！」と重ねて言わず、演出そのものと選択肢の色分けだけで結果を伝えるのがポイント。`,
    progress: (current: number, total: number, streak: number) =>
      `第${current}問 / ${total}問（現在${streak}連続正解）`,
    nextQuestion: "次の問題へ",
    finished: (total: number, score: number) => `終了！ ${total}問中${score}問正解でした。`,
    retry: "もう一度挑戦する",
    streakText: "連続正解！",
    streakNote: (streak: number) => `${streak}問れんぞく`,
    correctText: "正解",
  },
  en: {
    title: "Quiz",
    description: (threshold: number) =>
      `A correct answer fires celebrate("stamp", { with: ["sparkle"], anchor }) right above the choice you clicked (anchor ties it to the click position, since a faint effect in the center wouldn't feel connected to your action). ${threshold} correct answers in a row switches to celebrate("record", { with: ["confetti"] }) instead (screen-centered). A wrong answer gets celebrate("shake") shaking the screen. The point: no redundant “Correct!” text — the effect itself, plus the choice coloring, is what tells you the result.`,
    progress: (current: number, total: number, streak: number) =>
      `Question ${current} / ${total} (current streak: ${streak})`,
    nextQuestion: "Next question",
    finished: (total: number, score: number) => `Done! You got ${score} out of ${total} correct.`,
    retry: "Try again",
    streakText: "Streak!",
    streakNote: (streak: number) => `${streak} in a row`,
    correctText: "Correct",
  },
};

type AnswerState = "unanswered" | "correct" | "wrong";

/** 正解時に演出を出すクイズの実装例。連続正解（streak）でrecordに切り替わる。 */
export function QuizExample() {
  const celebrate = useCelebrate();
  const t = useT(QUIZ_TEXT);
  const questions = useT(QUESTIONS_TEXT);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("unanswered");
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);

  const question = questions[questionIndex];
  const isFinished = questionIndex >= questions.length;

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
        celebrate("record", { text: t.streakText, note: t.streakNote(nextStreak), with: ["confetti"] });
      } else {
        // クリックした選択肢のすぐ上で演出が起きるようanchorする。中央に薄く出るだけだと
        // 「操作と反応が繋がっている」感が弱く、クリックした本人には効果が実感しづらい。
        celebrate("stamp", { text: t.correctText, with: ["sparkle"], anchor: { current: buttonEl } });
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
    <ExamplePageLayout icon="📝" title={t.title} description={t.description(STREAK_CELEBRATION_THRESHOLD)}>
      <section className="doc-section">
        {!isFinished && question && (
          <>
            <p className="quiz-progress">{t.progress(questionIndex + 1, questions.length, streak)}</p>
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
                  {t.nextQuestion}
                </button>
              </div>
            )}
          </>
        )}
        {isFinished && (
          <div className="quiz-feedback">
            <p className="quiz-question">{t.finished(questions.length, score)}</p>
            <button className="combo-button" onClick={restart}>
              {t.retry}
            </button>
          </div>
        )}
      </section>
    </ExamplePageLayout>
  );
}
