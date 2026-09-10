import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { fetchCourseById, fetchCourseBySlug } from "../../../core/redux/courses";
import { all_routes } from "../../router/all_routes";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import moment from "moment";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../core/redux/studentSlice";
import { fetchStudentEnrolledCourses } from "../../../core/redux/studentCoursesSlice";
import { whatsappInquiry } from "../../../core/common/bluverseLinks";
import {
  formatPrice,
  hasCompareAt,
  hasPrice,
} from "../../../core/common/coursePrice";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// Static category logo (#38) — the old play-button preview opened a video
// modal for `courseVideoUrl`, a field with no input anywhere in the course
// creation form, so it was always empty: every click was a dead end that
// misled students into thinking they could preview real lesson content
// pre-enrollment. courseCategory is free-text, so this matches by keyword
// rather than an exact enum.
function getCategoryLogo(category: string | undefined): {
  icon: string;
  brand?: boolean;
} {
  const c = (category || "").toLowerCase();
  if (c.includes("tiktok")) return { icon: "fa-brands fa-tiktok", brand: true };
  if (c.includes("youtube")) return { icon: "fa-brands fa-youtube", brand: true };
  if (c.includes("ai")) return { icon: "isax isax-cpu" };
  if (c.includes("edit")) return { icon: "isax isax-scissor" };
  return { icon: "isax isax-video" };
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CourseDetails = () => {
  const query = useQuery();
  const id = query.get("id");
  // #48 — this page serves both /courses/<slug> and the legacy
  // /courses/details?id=<id>, so shared links from either era keep working.
  const { slug } = useParams<{ slug?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const auth: any = useSelector<RootState>((state: any) => state.auth.user);
  const { currentCourse, loading, error } = useSelector(
    (state: any) =>
      state.courses || { currentCourse: null, loading: false, error: null }
  );
  const enrolledCourses = useSelector(
    (state: any) => state.studentCourses?.courses || []
  );

  useEffect(() => {
    // Slug wins when present; ?id= is the legacy path.
    if (slug) dispatch(fetchCourseBySlug(slug) as any);
    else if (id) dispatch(fetchCourseById(id) as any);
  }, [dispatch, id, slug]);

  // Load the student's enrolled courses so we can gate access (paid vs not)
  useEffect(() => {
    if (auth?.role === "student" && auth?._id) {
      dispatch(fetchStudentEnrolledCourses(auth._id) as any);
    }
  }, [dispatch, auth?._id, auth?.role]);

  const route = all_routes;

  // Render content using expected API object
  if (loading)
    return <div className="text-center py-5">Loading currentCourse...</div>;
  if (error) return <div className="text-danger py-3">{error}</div>;
  if (!currentCourse)
    return <div className="text-center py-5">No course found.</div>;

  // Course duration is now a free-text field (#2.4, no longer HH:mm:ss —
  // that format capped courses at 24h), so it's shown as entered.
  function formatDuration(duration: string) {
    return duration || "";
  }

  const isEnrolled: boolean = Array.isArray(enrolledCourses)
    ? enrolledCourses.some((c: any) => c._id === currentCourse._id)
    : false;

  const isWishlisted: any = auth?.wishlist?.includes(currentCourse._id);
  const handleWishlist = async () => {
    if (!auth?._id || !currentCourse._id) return;
    try {
      if (isWishlisted) {
        await dispatch(
          removeFromWishlist({
            studentId: auth._id,
            courseId: currentCourse._id,
          }) // _id is student's id
        ).unwrap();
        toast.success("Removed from Wishlist");
      } else {
        await dispatch(
          addToWishlist({ studentId: auth._id, courseId: currentCourse._id })
        ).unwrap();
        toast.success("Added to Wishlist");
      }
    } catch (e: any) {
      toast.error(e?.message || "Operation failed");
    }
  };

  return (
    <>
      <Breadcrumb title="Course Detail" />
      <section className="course-details-two">
        <div className="container">
          <div className="mb-4">
            <Link
              to={
                auth?.role === "instructor" || auth?.role === "admin"
                  ? all_routes.instructorCourse
                  : auth?.role === "student"
                  ? all_routes.studentCourses
                  : all_routes.homeone
              }
              className="back-to-course"
            >
              <i className="isax isax-arrow-left me-1" />
              Back to Courses
            </Link>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card bg-light">
                <div className="card-body d-lg-flex align-items-center">
                  <div
                    className="position-relative d-flex align-items-center justify-content-center bg-primary-transparent rounded-3"
                    style={{ height: 150, width: 150 }}
                    title={currentCourse.courseCategory}
                  >
                    <i
                      className={`${
                        getCategoryLogo(currentCourse.courseCategory).icon
                      } text-primary`}
                      style={{ fontSize: 48 }}
                    />
                  </div>
                  <div className="w-100 ps-lg-4">
                    <h3 className="mb-2">{currentCourse.courseTitle}</h3>
                    <div className="d-flex align-items-center gap-2 gap-sm-3 gap-xl-4 flex-wrap justify-content-md-start justify-content-center">
                      <p className="fw-medium  d-flex align-items-center mb-0">
                        <ImageWithBasePath
                          className="me-2"
                          src="./assets/img/icons/book.svg"
                          alt="img"
                        />
                        {currentCourse.curriculum?.reduce(
                          (a: number, c: any) => a + c.lessons.length,
                          0
                        ) || 0}{" "}
                        Lessons
                      </p>
                      <p className="fw-medium  d-flex align-items-center mb-0">
                        <ImageWithBasePath
                          className="me-2"
                          src="./assets/img/icons/timer-start.svg"
                          alt="img"
                        />
                        {formatDuration(currentCourse.duration) || "N/A"}
                      </p>

                      <span className="badge badge-sm rounded-pill bg-warning fs-12">
                        {currentCourse.courseCategory}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-lg-8">
              <div className="course-page-content pt-0">
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="mb-3">Overview</h5>
                    {/* Render HTML description safely */}
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: currentCourse.courseDescription,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h5 className="mb-3 mt-2">Curriculum</h5>
                  <ul className="custom-list mb-3">
                    {currentCourse.curriculum?.map((topic: any) => (
                      <li
                        key={topic._id || topic.topic}
                        className="list-item mb-3"
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span>
                            <i className="isax isax-book fs-18 text-primary" />
                          </span>
                          <strong className="fs-16">{topic.topic}</strong>
                        </div>
                        <ul className="list-unstyled ms-4">
                          {topic.lessons?.map((lesson: any) => (
                            <li
                              key={lesson._id || lesson.name}
                              className="mb-2"
                            >
                              <div className="d-flex align-items-center gap-2">
                                <span>
                                  <i className="isax isax-play fs-16 text-success" />
                                </span>
                                <span className="fw-medium">{lesson.name}</span>
                              </div>
                              {lesson.description && (
                                <div className="ms-4 mt-1 text-muted small">
                                  {lesson.description}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="course-sidebar-sec mt-0">
                {auth?.role === "student" && (
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="d-flex justify-content-between gap-3 wishlist-btns">
                        <button
                          className={`btn w-100 btn-enroll ${
                            isWishlisted
                              ? "btn-danger badge-danger-hover"
                              : "btn-secondary"
                          }`}
                          onClick={() => handleWishlist()}
                        >
                          <i
                            className={`isax isax-heart${
                              isWishlisted ? "" : "-outline"
                            } me-1 fs-18`}
                          />
                          {isWishlisted
                            ? "Remove to Wishlist"
                            : "Add to Wishlist"}
                        </button>
                        {isEnrolled || currentCourse.freeAccess ? (
                          <Link
                            to={`${route.courseWatch}?id=${currentCourse._id}&&std=${auth?._id}`}
                            className="btn btn-primary w-100 btn-enroll"
                          >
                            {isEnrolled ? "Watch Now" : "Start Learning"}
                          </Link>
                        ) : (
                          <Link
                            to={`${route.enroll}?course=${currentCourse._id}`}
                            className="btn btn-primary w-100 btn-enroll"
                          >
                            Enroll Now
                          </Link>
                        )}
                      </div>
                      {/* #47.1 — WhatsApp is for pre-enrollment questions;
                          the enrollment itself stays inside the LMS. */}
                      {!isEnrolled && !currentCourse.freeAccess && (
                        <a
                          href={whatsappInquiry(currentCourse.courseTitle)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success w-100 mt-2"
                        >
                          <i className="isax isax-message-text me-1" />
                          Chat on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {!auth && (
                  <div className="card mb-4">
                    <div className="card-body">
                      {currentCourse.freeAccess && (
                        <span className="badge bg-success-transparent text-success mb-3">
                          Free Access
                        </span>
                      )}
                      {(hasPrice(currentCourse.price) ||
                        hasCompareAt(
                          currentCourse.originalPrice,
                          currentCourse.price
                        )) && (
                        <div className="mb-3 d-flex align-items-center gap-2">
                          {hasCompareAt(
                            currentCourse.originalPrice,
                            currentCourse.price
                          ) && (
                            <span className="text-muted text-decoration-line-through">
                              {formatPrice(currentCourse.originalPrice)}
                            </span>
                          )}
                          <span className="fs-22 fw-bold text-secondary">
                            {formatPrice(currentCourse.price)}
                          </span>
                        </div>
                      )}
                      <Link
                        to={`${route.enroll}?course=${currentCourse._id}`}
                        className="btn btn-primary w-100 btn-enroll"
                      >
                        Enroll Now
                      </Link>
                      <a
                        href={whatsappInquiry(currentCourse.courseTitle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-success w-100 mt-2"
                      >
                        <i className="isax isax-message-text me-1" />
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                )}
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="subs-title mb-4">Includes</h5>
                    <p className="mb-3">
                      <ImageWithBasePath
                        className="me-2"
                        src="./assets/img/icons/key.svg"
                        alt="img"
                      />
                      Lifetime Access
                    </p>
                    <p className="mb-3">
                      <ImageWithBasePath
                        className="me-2"
                        src="./assets/img/icons/cloud-lightning.svg"
                        alt="img"
                      />
                      Assignments
                    </p>
                    <p className="mb-3">
                      <ImageWithBasePath
                        className="me-2"
                        src="./assets/img/icons/note.svg"
                        alt="img"
                      />
                      Quizzes
                    </p>
                    <p className="mb-0">
                      <ImageWithBasePath
                        className="me-2"
                        src="./assets/img/icons/teacher.svg"
                        alt="img"
                      />
                      Community Access
                    </p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-body cou-features">
                    <h5 className="subs-title">Course Features</h5>

                    <ul>
                      <li>
                        <p className="mb-0">
                          <ImageWithBasePath
                            className="me-2"
                            src="./assets/img/icons/timer-start3.svg"
                            alt="img"
                          />
                          Duration:{" "}
                          {formatDuration(currentCourse.duration) || "N/A"}
                        </p>
                      </li>
                      <li>
                        <p className="mb-0">
                          <ImageWithBasePath
                            className="me-2"
                            src="./assets/img/icons/note.svg"
                            alt="img"
                          />
                          Chapters: {currentCourse.curriculum?.length || 0}
                        </p>
                      </li>
                      <li>
                        <p className="mb-0">
                          <ImageWithBasePath
                            className="me-2"
                            src="./assets/img/icons/play3.svg"
                            alt="img"
                          />
                          Videos:{" "}
                          {currentCourse.curriculum?.reduce(
                            (a: number, c: any) => a + c.lessons.length,
                            0
                          ) || 0}
                        </p>
                      </li>
                      <li>
                        <p className="mb-0 capitalize">
                          <ImageWithBasePath
                            className="me-2"
                            src="./assets/img/icons/chart.svg"
                            alt="img"
                          />
                          Level: {currentCourse.courseLevel || "N/A"}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CourseDetails;
