import axios from "axios";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
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
import VdoPlayer from "../../../core/common/video/vdoPlayer";
import { all_routes } from "../../router/all_routes";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const [submissionLinks, setSubmissionLinks] = useState<any>({});
  // #3.6 - a picked file per assignment. Kept as the File object, not a
  // data URL, so the upload streams instead of being base64-inflated.
  const [submissionFiles, setSubmissionFiles] = useState<any>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [lesson, setLesson] = useState<any>({});
  type Segment = { start: number; end: number };
  const [watchedSegments, setWatchedSegments] = useState<Segment[]>([]);
  const [duration, setDuration] = useState(0);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  // #33 LMS Guide. Its watch state is deliberately kept in throwaway local
  // state and never passed to saveWatchProgress (which is gated on
  // `lesson?._id`), so watching the Guide can never touch course progress,
  // lesson counts or completion percentages.
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideSegments, setGuideSegments] = useState<Segment[]>([]);
  const [guideDuration, setGuideDuration] = useState(0);

  // #39.5 — on a phone the curriculum sits BELOW the player, so picking a
  // lesson would leave the student looking at the list with the new video
  // offscreen above them. Scroll the player back into view after each pick.
  // Only below the lg breakpoint: on desktop both are already visible.
  const playerRef = useRef<HTMLDivElement | null>(null);
  const scrollToPlayer = () => {
    if (window.matchMedia("(min-width: 992px)").matches) return;
    playerRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };
  const [quizzes, setQuizzes] = useState<any[]>([]);
  // lessonID -> percent watched, for the sidebar progress ring (#30/T5.4)
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>(
    {}
  );

  // Refetch on mount and whenever the active lesson changes (i.e. after
  // switching away from one, once its progress has been saved) — NOT on
  // every watchedSegments update, which fires continuously during playback
  // and would otherwise spam this endpoint.
  useEffect(() => {
    if (!std || !id) return;
    axios
      .get(`${API_URL}/api/students/${std}/course/${id}/lessons-watched`)
      .then((res) => {
        const map: Record<string, number> = {};
        (res.data?.lessonWatched || []).forEach((lw: any) => {
          const pct =
            lw.videoTime > 0
              ? Math.min(100, Math.round((lw.presentWatch / lw.videoTime) * 100))
              : lw.completed
              ? 100
              : 0;
          map[lw.videoID] = pct;
        });
        setLessonProgress(map);
      })
      .catch(() => setLessonProgress({}));
  }, [std, id, activeLesson]);

  // Quiz tab (#29) — scoped to the selected lesson via quiz.lessonID.
  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_URL}/api/quizzes`, { params: { courseID: id } })
      .then((res) => setQuizzes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setQuizzes([]));
  }, [id]);

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
    // Need a lesson and a known duration; nothing to save if not watched yet.
    if (!lesson?._id || !duration || watchedSegments.length === 0) return;

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
      // Subsequent saves for this lesson should update, not re-create.
      setIsUpdating(true);
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

  // Keep a ref to the latest save fn so the interval / unmount / unload
  // handlers always call the current closure (fresh segments & duration).
  const saveRef = useRef<() => void>(() => {});
  useEffect(() => {
    saveRef.current = saveWatchProgress;
  });

  // Autosave progress while watching, on tab close, and on unmount — so a
  // single-lesson course (no lesson switch) still records progress.
  useEffect(() => {
    const interval = setInterval(() => {
      saveRef.current?.();
    }, 10000);
    const onBeforeUnload = () => saveRef.current?.();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", onBeforeUnload);
      saveRef.current?.();
    };
  }, []);

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
              {/* ========== LEFT SIDE: Lesson List ==========
                  #39 — on mobile the player must come first. The curriculum is
                  first in the DOM (so it renders on the left on desktop), which
                  meant phone users scrolled past every lesson to reach the
                  video. order-* flips that below the lg breakpoint without
                  moving any markup. */}
              <div
                className="col-lg-4 border-end order-2 order-lg-1"
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

                  {/* #33 LMS Guide — sits ABOVE the curriculum and is not a
                      module or lesson. Hidden entirely when no guide video is
                      configured for this course. */}
                  {currentCourse?.course?.lmsGuideVdoId && (
                    <button
                      type="button"
                      onClick={() => {
                        setGuideOpen(true);
                        setGuideSegments([]);
                        setGuideDuration(0);
                        scrollToPlayer();
                      }}
                      className={`w-100 text-start border rounded p-3 mb-3 lms-guide-card ${
                        guideOpen ? "border-primary bg-primary-transparent" : ""
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        <i className="isax isax-book5 text-primary fs-24 me-2" />
                        <div className="flex-grow-1">
                          <div className="fw-semibold">
                            {currentCourse.course.lmsGuideTitle ||
                              "How to use this LMS"}
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: 12.5 }}
                          >
                            Watch first &middot; does not affect your progress
                          </div>
                        </div>
                        {guideOpen && (
                          <span className="badge bg-primary ms-2">Playing</span>
                        )}
                      </div>
                    </button>
                  )}

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

                                      // Leaving the LMS Guide, if it was open.
                                      setGuideOpen(false);
                                      // #39.5 — bring the player back into view
                                      // on mobile, even for a re-tap of the
                                      // lesson already playing.
                                      scrollToPlayer();

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
                                      {(() => {
                                        const pct =
                                          lessonProgress[lessonItem._id] ?? 0;
                                        return (
                                          <span
                                            className="d-inline-flex align-items-center justify-content-center rounded-circle me-2 flex-shrink-0 position-relative"
                                            style={{
                                              width: 28,
                                              height: 28,
                                              background:
                                                pct > 0
                                                  ? `conic-gradient(var(--bs-success, #28a745) ${pct}%, #e9ecef ${pct}%)`
                                                  : "#e9ecef",
                                            }}
                                            title={`${pct}% watched`}
                                          >
                                            <span
                                              className="rounded-circle bg-white d-flex align-items-center justify-content-center"
                                              style={{
                                                width: 20,
                                                height: 20,
                                                fontSize: 9,
                                              }}
                                            >
                                              {isActive ? (
                                                <i
                                                  className={`isax ${
                                                    isActive
                                                      ? "isax-pause-circle5 text-primary"
                                                      : "isax-play-circle5 text-success"
                                                  }`}
                                                  style={{ fontSize: 14 }}
                                                />
                                              ) : (
                                                <span className="text-muted">
                                                  {pct}%
                                                </span>
                                              )}
                                            </span>
                                          </span>
                                        );
                                      })()}
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
              <div className="col-lg-8 order-1 order-lg-2">
                <div className="course-watch-content" ref={playerRef}>
                  {guideOpen && currentCourse?.course?.lmsGuideVdoId ? (
                    <div className="mb-4">
                      <VdoPlayer
                        key={`guide-${currentCourse.course.lmsGuideVdoId}`}
                        vdoId={currentCourse.course.lmsGuideVdoId}
                        courseId={id}
                        setWatchedSegments={setGuideSegments}
                        watchedSegments={guideSegments}
                        duration={guideDuration}
                        setDuration={setGuideDuration}
                        // Informational content — always freely seekable, and
                        // never gated behind the first-watch completion rule.
                        completed
                      />
                      <div className="mt-3">
                        <span className="badge bg-primary-transparent text-primary mb-2">
                          LMS Guide
                        </span>
                        <h5 className="mb-2">
                          {currentCourse.course.lmsGuideTitle ||
                            "How to use this LMS"}
                        </h5>
                        {currentCourse.course.lmsGuideDescription && (
                          <p className="text-muted mb-2">
                            {currentCourse.course.lmsGuideDescription}
                          </p>
                        )}
                        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                          This guide is not part of the course curriculum and is
                          not counted in your progress. Pick any lesson from the
                          curriculum to start learning.
                        </p>
                      </div>
                    </div>
                  ) : showVideo ? (
                    <div className="mb-4">
                      {lesson?.vdoId ? (
                        <VdoPlayer
                          key={activeLesson || lesson.vdoId}
                          vdoId={lesson.vdoId}
                          courseId={id}
                          setWatchedSegments={setWatchedSegments}
                          watchedSegments={watchedSegments}
                          duration={duration}
                          setDuration={setDuration}
                          completed={!!lessonWatched?.completed}
                        />
                      ) : (
                        <VideoPlayer
                          key={activeLesson || videoUrl}
                          videoUrl={videoUrl}
                          setWatchedSegments={setWatchedSegments}
                          watchedSegments={watchedSegments}
                          duration={duration}
                          setDuration={setDuration}
                          completed={!!lessonWatched?.completed}
                        />
                      )}
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

                  {/* Tabs — hidden while the LMS Guide is playing, since the
                      lesson tabs below belong to a lesson, not the guide. */}
                  <ul
                    className={`nav-tabs mb-4 nav-justified border-0 nav-style-1 d-sm-flex d-block${
                      guideOpen ? " d-none" : ""
                    }`}
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
                        to="#resources"
                        aria-selected="false"
                      >
                        Resources
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
                    <li className="nav-item">
                      <Link
                        className="btn nav-link"
                        data-bs-toggle="tab"
                        role="tab"
                        to="#quiz"
                        aria-selected="false"
                      >
                        Quiz
                      </Link>
                    </li>
                  </ul>
                  <div className={`tab-content${guideOpen ? " d-none" : ""}`}>
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
                      {showVideo && lesson?.name ? (
                        <div className="mb-4">
                          <h6 className="fs-18 fw-semibold mb-2">
                            {lesson.name}
                          </h6>
                          {lesson.description ? (
                            <p style={{ whiteSpace: "pre-wrap" }}>
                              {lesson.description}
                            </p>
                          ) : (
                            <p className="text-muted mb-0">
                              No description added for this lesson yet.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4">
                          <h6 className="fs-18 fw-semibold mb-2">Description</h6>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currentCourse?.course.courseDescription,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="tab-pane" id="resources" role="tabpanel">
                      <div className="mb-0">
                        <h6 className="fs-18 fw-semibold mb-2">
                          {showVideo && lesson?.name
                            ? `Resources for "${lesson.name}"`
                            : "Resources"}
                        </h6>
                        {!showVideo ? (
                          <p className="text-muted mb-0">
                            Select a lesson to see its resources.
                          </p>
                        ) : !lesson?.resources?.length ? (
                          <p className="text-muted mb-0">
                            No resources added for this lesson yet.
                          </p>
                        ) : (
                          <ul className="list-unstyled">
                            {lesson.resources.map((r: any, ri: number) => (
                              <li
                                key={ri}
                                className="d-flex align-items-start mb-3"
                              >
                                <i className="isax isax-link-21 me-2 mt-1 text-secondary" />
                                <div>
                                  <a
                                    href={r.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="fw-semibold"
                                  >
                                    {r.title || r.link}
                                  </a>
                                  {r.description && (
                                    <p className="mb-0 text-muted small">
                                      {r.description}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
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

                                      {(() => {
                                        const mySubmission =
                                          currentCourse?.progress?.assignments?.find(
                                            (a: any) =>
                                              a.assignmentsID === assign._id
                                          );
                                        const status =
                                          mySubmission?.status || "Pending";
                                        const canSubmit =
                                          status === "Pending" ||
                                          status === "Needs Revision";
                                        const badgeClass =
                                          {
                                            Pending: "bg-light text-dark",
                                            "Under Review": "bg-warning",
                                            Reviewed: "bg-info",
                                            "Needs Revision": "bg-danger",
                                            Completed: "bg-success",
                                          }[status] || "bg-light text-dark";
                                        return (
                                          <>
                                            <div className="mb-3">
                                              <span
                                                className={`badge ${badgeClass}`}
                                              >
                                                {status}
                                              </span>
                                            </div>
                                            {mySubmission?.feedback && (
                                              <div className="mb-3 p-3 bg-light rounded">
                                                <p className="fw-semibold mb-1">
                                                  Instructor Feedback
                                                </p>
                                                <p className="mb-0">
                                                  {mySubmission.feedback}
                                                </p>
                                                {mySubmission.marks !=
                                                  null && (
                                                  <p className="mb-0 fw-semibold mt-1">
                                                    Marks: {mySubmission.marks}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                            <div className="d-flex justify-content-between">
                                              <div>
                                                <h6 className="fs-18 fw-semibold mb-2">
                                                  Due Date
                                                </h6>
                                                <p
                                                  className={`mb-0 ${textClass} fw-bold`}
                                                >
                                                  {moment(
                                                    assign.lastDate
                                                  ).format("DD MMM YYYY")}
                                                </p>
                                              </div>
                                              {canSubmit && (
                                                <div>
                                                  <button
                                                    className="btn btn-secondary d-flex align-items-center"
                                                    onClick={() => {
                                                      setOpenedAssignId(
                                                        assign._id
                                                      );
                                                    }}
                                                  >
                                                    <i className="isax isax-add-circle me-1" />
                                                    {status === "Needs Revision"
                                                      ? "Resubmit Assignment"
                                                      : "Fill Assignment"}
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </>
                                        );
                                      })()}

                                      {openedAssignId === assign._id && (
                                        <div className="mt-4 shadow border border-muted p-4 pt-2 rounded">
                                          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                                            <h6>Fill Assignment</h6>
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
                                            placeholder="Enter your written answer"
                                            onChange={(e) =>
                                              setSubmissionText({
                                                ...submissionText,
                                                [assign._id]: e.target.value,
                                              })
                                            }
                                          />
                                          <div className="mt-3">
                                            <label className="form-label">
                                              Links{" "}
                                              <small className="text-muted">
                                                (optional — one per line)
                                              </small>
                                            </label>
                                            <textarea
                                              className="form-control"
                                              rows={2}
                                              placeholder="https://..."
                                              value={
                                                submissionLinks[assign._id] ||
                                                ""
                                              }
                                              onChange={(e) =>
                                                setSubmissionLinks({
                                                  ...submissionLinks,
                                                  [assign._id]: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div className="mt-3">
                                            <label className="form-label">
                                              Attachment{" "}
                                              <small className="text-muted">
                                                (optional - PDF, DOC, image or
                                                ZIP, up to 20 MB)
                                              </small>
                                            </label>
                                            <input
                                              type="file"
                                              className="form-control"
                                              onChange={(e) => {
                                                const f =
                                                  e.target.files?.[0] || null;
                                                if (
                                                  f &&
                                                  f.size > 20 * 1024 * 1024
                                                ) {
                                                  // Checked here as well as on
                                                  // the server so the student
                                                  // is told before sitting
                                                  // through the whole upload.
                                                  toast.error(
                                                    "That file is larger than 20 MB."
                                                  );
                                                  e.target.value = "";
                                                  return;
                                                }
                                                setSubmissionFiles({
                                                  ...submissionFiles,
                                                  [assign._id]: f,
                                                });
                                              }}
                                            />
                                            {submissionFiles[assign._id] && (
                                              <small className="text-muted d-block mt-1">
                                                {
                                                  submissionFiles[assign._id]
                                                    .name
                                                }
                                              </small>
                                            )}
                                          </div>
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
                                                    links: (
                                                      submissionLinks[
                                                        assign._id
                                                      ] || ""
                                                    )
                                                      .split("\n")
                                                      .map((l) => l.trim())
                                                      .filter(Boolean),
                                                    file:
                                                      submissionFiles[
                                                        assign._id
                                                      ] || null,
                                                  })
                                                )
                                                  .unwrap()
                                                  .then(() => {
                                                    setOpenedAssignId(null);
                                                    setSubmissionFiles(
                                                      (prev: any) => ({
                                                        ...prev,
                                                        [assign._id]: null,
                                                      })
                                                    );
                                                    toast.success(
                                                      "Submitted successful!"
                                                    );
                                                    if (std && id) {
                                                      dispatch(
                                                        fetchStudentCourseDetail({
                                                          studentId: std,
                                                          courseId: id,
                                                        }) as any
                                                      );
                                                    }
                                                  })
                                                  .catch((err: any) => {
                                                    toast.error(
                                                      err?.message ||
                                                        "Submission failed."
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
                    <div className="tab-pane" id="quiz" role="tabpanel">
                      {!showVideo ? (
                        <p className="text-muted mb-0">
                          Select a lesson to see its quiz.
                        </p>
                      ) : (
                        (() => {
                          const lessonQuizzes = quizzes.filter(
                            (q) => q.lessonID === lesson?._id
                          );
                          if (!lessonQuizzes.length) {
                            return (
                              <p className="text-muted mb-0">
                                No quiz for this lesson yet.
                              </p>
                            );
                          }
                          return lessonQuizzes.map((q) => (
                            <div className="card mb-3" key={q._id}>
                              <div className="card-body d-flex align-items-center justify-content-between">
                                <div>
                                  <h6 className="mb-1">{q.title}</h6>
                                  <p className="mb-0 text-muted small">
                                    {q.questions?.length ?? 0} Questions ·{" "}
                                    {q.totalMarks} Marks
                                  </p>
                                </div>
                                <Link
                                  to={`${all_routes.studentQuizQuestion}?id=${q._id}`}
                                  className="btn btn-secondary"
                                >
                                  Take Quiz
                                </Link>
                              </div>
                            </div>
                          ));
                        })()
                      )}
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