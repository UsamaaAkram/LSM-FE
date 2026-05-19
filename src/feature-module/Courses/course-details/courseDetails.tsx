import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { fetchCourseById } from "../../../core/redux/courses";
import VideoModal from "../../HomePages/home-one/section/videoModal";
import { all_routes } from "../../router/all_routes";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import moment from "moment";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../core/redux/studentSlice";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "../../../core/redux/store";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const CourseDetails = () => {
  const query = useQuery();
  const id = query.get("id");
  const dispatch = useDispatch<AppDispatch>();
  const auth: any = useSelector<RootState>((state: any) => state.auth.user);
  const { currentCourse, loading, error } = useSelector(
    (state: any) =>
      state.courses || { currentCourse: null, loading: false, error: null }
  );

  const [showModal, setShowModal] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id) as any);
    }
  }, [dispatch, id]);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const route = all_routes;

  // Render content using expected API object
  if (loading)
    return <div className="text-center py-5">Loading currentCourse...</div>;
  if (error) return <div className="text-danger py-3">{error}</div>;
  if (!currentCourse)
    return <div className="text-center py-5">No course found.</div>;

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
                  <div className="position-relative">
                    <Link
                      to="#"
                      id="openVideoBtn"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenModal();
                      }}
                    >
                      <ImageGlobal
                        src={currentCourse.courseThumbnailUrl}
                        alt="Course Thumbnail"
                        height={150}
                      />
                      <div
                        className="play-icon"
                        style={{
                          cursor: "pointer",
                          height: "50px",
                          width: "50px",
                        }}
                      >
                        <i className="ti ti-player-play-filled fs-28" />
                      </div>
                    </Link>
                  </div>
                  <div id="videoModal">
                    <div className="modal-content1">
                      <span className="close-btn" id="closeModal">
                        ×
                      </span>
                      <VideoModal
                        show={showModal}
                        handleClose={handleCloseModal}
                        videoUrl={currentCourse.courseVideoUrl}
                        setWatchedSegments={() => {}}
                        watchedSegments={[]}
                        duration={duration}
                        setDuration={setDuration}
                      />
                    </div>
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
                        <Link
                          to={`${route.courseWatch}?id=${currentCourse._id}&&std=${auth?._id}`}
                          className="btn btn-primary w-100 btn-enroll"
                        >
                          Watch Now
                        </Link>
                      </div>
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
                      Full lifetime access
                    </p>
                    <p className="mb-3">
                      <ImageWithBasePath
                        className="me-2"
                        src="./assets/img/icons/monitor-mobbile.svg"
                        alt="img"
                      />
                      Access on mobile and TV
                    </p>
                    <p className="mb-3">
                      <ImageWithBasePath
                        className="me-2"
                        src="./assets/img/icons/cloud-lightning.svg"
                        alt="img"
                      />
                      Assignments
                    </p>
                    <p className="mb-0">
                      <ImageWithBasePath
                        className="me-2"
                        src="./assets/img/icons/teacher.svg"
                        alt="img"
                      />
                      Certificate of Completion
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
