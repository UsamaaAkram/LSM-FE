import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import DefaultEditor from "react-simple-wysiwyg";
import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { fetchStudentQuizzes } from "../../../core/redux/quizSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import { fetchStudentEnrolledCourses } from "../../../core/redux/studentCoursesSlice";
import {
  fetchPublishedAssignments,
  submitStudentAssignment,
} from "../../../core/redux/studentSlice";
import { all_routes } from "../../router/all_routes";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";

const StudentQuiz = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authUser: any = useSelector<RootState>((state) => state.auth.user);

  const [openedAssignId, setOpenedAssignId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState<any>({});

  const submitLoading = useSelector(
    (state: any) => state.student.publishedAssignmentsLoading
  );
  const submitError = useSelector(
    (state: any) => state.student.submitAssignmentError
  );
  
  const assignment = useSelector(
    (state: any) => state?.student?.publishedAssignments
  );

  useEffect(() => {
    if (authUser?._id) {
      dispatch(fetchPublishedAssignments(authUser._id) as any);
    }
  }, [dispatch, authUser?._id]);

  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
    }
  }, [submitError]);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(fetchStudentEnrolledCourses(authUser._id) as any);
    }
  }, [authUser?._id, dispatch]);

  const { courses } = useSelector((state: any) => state.studentCourses);
  const { quizzes, loading, error } = useSelector((state: any) => state.quiz);

  const CourseOptions = courses.map((c: any) => ({
    label: c.courseTitle,
    value: c._id,
  }));

  // Pagination state!
  const perPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(quizzes.length / perPage);
  const pageQuizzes = quizzes.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (authUser?._id) {
      dispatch(fetchStudentQuizzes(authUser._id));
    }
  }, [authUser?._id, dispatch]);

  useEffect(() => {
    setPage(1); // reset to first page when quizzes change
  }, [quizzes]);

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

  return (
    <>
      <Breadcrumb title="Quiz & Assignments" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />

            <div className="col-lg-9 course-watch-section">
              <div className="course-watch-content">
                <ul
                  className="nav-tabs mb-4 nav-justified border-0 nav-style-1 d-sm-flex d-block"
                  role="tablist"
                >
                  <li className="nav-item active">
                    <Link
                      className="btn nav-link active"
                      data-bs-toggle="tab"
                      role="tab"
                      to="#quiz"
                      aria-selected="false"
                    >
                      Quiz
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className="btn nav-link"
                      data-bs-toggle="tab"
                      role="tab"
                      to="#assignments"
                      aria-selected="true"
                    >
                      Assignments
                    </Link>
                  </li>
                </ul>
                <div className="tab-content">
                  <div
                    className="tab-pane active show"
                    id="quiz"
                    role="tabpanel"
                  >
                    {loading ? (
                      <div className="text-center py-5">
                        <span className="spinner-border"></span>
                      </div>
                    ) : error ? (
                      <div className="alert alert-danger">{error}</div>
                    ) : (
                      <>
                        {pageQuizzes.map((quiz: any) => (
                          <div
                            key={quiz._id}
                            className="d-flex align-items-center justify-content-between border p-3 mb-3 rounded-2"
                          >
                            <div className="col-12 col-md-8">
                              <h6 className="mb-2">
                                <Link
                                  to={`${all_routes.studentQuizQuestion}?id=${quiz._id}`}
                                >
                                  {quiz.title}
                                </Link>
                              </h6>
                              <div className="question-info d-flex flex-wrap align-items-center gap-3">
                                <div className="d-flex align-items-center fs-14 border-end pe-2">
                                  <i className="isax isax-message-question5 text-primary-soft me-2"></i>
                                  <span>{quiz.questionsCount} Questions</span>
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
                            <div>
                              <Link
                                to={`${all_routes.studentQuizQuestion}?id=${quiz._id}`}
                                className="arrow-next"
                              >
                                <i className="isax isax-arrow-right-1" />
                              </Link>
                            </div>
                          </div>
                        ))}
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="row align-items-center mt-3">
                            <div className="col-md-2">
                              <p className="pagination-text">
                                Page {page} of {totalPages}
                              </p>
                            </div>
                            <div className="col-md-10">
                              <ul className="pagination lms-page justify-content-center justify-content-md-end mt-2 mt-md-0">
                                <li
                                  className={`page-item prev ${
                                    page === 1 ? "disabled" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                  >
                                    <i className="fas fa-angle-left" />
                                  </button>
                                </li>
                                {Array.from({ length: totalPages }, (_, i) => (
                                  <li
                                    key={i}
                                    className={`page-item ${
                                      page === i + 1 ? "active" : ""
                                    }`}
                                  >
                                    <button
                                      className="page-link"
                                      onClick={() => setPage(i + 1)}
                                    >
                                      {i + 1}
                                    </button>
                                  </li>
                                ))}
                                <li
                                  className={`page-item next ${
                                    page === totalPages ? "disabled" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                  >
                                    <i className="fas fa-angle-right" />
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="tab-pane" id="assignments" role="tabpanel">
                    <div className="mb-0">
                      {assignment?.map((assign: any, index: number) => {
                        const dueDate = moment(assign.lastDate);
                        const today = moment().startOf("day");
                        const isDueToday = dueDate.isSame(today, "day");
                        const isPast = dueDate.isBefore(today, "day");
                        const textClass =
                          isDueToday || isPast ? "text-danger" : "";
                        return (
                          <div
                            className="accordions-items-seperate mb-3"
                            id={`accordionSpacingExample${index}`}
                            key={assign._id}
                          >
                            <div className="accordion-item">
                              <div
                                className="accordion-header"
                                id={`headingSpacingOne${index}`}
                              >
                                <button
                                  className="accordion-button collapsed"
                                  type="button"
                                  data-bs-toggle="collapse"
                                  data-bs-target={`#accordionOne${index}`}
                                  aria-expanded="false"
                                  aria-controls={`accordionOne${index}`}
                                >
                                  {assign.title}
                                </button>
                              </div>
                              <div
                                id={`accordionOne${index}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`headingSpacingOne${index}`}
                                data-bs-parent={`#accordionSpacingExample${index}`}
                              >
                                <div className="accordion-body">
                                  <div className="mb-4">
                                    <h6 className="fs-18 fw-semibold mb-1">
                                      Description
                                    </h6>
                                    <p>{assign.description}</p>
                                  </div>
                                  <div className="mb-4">
                                    <h6 className="fs-18 fw-semibold mb-2">
                                      Instructions
                                    </h6>
                                    <p>{assign.instructions}</p>
                                  </div>

                                  <div className="d-flex justify-content-between">
                                    <div>
                                      <h6 className="fs-18 fw-semibold mb-2">
                                        Due Date
                                      </h6>
                                      <p
                                        className={`mb-0 ${textClass} fw-bold`}
                                      >
                                        {moment(assign.lastDate).format(
                                          "DD MMM YYYY"
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <button
                                        className="btn btn-secondary d-flex align-items-center"
                                        onClick={() => {
                                          setOpenedAssignId(assign._id); // set this assignment as open
                                        }}
                                      >
                                        <i className="isax isax-add-circle me-1" />
                                        Add Assignments
                                      </button>
                                    </div>
                                  </div>

                                  {openedAssignId === assign._id && (
                                    <div className="mt-4 shadow border border-muted p-4 pt-2 rounded">
                                      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                        <h6>Add Assignment</h6>
                                        <span
                                          role="button"
                                          style={{
                                            fontSize: 28,
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            setOpenedAssignId(null)
                                          }
                                        >
                                          ×
                                        </span>
                                      </div>
                                      <DefaultEditor
                                        value={submissionText[assign._id] || ""}
                                        placeholder="Enter assignment details"
                                        onChange={(e) =>
                                          setSubmissionText({
                                            ...submissionText,
                                            [assign._id]: e.target.value,
                                          })
                                        }
                                      />
                                      <div className="d-flex justify-content-end">
                                        <button
                                          className="btn btn-secondary mt-3"
                                          disabled={submitLoading}
                                          onClick={() => {
                                            dispatch(
                                              submitStudentAssignment({
                                                studentId: authUser._id,
                                                courseId: assign.courseID,
                                                assignmentId: assign._id,
                                                submissionText:
                                                  submissionText[assign._id] ||
                                                  "",
                                              })
                                            )
                                              .unwrap()
                                              .then(() => {
                                                setOpenedAssignId(null);
                                                toast.success("Submitted successful!");
                                              });
                                          }}
                                        >
                                          {submitLoading
                                            ? "Submitting..."
                                            : "Submit"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentQuiz;
