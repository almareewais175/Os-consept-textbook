import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { QuizQuestion, QuizProgress } from '../types/os';

interface QuizSectionProps {
  chapterId: string;
  chapterTitle: string;
  questions: QuizQuestion[];
  savedState?: QuizProgress[string];
  onSaveProgress: (chapterId: string, state: QuizProgress[string]) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  chapterId,
  chapterTitle,
  questions,
  savedState,
  onSaveProgress,
}) => {
  const [answers, setAnswers] = useState<{ [qId: string]: number }>(savedState?.answers || {});
  const [submitted, setSubmitted] = useState<boolean>(savedState?.submitted || false);

  useEffect(() => {
    setAnswers(savedState?.answers || {});
    setSubmitted(savedState?.submitted || false);
  }, [chapterId, savedState]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const score = questions.reduce(
    (acc, q) => (answers[q.id] === q.correctIndex ? acc + 1 : acc),
    0
  );

  const handleSelect = (qId: string, optionIdx: number) => {
    if (submitted) return;
    const nextAnswers = { ...answers, [qId]: optionIdx };
    setAnswers(nextAnswers);
    onSaveProgress(chapterId, {
      answers: nextAnswers,
      submitted: false,
      score: 0,
      total: questions.length,
    });
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    onSaveProgress(chapterId, {
      answers,
      submitted: true,
      score,
      total: questions.length,
    });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    onSaveProgress(chapterId, {
      answers: {},
      submitted: false,
      score: 0,
      total: questions.length,
    });
  };

  return (
    <section id="chapter-quiz" className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs font-medium text-slate-500">Knowledge Check · {chapterTitle}</p>
          <h3 className="text-xl font-semibold text-slate-900 mt-1">
            Chapter Review Quiz
          </h3>
        </div>
        {submitted ? (
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
              Score: {score} / {questions.length}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Quiz
            </button>
          </div>
        ) : (
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {answeredCount} of {questions.length} answered
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const userChoice = answers[q.id];
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div key={q.id} className="space-y-3 pb-6 border-b border-slate-100 last:border-b-0 last:pb-0">
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                <span className="font-mono text-slate-500 mr-2 tabular-nums">
                  {String(qIdx + 1).padStart(2, '0')}.
                </span>
                {q.question}
              </p>

              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, optIdx) => {
                  const selected = userChoice === optIdx;
                  const isCorrectOpt = q.correctIndex === optIdx;

                  let styleClass =
                    'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';
                  if (submitted) {
                    if (isCorrectOpt) {
                      styleClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium';
                    } else if (selected && !isCorrectOpt) {
                      styleClass = 'bg-rose-50 border-rose-300 text-rose-950';
                    } else {
                      styleClass = 'bg-white border-slate-200 text-slate-500';
                    }
                  } else if (selected) {
                    styleClass = 'bg-sky-50 border-sky-400 text-sky-950 font-medium';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors flex items-center justify-between gap-3 ${styleClass} ${
                        !submitted ? 'cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span>{opt}</span>
                      {submitted && isCorrectOpt && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                      {submitted && selected && !isCorrectOpt && (
                        <XCircle className="w-4 h-4 text-rose-700 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <span className="font-semibold">
                    {isCorrect ? 'Correct: ' : 'Explanation: '}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500">
            Select an answer for every question to check your understanding.
          </p>
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Check Answers
          </button>
        </div>
      )}
    </section>
  );
};
