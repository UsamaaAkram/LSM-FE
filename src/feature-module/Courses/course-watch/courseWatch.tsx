import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import {
  clearCourseAssignments,
  fetchCourseAssignments,
} from "../../../core/redux/courses";
import {
  createLessonWatched,
  fetchLessonWatched,
  updateLessonWatched,
} from "../../../core/redux/studentLessonWatchedSlice";
import {
  clearCurrentCourse,
  fetchStudentCourseDetail,
  submitStudentAssignment,
} from "../../../core/redux/studentSlice";

import DefaultEditor from "react-simple-wysiwyg";
import { toast } from "react-toastify";
import type { AppDispatch } from "../../../core/redux/store";
import VideoPlayer from "../../HomePages/home-one/section/videoPlayer";
import { all_routes } from "../../router/all_routes";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CourseWatch = () => {
  const query = useQuery();
  const id: any = query.get("id");
  const std: any = query.get("std");
  const dispatch = useDispatch<AppDispatch>();

  const { currentCourse, courseLoading, courseError } = useSelector(
    (state: any) => state.student
  );

  const assignment = useSelector(
    (state: any) => state?.courses?.courseAssignments
  );

  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const [openedAssignId, setOpenedAssignId] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [lesson, setLesson] = useState<any>({});
  type Segment = { start: number; end: number };
  const [watchedSegments, setWatchedSegments] = useState<Segment[]>([]);
  const [duration, setDuration] = useState(0);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  const submitLoading = useSelector(
    (state: any) => state.student.submitAssignmentLoading
  );
  const submitError = useSelector(
    (state: any) => state.student.submitAssignmentError
  );

  useEffect(() => {
    if (std && id) {
      dispatch(
        fetchStudentCourseDetail({ studentId: std, courseId: id }) as any
      );
    }
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [std, id, dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseAssignments(id) as any);
    }
    return () => {
      dispatch(clearCourseAssignments());
    };
  }, [dispatch, id]);

  const lessonWatched: any = useSelector(
    (state: any) => state.lessonWatched.status
  );

  useEffect(() => {
    if (lessonWatched) {
      const segments: Segment[] = [];
      segments.push({
        start: 0,
        end: lessonWatched.presentWatch,
      });
      setWatchedSegments(segments);
      setIsUpdating(true);
    }
  }, [lessonWatched]);

  // Save watch progress for the CURRENT lesson
  const saveWatchProgress = async () => {
    if (!lesson?._id) return;

    if (!isUpdating) {
      await dispatch(
        createLessonWatched({
          studentId: std,
          courseId: id,
          lessonWatched: {
            lessonID: lesson.lessonID,
            videoID: lesson._id,
            completed: watchedSegments.some(
              (seg) => seg.end >= duration * 0.95
            ),
            videoTime: duration,
            presentWatch: Math.max(...watchedSegments.map((s) => s.end), 0),
          },
        })
      );
    } else {
      await dispatch(
        updateLessonWatched({
          studentId: std,
          courseId: id,
          lessonId: lesson.lessonID,
          videoId: lesson._id,
          lessonWatched: {
            lessonID: lesson.lessonID,
            videoID: lesson._id,
            completed: lessonWatched?.completed
              ? true
              : watchedSegments.some((seg) => seg.end >= duration * 0.95),
            videoTime: duration,
            presentWatch: lessonWatched?.completed
              ? duration
              : Math.max(...watchedSegments.map((s) => s.end), 0),
          },
        })
      );
    }
  };

  // const handleCloseVideo = async () => {
  //   await saveWatchProgress();
  //   setShowVideo(false);
  //   setLesson({});
  //   setIsUpdating(false);
  //   setWatchedSegments([]);
  //   setActiveLesson(null);
  // };

  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
    }
  }, [submitError]);

  if (courseLoading) {
    return (
      <div className="my-5 text-center">
        <span className="spinner-border"></span>
      </div>
    );
  }
  if (courseError) {
    return <div className="alert alert-danger">{courseError}</div>;
  }
  if (!currentCourse) {
    return <div className="text-center my-5">No course info found.</div>;
  }

  return (
    <>
      <Breadcrumb title="Course watch" />
      <div className="content pt-0">
        <div className="container-fluid">
          <div className="course-watch-section">
            <div className="row">
              {/* ========== LEFT SIDE: Lesson List ========== */}
              <div
                className="col-lg-4 border-end"
                style={{ maxHeight: "calc(100vh - 80px)" }}
              >
                <div className="progress-overview-section">
                  <div className="mb-4">
                    <Link
                      to={all_routes.studentCourses}
                      className="back-to-course"
                    >
                      <i className="isax isax-arrow-left me-1" />
                      Back to Course
                    </Link>
                  </div>
                  <h3>{currentCourse?.course.courseTitle}</h3>
                  <div className="mb-3 text-muted">
                    {currentCourse?.course.courseCategory} |{" "}
                    {currentCourse?.course.courseLevel}
                  </div>

                  {!showVideo && (
                    <img
                      alt="Course"
                      src={currentCourse?.course.courseThumbnailUrl}
                      className="img-fluid rounded mb-3"
                    />
                  )}

                  <div className="mb-4">
                    <div
                      className="small text-secondary"
                      dangerouslySetInnerHTML={{
                        __html: currentCourse?.course.courseDescription,
                      }}
                    />
                  </div>

                  {/* Curriculum Accordion */}
                  <div
                    className="accordions-items-seperate"
                    id="accordionSpacingExample"
                  >
                    {currentCourse?.course.curriculum.map(
                      (topic: any, i: number) => (
                        <div className="accordion-item" key={topic._id}>
                          <div className="accordion-header" id={`heading${i}`}>
                            <button
                              className={
                                "accordion-button" +
                                (i !== 0 ? " collapsed" : "")
                              }
                              type="button"
                              data-bs-toggle="collapse"
                              data-bs-target={`#collapse${i}`}
                              aria-expanded={i === 0 ? "true" : "false"}
                              aria-controls={`collapse${i}`}
                            >
                              <div>
                                <span className="d-block mb-1">
                                  Section {i + 1}
                                </span>
                                <h6 className="mb-0">{topic.topic}</h6>
                              </div>
                            </button>
                          </div>
                          <div
                            id={`collapse${i}`}
                            className={
                              "accordion-collapse collapse" +
                              (i === 0 ? " show" : "")
                            }
                            aria-labelledby={`heading${i}`}
                            data-bs-parent="#accordionSpacingExample"
                          >
                            <div className="accordion-body">
                              {topic.lessons.map((lessonItem: any) => {
                                const isActive =
                                  activeLesson === lessonItem._id;
                                return (
                                  <div
                                    className={`d-flex align-items-center justify-content-between mb-3 p-2 rounded ${
                                      isActive
                                        ? "bg-primary bg-opacity-10 border border-primary"
                                        : ""
                                    }`}
                                    style={{
                                      cursor: "pointer",
                                      transition: "all 0.2s",
                                    }}
                                    key={lessonItem._id}
                                    onClick={async (e) => {
                                      e.preventDefault();

                                      // Skip if already playing this lesson
                                      if (activeLesson === lessonItem._id)
                                        return;

                                      // 1. Save progress for current video FIRST
                                      if (showVideo && lesson?._id) {
                                        await saveWatchProgress();
                                      }

                                      // 2. Reset everything for new lesson
                                      setWatchedSegments([]);
                                      setDuration(0);
                                      setIsUpdating(false);

                                      // 3. Set new lesson data
                                      const newLesson = {
                                        ...lessonItem,
                                        lessonID: topic._id,
                                      };
                                      setVideoUrl(lessonItem?.videoUrl);
                                      setLesson(newLesson);
                                      setActiveLesson(lessonItem._id);

                                      // 4. Fetch watched status for the new lesson
                                      await dispatch(
                                        fetchLessonWatched({
                                          studentId: std,
                                          courseId: id,
                                          lessonId: topic._id,
                                          videoId: lessonItem._id,
                                        })
                                      );

                                      // 5. Show the player
                                      setShowVideo(true);
                                    }}
                                  >
                                    <div className="d-flex align-items-center">
                                      <span className="d-flex">
                                        <i
                                          className={`isax ${
                                            isActive
                                              ? "isax-pause-circle5 text-primary"
                                              : "isax-play-circle5 text-success"
                                          } fs-24 me-1`}
                                        />
                                      </span>
                                      <p
                                        className={`accordian-content mb-0 ${
                                          isActive
                                            ? "fw-semibold text-primary"
                                            : ""
                                        }`}
                                      >
                                        {lessonItem.name}
                                      </p>
                                    </div>
                                    {isActive && (
                                      <span className="badge bg-primary">
                                        Playing
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* ========== RIGHT SIDE: Video Player + Tabs ========== */}
              <div className="col-lg-8">
                <div className="course-watch-content">
                  {showVideo ? (
                    <div className="mb-4">
                      <VideoPlayer
                        key={activeLesson || videoUrl}
                        videoUrl={videoUrl}
                        setWatchedSegments={setWatchedSegments}
                        watchedSegments={watchedSegments}
                        duration={duration}
                        setDuration={setDuration}
                        completed={!!lessonWatched?.completed}
                      />
                    </div>
                  ) : (
                    <div className="position-relative video-btn mb-4">
                      <Link
                        to="#"
                        id="openVideoBtn"
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <img
                          className="img-fluid rounded"
                          src={currentCourse?.course.courseThumbnailUrl}
                          alt="Course"
                        />
                        <div className="play-icon">
                          <i className="fa-solid fa-play fs-28" />
                        </div>
                      </Link>
                      <p className="text-muted text-center mt-2">
                        Select a lesson from the left to start watching
                      </p>
                    </div>
                  )}

                  {/* Tabs */}
                  <ul
                    className="nav-tabs mb-4 nav-justified border-0 nav-style-1 d-sm-flex d-block"
                    role="tablist"
                  >
                    <li className="nav-item active">
                      <Link
                        className="btn nav-link active"
                        data-bs-toggle="tab"
                        role="tab"
                        to="#overview"
                        aria-selected="false"
                      >
                        Overview
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="btn nav-link"
                        data-bs-toggle="tab"
                        role="tab"
                        to="#notes"
                        aria-selected="false"
                      >
                        Notes
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="btn nav-link"
                        data-bs-toggle="tab"
                        role="tab"
                        to="#faq"
                        aria-selected="true"
                      >
                        Assignments
                      </Link>
                    </li>
                  </ul>
                  <div className="tab-content">
                    <div
                      className="tab-pane active show"
                      id="overview"
                      role="tabpanel"
                    >
                      <div className="mb-4">
                        <h6 className="fs-18 fw-semibold mb-1">
                          About this course
                        </h6>
                        <p>{currentCourse?.course.courseTitle}</p>
                      </div>
                      <div className="mb-4">
                        <h6 className="fs-18 fw-semibold mb-2">Description</h6>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: currentCourse?.course.courseDescription,
                          }}
                        />
                      </div>
                    </div>
                    <div className="tab-pane" id="notes" role="tabpanel">
                      <div className="mb-0">
                        <h6 className="fs-18 fw-semibold mb-1">Notes</h6>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: currentCourse?.course.notes,
                          }}
                        />
                      </div>
                    </div>
                    <div className="tab-pane" id="faq" role="tabpanel">
                      <div className="faq-accordion">
                        {assignment?.assignments?.map(
                          (assign: any, index: number) => {
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
                                              setOpenedAssignId(assign._id);
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
                                            value={
                                              submissionText[assign._id] || ""
                                            }
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
                                                    studentId: std,
                                                    courseId: id,
                                                    assignmentId: assign._id,
                                                    submissionText:
                                                      submissionText[
                                                        assign._id
                                                      ] || "",
                                                  })
                                                )
                                                  .unwrap()
                                                  .then(() => {
                                                    setOpenedAssignId(null);
                                                    toast.success(
                                                      "Submitted successful!"
                                                    );
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
                          }
                        )}
                      </div>
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

export default CourseWatch;