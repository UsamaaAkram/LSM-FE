import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import moment from "moment";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import {
  clearQuizState,
  fetchQuizForStudent,
} from "../../../core/redux/quizSlice";
import {
  submitStudentQuizAttempt,
  fetchQuizAttemptStatus,
} from "../../../core/redux/studentSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import { all_routes } from "../../router/all_routes";
import ProfileCard from "../common/profileCard";
import LiveCountdown from "./countDown";

const StudentQuizQuestion = () => {
  const route = all_routes;
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { quiz, loading, error } = useSelector((state: any) => state.quiz);
  const authUser: any = useSelector<RootState>((state) => state.auth.user);
  const queryParams = new URLSearchParams(location.search);
  const quizId = queryParams.get("id");

  // New: Quiz attempt status
  const [attemptStatus, setAttemptStatus] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);

  // Quiz state
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [studentAnswers, setStudentAnswers] = useState<{ [q: number]: string }>(
    {}
  );
  const [showResult, setShowResult] = useState(false);

  // Timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch quiz and quiz attempt status
  useEffect(() => {
    if (quizId) dispatch(fetchQuizForStudent(quizId));
    if (authUser?._id && quizId) {
      setStatusLoading(true);
      dispatch(
        fetchQuizAttemptStatus({ studentId: authUser._id, quizID: quizId })
      )
        .unwrap()
        .then((data) => {
          setAttemptStatus(data || {});
        })
        .finally(() => setStatusLoading(false));
    }
    return () => {
      dispatch(clearQuizState());
      if (timerRef.current) clearInterval(timerRef.current);
      window.onbeforeunload = null;
      window.removeEventListener("popstate", preventNav);
    };
    // eslint-disable-next-line
  }, [quizId, authUser?._id, dispatch]);

  const questions = quiz?.questions || [];
  const totalQuestions = questions.length;

  // Countdown setup
  useEffect(() => {
    if (!showStartScreen && quiz?.duration) {
      const d = moment.duration(quiz.duration || "00:00:00");
      setSecondsLeft(d.asSeconds());
      window.onbeforeunload = (e) => {
        e.preventDefault();
        return "You cannot leave the quiz during attempt!";
      };
      window.addEventListener("popstate", preventNav);
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      window.onbeforeunload = null;
      window.removeEventListener("popstate", preventNav);
    };
    // eslint-disable-next-line
  }, [showStartScreen, quiz?.duration]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((sec) => {
        if (sec <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleSubmit(true); // auto
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
  };

  function preventNav(e: any) {
    e.preventDefault();
    window.history.pushState(null, "", window.location.href);
    alert("Navigation is not allowed during the quiz!");
  }

  function formatTimer(sec: number) {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }

  // ATTEMPT LOGIC
  let canAttempt = true;
  let waitingUntilDate: string | null = null;
  if (attemptStatus) {
    if (attemptStatus.completed) {
      canAttempt = false;
    } else if (
      attemptStatus.totalAttempts % 2 === 0 &&
      attemptStatus.lastAttemptDate
    ) {
      const now = moment();
      const nextPossible = moment(attemptStatus.lastAttemptDate).add(7, "days");
      if (now.isBefore(nextPossible)) {
        canAttempt = false;
        waitingUntilDate = nextPossible.toISOString();
      }
    }
  }

  // Answer selection
  const handleAnswer = (questionIdx: number, choiceId: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionIdx]: choiceId,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions) setCurrentStep(currentStep + 1);
  };
  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };
  const handleStartQuiz = () => setShowStartScreen(false);

  const [result, setResult] = useState<any>(null);
  const handleSubmit = async (isAuto = false) => {
    setShowResult(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const answersArray = Object.entries(studentAnswers)
      .filter(([_, ans]) => ans)
      .map(([idx, ans]) => ({
        questionID: questions[Number(idx)]._id,
        selectedAnswerID: ans,
      }));

    if (!isAuto && answersArray.length !== totalQuestions) return;

    const submissionObject = {
      studentId: authUser._id,
      quizID: quiz._id,
      answers: answersArray,
    };

    try {
      const res = await dispatch(
        submitStudentQuizAttempt(submissionObject) as any
      ).unwrap();
      setResult(res.result);
    } catch (err: any) {
      setResult(null);
    }
  };

  const progress = Math.round(
    (currentStep / Math.max(totalQuestions, 1)) * 100
  );

  return (
    <>
      <Breadcrumb title="Quiz Attempt" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <div className="mb-4">
              <Link to={all_routes.studentQuiz} className="back-to-course">
                <i className="isax isax-arrow-left me-1" />
                Back to Quizzes
              </Link>
            </div>
            <div className="col-lg-12">
              {loading || statusLoading ? (
                <div className="text-center py-5">
                  <span className="spinner-border"></span>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : !quiz ? (
                <div className="text-center py-5">No quiz found.</div>
              ) : attemptStatus?.completed ? (
                <div className="card text-center p-5">
                  <div className="card-body">
                    <h2 className="mb-3">{quiz?.title}</h2>
                    <p className="mb-3 text-success fw-bold fs-25">
                      Quiz already passed!
                    </p>
                    <p>
                      Marks: <b>{attemptStatus.marks}</b> /{" "}
                      <b>{attemptStatus.totalMarks}</b>
                    </p>
                    <Link
                      to={route.studentQuiz}
                      className="btn btn-secondary rounded-pill mt-3"
                    >
                      <i className="isax isax-arrow-left-2 me-1 fs-10" />
                      Back to Quizzes
                    </Link>
                  </div>
                </div>
              ) : waitingUntilDate ? (
                <div className="card text-center p-5">
                  <div className="card-body">
                    <p className="mb-3 text-danger fw-bold fs-25">
                      You've reached the maximum number of attempts.
                    </p>
                    <LiveCountdown endDate={waitingUntilDate} />
                    <Link
                      to={route.studentQuiz}
                      className="btn btn-secondary rounded-pill mt-3"
                    >
                      <i className="isax isax-arrow-left-2 me-1 fs-10" />
                      Back to Quizzes
                    </Link>
                  </div>
                </div>
              ) : showResult ? (
                <fieldset style={{ display: "block" }}>
                  <div className="page-title d-flex align-items-center justify-content-between">
                    <h5>Quiz Result</h5>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="quiz-circle-progress m-0 mb-3">
                        {result && (
                          <>
                            <div className="text-center">
                              <ImageWithBasePath
                                src={
                                  result.passed
                                    ? "assets/img/hat-confetti.png"
                                    : "assets/img/sorry.png"
                                }
                                alt=""
                                className="img-fluid mb-3"
                                style={{ maxWidth: 150 }}
                              />
                            </div>
                            <div className="text-center mb-3">
                              <h4 className="mb-4">
                                {result.passed
                                  ? "Congratulations! You Passed"
                                  : "Oops, Try Again!"}
                              </h4>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="d-flex align-items-center justify-content-center">
                        <Link
                          to={route.studentQuiz}
                          className="btn btn-secondary rounded-pill"
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Back to Quizzes
                        </Link>
                      </div>
                    </div>
                  </div>
                </fieldset>
              ) : totalQuestions === 0 ? (
                <div className="alert alert-warning">
                  This quiz has no questions.
                </div>
              ) : showStartScreen ? (
                <div className="card text-center py-5">
                  <div className="card-body">
                    <h2 className="mb-3">{quiz?.title}</h2>
                    <p className="mb-3">
                      <strong>Questions: </strong> {totalQuestions}
                    </p>
                    <p className="mb-3">
                      <strong>Duration: </strong> {quiz?.duration}
                    </p>
                    <p className="mb-3">
                      <ImageGlobal
                        src="assets/img/students/quiz.jpg"
                        alt=""
                        className="img-fluid rounded-3"
                        style={{ maxWidth: 120 }}
                      />
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={handleStartQuiz}
                      disabled={!canAttempt}
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <fieldset id="question-field" style={{ display: "block" }}>
                  <div className="quiz-attempt-card border-0">
                    <div className="quiz-attempt-body p-0">
                      <div className="border p-3 mb-3 rounded-2">
                        <div className="bg-light border p-3 mb-3 rounded-2 flex-wrap">
                          <div className="row align-items-center">
                            <div className="col-md-8">
                              <h5 className="fs-18">Quiz: {quiz?.title}</h5>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <p className="d-inline-flex align-items-center mb-0">
                                <i className="isax isax-clock me-1" />
                                Time left: {formatTimer(secondsLeft)}
                              </p>
                            </div>
                          </div>
                        </div>
                        {/* Progress row */}
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span className="fw-semibold text-gray-9">
                              Quiz Progress
                            </span>
                            <span>
                              Question {currentStep} out of {totalQuestions}
                            </span>
                          </div>
                          <div className="progress progress-xs  flex-grow-1 mb-1">
                            <div
                              className="progress-bar bg-success rounded"
                              role="progressbar"
                              style={{ width: `${progress}%` }}
                              aria-valuenow={progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            />
                          </div>
                        </div>
                        {/* Question Content */}
                        <div>
                          <h6 className="mb-3">
                            {questions[currentStep - 1]?.question}
                          </h6>
                          {(questions[currentStep - 1]?.choices || []).map(
                            (choice: any) => (
                              <div className="form-check mb-2" key={choice._id}>
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name={`question-${currentStep}`}
                                  id={`choice-${choice._id}`}
                                  checked={
                                    studentAnswers[currentStep - 1] ===
                                    choice._id
                                  }
                                  onChange={() =>
                                    handleAnswer(currentStep - 1, choice._id)
                                  }
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={`choice-${choice._id}`}
                                >
                                  {choice.label}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <button
                          type="button"
                          className="btn btn-light d-inline-flex rounded-pill align-items-center prev_btn me-1"
                          onClick={handlePrev}
                          disabled={currentStep === 1}
                        >
                          <i className="isax isax-arrow-left-2 me-1 fs-10" />
                          Previous
                        </button>
                        {/* Show either Next or Submit */}
                        {currentStep < totalQuestions ? (
                          <button
                            type="button"
                            className="btn btn-secondary rounded-pill next_btn"
                            onClick={handleNext}
                            disabled={!studentAnswers[currentStep - 1]}
                          >
                            Next
                            <i className="isax isax-arrow-right-3 ms-1 fs-10" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-success rounded-pill next_btn"
                            onClick={() => handleSubmit(false)}
                            disabled={
                              Object.keys(studentAnswers).length !==
                              totalQuestions
                            }
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </fieldset>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentQuizQuestion;
