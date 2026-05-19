import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import {
  clearQuizState,
  fetchQuizById,
  updateQuiz,
} from "../../../core/redux/quizSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import { all_routes } from "../../router/all_routes";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";
import AddQuestionModal, { type Choice } from "./AddQuestionModal";

const InstructorQuizQuestions = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { quiz, loading, error } = useSelector(
    (state: RootState) => state.quiz
  );

  const queryParams = new URLSearchParams(location.search);
  const quizId = queryParams.get("id");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit state
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editInitial, setEditInitial] = useState<{
    question: string;
    questionType: { label: string; value: string };
    choices: Choice[];
  } | null>(null);

  // Delete modal index
  const [deleteModalIdx, setDeleteModalIdx] = useState<number | null>(null);

  useEffect(() => {
    if (quizId) dispatch(fetchQuizById(quizId));
    return () => {
      dispatch(clearQuizState());
    };
  }, [quizId, dispatch]);

  const handleAddQuestion = async (formValues: {
    question: string;
    questionType: { label: string; value: string };
    choices: Choice[];
  }) => {
    if (!quiz || !quizId) return false;
    setModalLoading(true);
    try {
      const updatedQuestions = [...quiz.questions, { ...formValues }];
      await dispatch(
        updateQuiz({
          id: quizId,
          data: { ...quiz, questions: updatedQuestions },
        })
      ).unwrap();
      dispatch(fetchQuizById(quizId));
      toast.success("Question added successfully!");
      setModalLoading(false);
      return true;
    } catch (error: any) {
      toast.error(error?.message || "Error adding question. Please try again.");
      setModalLoading(false);
      return false;
    }
  };

  const handleEditQuestion = async (formValues: {
    question: string;
    questionType: { label: string; value: string };
    choices: Choice[];
  }) => {
    if (!quiz || !quizId || editIdx === null) return false;
    setModalLoading(true);
    try {
      const updatedQuestions = quiz.questions.map((q: any, i: number) =>
        i === editIdx ? { ...formValues } : q
      );
      await dispatch(
        updateQuiz({
          id: quizId,
          data: { ...quiz, questions: updatedQuestions },
        })
      ).unwrap();
      dispatch(fetchQuizById(quizId));
      setShowEditModal(false);
      toast.success("Question updated successfully!");
      setModalLoading(false);
      return true;
    } catch (error: any) {
      toast.error(
        error?.message || "Error updating question. Please try again."
      );
      setModalLoading(false);
      return false;
    }
  };

  const handleOpenEditModal = (idx: number) => {
    if (!quiz?.questions?.[idx]) return;
    setEditIdx(idx);
    setEditInitial({
      question: quiz.questions[idx].question,
      questionType: { ...quiz.questions[idx].questionType },
      choices: quiz.questions[idx].choices.map((c: Choice) => ({ ...c })),
    });
    setShowEditModal(true);
  };

  // Delete Question Handler
  const handleDeleteQuestion = async (e: any) => {
    e.preventDefault();
    if (!quiz || !quizId || deleteModalIdx === null) return;
    const updatedQuestions = quiz.questions.filter(
      (_: any, i: number) => i !== deleteModalIdx
    );
    try {
      await dispatch(
        updateQuiz({
          id: quizId,
          data: { ...quiz, questions: updatedQuestions },
        })
      ).unwrap();
      dispatch(fetchQuizById(quizId));
      setDeleteModalIdx(null);
      toast.success("Question deleted successfully!");
    } catch (error: any) {
      toast.error(
        error?.message || "Error deleting question. Please try again."
      );
    }
  };

  // Render questions list
  const renderQuestions = () => {
    if (!quiz) return null;
    if (!quiz.questions || quiz.questions.length === 0)
      return <div>No Questions Yet.</div>;
    return quiz.questions.map((question: any, idx: number) => (
      <div className="card" key={idx}>
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6>{question.question}</h6>
            <div className="d-flex align-items-center justify-content-end">
              <button
                type="button"
                className="d-inline-flex fs-14 me-2 action-icon btn btn-link p-0"
                onClick={() => handleOpenEditModal(idx)}
              >
                <i className="isax isax-edit-2"></i>
              </button>
              <Link
                to="#"
                className="d-inline-flex fs-14 action-icon"
                data-bs-toggle="modal"
                data-bs-target="#delete_modal"
                onClick={() => setDeleteModalIdx(idx)}
              >
                <i className="isax isax-trash"></i>
              </Link>
            </div>
          </div>
          <div>
            {question.choices.map((c: Choice, i: number) => (
              <div className="form-check mb-2" key={i}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={c.isCorrect}
                  readOnly
                />
                <label className="form-check-label">{c.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    ));
  };

  // Loading/Error feedback
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  return (
    <>
      <Breadcrumb title="Quiz" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row align-items-center gy-3">
                    <div className="col-xl-8">
                      <h5 className="mb-2">
                        <Link to="#">{quiz?.title}</Link>
                      </h5>
                    </div>
                    <div className="col-xl-4">
                      <div className="d-flex align-items-center justify-content-sm-end">
                        <Link
                          to={all_routes.instructorQuizResult}
                          className="text-info text-decoration-underline fs-12 fw-medium me-3"
                        >
                          View Results
                        </Link>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setShowAddModal(true)}
                        >
                          Add Question
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* List of questions */}
              {renderQuestions()}

              {/* Add Question Modal */}
              <AddQuestionModal
                show={showAddModal}
                mode="create"
                loading={modalLoading}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddQuestion}
              />

              {/* Edit Question Modal - uses same modal but in 'edit' mode */}
              <AddQuestionModal
                show={showEditModal}
                mode="edit"
                loading={modalLoading}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleEditQuestion}
                initialValues={editInitial ?? undefined}
              />

              {/* Delete Modal */}
              <div className="modal fade" id="delete_modal">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-body text-center custom-modal-body">
                      <span className="avatar avatar-lg bg-secondary-transparent rounded-circle mb-2">
                        <i className="isax isax-trash fs-24 text-danger" />
                      </span>
                      <div>
                        <h4 className="mb-2">Delete Question</h4>
                        <p className="mb-3">
                          Are you sure you want to delete this question?
                        </p>
                        <div className="d-flex align-items-center justify-content-center">
                          <Link
                            to="#"
                            className="btn bg-gray-100 rounded-pill me-2"
                            data-bs-dismiss="modal"
                            onClick={() => setDeleteModalIdx(null)}
                          >
                            Cancel
                          </Link>
                          <Link
                            to="#"
                            className="btn btn-secondary rounded-pill"
                            data-bs-dismiss="modal"
                            onClick={handleDeleteQuestion}
                          >
                            Yes, Delete
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Delete Modal */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorQuizQuestions;
