import { TimePicker } from "antd";
import dayjs from "dayjs";
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import CustomSelect from "../../../core/common/commonSelect";
import { fetchCourses } from "../../../core/redux/courses";
import {
  createQuiz,
  deleteQuiz,
  fetchQuizzes,
  searchQuizzes,
  updateQuiz,
} from "../../../core/redux/quizSlice";
import type { AppDispatch } from "../../../core/redux/store";
import { all_routes } from "../../router/all_routes";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

// Types for the quiz form (Formik)
type QuizFormType = {
  courseID: string;
  title: string;
  totalMarks: string;
  passMark: string;
  duration: string;
  questions?: any[];
};

const quizInitialValues: QuizFormType = {
  courseID: "",
  title: "",
  totalMarks: "",
  passMark: "",
  duration: "",
  questions: [],
};

const quizSchema = Yup.object().shape({
  courseID: Yup.string().required("Course is required"),
  title: Yup.string().required("Quiz title is required"),
  totalMarks: Yup.number()
    .typeError("Total marks must be a number")
    .positive("Should be positive")
    .required("Total marks is required"),
  passMark: Yup.number()
    .typeError("Pass mark must be a number")
    .positive("Should be positive")
    .required("Pass mark is required"),
  duration: Yup.string()
    .required("Duration is required")
    .test("valid-duration", "Invalid time format", (val) => {
      if (!val) return false;
      return moment(val, "HH:mm:ss", true).isValid();
    }),
});

const InstructorQuiz = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { quizzes, loading } = useSelector((state: any) => ({
    quizzes: state.quiz.quizzes || [],
    loading: state.quiz.loading,
  }));

  const { courses } = useSelector((state: any) => ({
    courses: state.courses.courses || [],
  }));

  const [editId, setEditId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [defaultEditValues, setDefaultEditValues] = useState(quizInitialValues);

  const getModalContainer = () =>
    document.getElementById("add_quiz") || document.body;
  const getModalContainer2 = () =>
    document.getElementById("edit_quiz") || document.body;

  useEffect(() => {
    dispatch(fetchCourses({}) as any);
    dispatch(fetchQuizzes() as any);
  }, [dispatch]);

  const CourseOptions = courses.map((c: any) => ({
    label: c.courseTitle,
    value: c._id,
  }));

  useEffect(() => {
    if (searchText) {
      dispatch(searchQuizzes({ search: searchText }) as any);
    } else {
      dispatch(fetchQuizzes() as any);
    }
  }, [searchText, dispatch]);

  const findCourseLabel = (id: string) => {
    const found = CourseOptions.find((c: any) => c.value === id);
    return found ? found.label : "";
  };

  function formatDuration(duration: string) {
    const m = moment(duration, "HH:mm:ss");
    const parts = [];
    const hours = m.hours();
    const mins = m.minutes();
    const secs = m.seconds();
    if (hours) parts.push(`${hours} hr`);
    if (mins) parts.push(`${mins} min`);
    if (secs) parts.push(`${secs} sec`);
    return parts.join(" ");
  }

  // --- Formik handlers ---

  const handleAddQuizSubmit = async (
    values: QuizFormType,
    { setSubmitting, resetForm }: FormikHelpers<QuizFormType>
  ) => {
    const quizData = {
      courseID: values.courseID,
      title: values.title,
      totalMarks: Number(values.totalMarks),
      passMark: Number(values.passMark),
      duration: values.duration,
      questions: [],
    };
    try {
      const result: any = await dispatch(createQuiz(quizData));
      if (result.type && result.type.endsWith("/rejected")) {
        toast.error(
          result.payload?.message || "Error creating quiz. Please try again."
        );
      } else {
        toast.success("Quiz created successfully!");
        dispatch(fetchQuizzes() as any);
        resetForm();
        (window as any).bootstrap?.Modal.getOrCreateInstance(
          document.getElementById("add_quiz")
        )?.hide();
      }
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error creating quiz.");
    }
    setSubmitting(false);
  };

  const handleEditQuizSubmit = async (
    values: QuizFormType,
    { setSubmitting, resetForm }: FormikHelpers<QuizFormType>
  ) => {
    if (!editId) return;
    const quizData = {
      courseID: values.courseID,
      title: values.title,
      totalMarks: Number(values.totalMarks),
      passMark: Number(values.passMark),
      duration: values.duration,
      questions: defaultEditValues.questions || [],
    };
    try {
      const result: any = await dispatch(
        updateQuiz({ id: editId, data: quizData })
      );
      if (result.type && result.type.endsWith("/rejected")) {
        toast.error(
          result.payload?.message || "Error updating quiz. Please try again."
        );
      } else {
        toast.success("Quiz updated successfully!");
        setEditId(null);
        dispatch(fetchQuizzes() as any);
        resetForm();
        (window as any).bootstrap?.Modal.getOrCreateInstance(
          document.getElementById("edit_quiz")
        )?.hide();
      }
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error updating quiz.");
    }
    setSubmitting(false);
  };

  const handleEditOpen = (quiz: any) => {
    setEditId(quiz._id);
    setDefaultEditValues({
      courseID: quiz.courseID || "",
      title: quiz.title || "",
      totalMarks: quiz.totalMarks?.toString() || "",
      passMark: quiz.passMark?.toString() || "",
      duration: quiz.duration || "",
      questions: quiz.questions,
    });
    (window as any).bootstrap?.Modal.getOrCreateInstance(
      document.getElementById("edit_quiz")
    )?.show();
  };

  const handleDelete = async (id: string) => {
    try {
      const result: any = await dispatch(deleteQuiz(id));
      if (result.type && result.type.endsWith("/rejected")) {
        toast.error(
          result.payload?.message || "Error deleting quiz. Please try again."
        );
        return;
      }
      toast.success("Quiz deleted successfully!");
      dispatch(fetchQuizzes() as any);
      (window as any).bootstrap?.Modal.getOrCreateInstance(
        document.getElementById("delete_modal")
      )?.hide();
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error deleting quiz.");
    }
  };

  const renderQuizList = () =>
    quizzes?.length === 0 ? (
      <></>
    ) : (
      <div className="row gy-3 gx-0">
        {quizzes.map((quiz: any, idx: number) => (
          <div className="col-12" key={quiz._id || idx}>
            <div className="border rounded-2 p-3 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="row g-2 align-items-center">
                  <div className="col-12 col-md-8">
                    <h6 className="mb-2">
                      <Link to={`${all_routes.instructorQA}?id=${quiz._id}`}>
                        {quiz.title}
                      </Link>
                    </h6>
                    <div className="question-info d-flex flex-wrap align-items-center gap-3">
                      <div className="d-flex align-items-center fs-14 border-end pe-2">
                        <i className="isax isax-message-question5 text-primary-soft me-2"></i>
                        <span>{quiz.questions.length} Questions</span>
                      </div>
                      <div className="d-flex align-items-center fs-14 border-end pe-2">
                        <i className="isax isax-clock5 text-secondary-soft me-2"></i>
                        <span>{formatDuration(quiz.duration)}</span>
                      </div>
                      <span className="fs-14 text-muted">
                        Course: {findCourseLabel(quiz.courseID)}
                      </span>
                    </div>
                  </div>
                  <div className="col-12 col-md-4 d-flex align-items-center justify-content-md-end mt-2 mt-md-0 gap-2">
                    <Link
                      to={`${all_routes.instructorQA}?id=${quiz._id}`}
                      className="d-inline-flex fs-14 action-icon"
                    >
                      <i className="isax isax-eye"></i>
                    </Link>

                    <Link
                      to="#"
                      className="d-inline-flex fs-14 action-icon"
                      data-bs-toggle="modal"
                      data-bs-target="#edit_quiz"
                      onClick={() => handleEditOpen(quiz)}
                    >
                      <i className="isax isax-edit-2"></i>
                    </Link>
                    <Link
                      to="#"
                      className="d-inline-flex fs-14 action-icon"
                      data-bs-toggle="modal"
                      data-bs-target="#delete_modal"
                      onClick={() => setEditId(quiz._id)}
                    >
                      <i className="isax isax-trash"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

  const confirmDelete = () => {
    if (editId) handleDelete(editId);
  };

  // Reset edit modal values when closed
  useEffect(() => {
    const editModal = document.getElementById("edit_quiz");
    if (!editModal) return;
    const handleResetForm = () => setEditId(null);
    editModal.addEventListener("hidden.bs.modal", handleResetForm);
    return () => {
      editModal.removeEventListener("hidden.bs.modal", handleResetForm);
    };
  }, []);

  return (
    <>
      <Breadcrumb title="Quiz" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-12 col-lg-9">
              <div className="page-title d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                <h5 className="fw-bold">Quiz</h5>
                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-end">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by quiz title"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{
                      maxWidth: "260px",
                      minWidth: "140px",
                      flex: "1 0 140px",
                    }}
                  />
                  <Link
                    to="#"
                    className="btn btn-secondary"
                    data-bs-toggle="modal"
                    data-bs-target="#add_quiz"
                  >
                    Add Quiz
                  </Link>
                </div>
              </div>
              {loading ? (
                <div className="py-5 text-center">
                  <span className="spinner-border"></span>
                </div>
              ) : (
                renderQuizList()
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Quiz Modal */}
      <div className="modal fade" id="add_quiz">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="fw-bold">Add New Quiz</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <Formik
              initialValues={quizInitialValues}
              validationSchema={quizSchema}
              onSubmit={handleAddQuizSubmit}
            >
              {({ setFieldValue, values, isSubmitting, resetForm }) => (
                <Form>
                  <div className="modal-body pb-0">
                    <div className="mb-3">
                      <label className="form-label">
                        Course <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        className="select"
                        options={CourseOptions}
                        value={CourseOptions.find(
                          (opt: any) => opt.value === values.courseID
                        )}
                        onChange={(option) =>
                          setFieldValue("courseID", option.value)
                        }
                      />
                      <ErrorMessage
                        name="courseID"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Quiz Title <span className="text-danger">*</span>
                          </label>
                          <Field
                            type="text"
                            name="title"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="title"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Duration <span className="text-danger">*</span>
                          </label>
                          <div className="input-icon-end position-relative">
                            <TimePicker
                              getPopupContainer={getModalContainer}
                              className="form-control timepicker"
                              value={
                                values.duration
                                  ? dayjs(values.duration, "HH:mm:ss")
                                  : null
                              }
                              onChange={(val) =>
                                setFieldValue(
                                  "duration",
                                  val ? val.format("HH:mm:ss") : ""
                                )
                              }
                              format="HH:mm:ss"
                            />
                            <span className="input-icon-addon">
                              <i className="isax isax-clock" />
                            </span>
                          </div>
                          <ErrorMessage
                            name="duration"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Total Marks <span className="text-danger">*</span>
                          </label>
                          <Field
                            type="number"
                            name="totalMarks"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="totalMarks"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Pass Mark <span className="text-danger">*</span>
                          </label>
                          <Field
                            type="number"
                            name="passMark"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="passMark"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn bg-gray-100 rounded-pill me-2"
                      type="button"
                      data-bs-dismiss="modal"
                      onClick={() => resetForm()}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-secondary rounded-pill"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Add Quiz"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* Edit Quiz Modal */}
      <div className="modal fade" id="edit_quiz">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="fw-bold">Edit Quiz</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <Formik
              enableReinitialize
              initialValues={defaultEditValues}
              validationSchema={quizSchema}
              onSubmit={handleEditQuizSubmit}
            >
              {({ setFieldValue, values, isSubmitting, resetForm }) => (
                <Form>
                  <div className="modal-body pb-0">
                    <div className="mb-3">
                      <label className="form-label">
                        Course <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        className="select"
                        options={CourseOptions}
                        value={CourseOptions.find(
                          (opt: any) => opt.value === values.courseID
                        )}
                        onChange={(option) =>
                          setFieldValue("courseID", option.value)
                        }
                      />
                      <ErrorMessage
                        name="courseID"
                        component="div"
                        className="text-danger"
                      />
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Quiz Title <span className="text-danger">*</span>
                          </label>
                          <Field
                            type="text"
                            name="title"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="title"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Duration <span className="text-danger">*</span>
                          </label>
                          <div className="input-icon-end position-relative">
                            <TimePicker
                              getPopupContainer={getModalContainer2}
                              className="form-control timepicker"
                              value={
                                values.duration
                                  ? dayjs(values.duration, "HH:mm:ss")
                                  : null
                              }
                              onChange={(val) =>
                                setFieldValue(
                                  "duration",
                                  val ? val.format("HH:mm:ss") : ""
                                )
                              }
                              format="HH:mm:ss"
                            />
                            <span className="input-icon-addon">
                              <i className="isax isax-clock" />
                            </span>
                          </div>
                          <ErrorMessage
                            name="duration"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Total Marks <span className="text-danger">*</span>
                          </label>
                          <Field
                            type="number"
                            name="totalMarks"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="totalMarks"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                      <div className="col-12 col-md-6">
                        <div className="mb-3">
                          <label className="form-label">
                            Pass Mark <span className="text-danger">*</span>
                          </label>
                          <Field
                            type="number"
                            name="passMark"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="passMark"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn bg-gray-100 rounded-pill me-2"
                      type="button"
                      data-bs-dismiss="modal"
                      onClick={() => {
                        resetForm();
                        setEditId(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-secondary rounded-pill"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center custom-modal-body">
              <span className="avatar avatar-lg bg-danger-transparent rounded-circle mb-2">
                <i className="isax isax-trash fs-24 text-danger" />
              </span>
              <div>
                <h4 className="mb-2">Delete Quiz</h4>
                <p className="mb-3">
                  Are you sure you want to delete this Quiz?
                </p>
                <div className="d-flex align-items-center justify-content-center">
                  <Link
                    to="#"
                    className="btn bg-gray-100 rounded-pill me-2"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-secondary rounded-pill"
                    onClick={confirmDelete}
                    data-bs-dismiss="modal"
                  >
                    Yes, Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorQuiz;
