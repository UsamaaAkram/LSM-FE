import React, { useEffect, useState } from "react";

// #34 — per-question quiz review.
//
// Quiz attempts used to store the final score only, so there was nothing to
// review. Each attempt now records every answer together with the question and
// choice text as it read at the time, which means a later edit to the quiz
// can't silently rewrite a student's history.
//
// Shared by the instructor's submission modal and the student's own result
// screen so the two can never drift apart.

export interface QuizAnswer {
  questionID?: string;
  questionText?: string;
  selectedAnswerID?: string;
  selectedAnswerText?: string;
  correctAnswerID?: string;
  correctAnswerText?: string;
  isCorrect?: boolean;
  marksAwarded?: number;
  explanation?: string;
}

export interface QuizAttempt {
  attemptNumber?: number;
  marks?: number;
  totalMarks?: number;
  percentage?: number;
  passed?: boolean;
  timeTakenSeconds?: number | null;
  attemptedAt?: string;
  answers?: QuizAnswer[];
}

const fmtDuration = (secs?: number | null) => {
  if (secs === null || secs === undefined || Number.isNaN(Number(secs)))
    return null;
  const s = Math.max(0, Math.round(Number(secs)));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
};

const fmtDate = (v?: string) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

interface Props {
  attempts?: QuizAttempt[];
  /** Shown when there is no recorded detail at all. */
  emptyNote?: string;
}

const QuizAttemptReview: React.FC<Props> = ({ attempts, emptyNote }) => {
  const list = Array.isArray(attempts) ? attempts : [];
  const [active, setActive] = useState(0);

  // The list arrives after the modal opens, so the selection has to follow it
  // rather than being fixed on first render. It is also clamped: switching to
  // a student with fewer attempts would otherwise leave the index out of range
  // and render nothing at all.
  useEffect(() => {
    setActive((i) => (i < list.length ? i : 0));
  }, [list.length]);

  if (!list.length) {
    return (
      <p className="mb-0 text-muted">
        {emptyNote ||
          "No per-question detail was recorded for this attempt. Answers are stored from now on, so future attempts will show a full breakdown."}
      </p>
    );
  }

  const attempt = list[Math.min(active, list.length - 1)];
  const answers = attempt.answers || [];
  const duration = fmtDuration(attempt.timeTakenSeconds);

  return (
    <div>
      {list.length > 1 && (
        <div className="d-flex flex-wrap gap-2 mb-3">
          {list.map((a, i) => (
            <button
              key={i}
              type="button"
              className={`btn btn-sm ${
                i === active ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setActive(i)}
            >
              Attempt {a.attemptNumber ?? i + 1}
            </button>
          ))}
        </div>
      )}

      <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
        <span>
          <strong>Score:</strong> {attempt.marks ?? 0}/{attempt.totalMarks ?? 0}{" "}
          ({attempt.percentage ?? 0}%)
        </span>
        <span
          className={`badge ${
            attempt.passed
              ? "bg-success-transparent text-success"
              : "bg-danger-transparent text-danger"
          }`}
        >
          {attempt.passed ? "Passed" : "Not passed"}
        </span>
        {duration && (
          <span className="text-muted" style={{ fontSize: 13 }}>
            Time taken: {duration}
          </span>
        )}
        {attempt.attemptedAt && (
          <span className="text-muted" style={{ fontSize: 13 }}>
            {fmtDate(attempt.attemptedAt)}
          </span>
        )}
      </div>

      {!answers.length ? (
        <p className="mb-0 text-muted">
          This attempt was taken before answers were recorded, so only the score
          is available.
        </p>
      ) : (
        answers.map((a, i) => (
          <div
            key={i}
            className={`border rounded p-3 mb-2 ${
              a.isCorrect ? "border-success" : "border-danger"
            }`}
          >
            <div className="d-flex justify-content-between align-items-start gap-2">
              <strong style={{ fontSize: 14 }}>
                {i + 1}. {a.questionText || "(question removed)"}
              </strong>
              <span
                className={`badge flex-shrink-0 ${
                  a.isCorrect
                    ? "bg-success-transparent text-success"
                    : "bg-danger-transparent text-danger"
                }`}
              >
                {a.isCorrect ? "Correct" : "Incorrect"}
              </span>
            </div>

            <div className="mt-2" style={{ fontSize: 13 }}>
              <div>
                <span className="text-muted">Answered: </span>
                {/* An unanswered question is different from a wrong one, and
                    the review has to say which it was. */}
                {a.selectedAnswerText ? (
                  <span
                    className={a.isCorrect ? "text-success" : "text-danger"}
                  >
                    {a.selectedAnswerText}
                  </span>
                ) : (
                  <span className="text-muted fst-italic">Not answered</span>
                )}
              </div>
              {!a.isCorrect && a.correctAnswerText && (
                <div>
                  <span className="text-muted">Correct answer: </span>
                  <span className="text-success">{a.correctAnswerText}</span>
                </div>
              )}
              <div className="text-muted">
                Marks: {a.marksAwarded ?? 0}
              </div>
              {a.explanation && (
                <div className="mt-2 p-2 bg-light rounded">
                  <span className="text-muted">Why: </span>
                  {a.explanation}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default QuizAttemptReview;
