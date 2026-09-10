import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { fetchCourses } from "../../../core/redux/courses";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import {
  formatPrice,
  hasCompareAt,
  hasPrice,
} from "../../../core/common/coursePrice";
import { all_routes } from "../../router/all_routes";
import { courseUrl } from "../../../core/common/courseLink";

const CourseGrid = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = all_routes;
  const { courses, loading } = useSelector((state: RootState) => state.courses);
  const currentUser = useSelector((state: RootState) => (state as any).auth.user);

  useEffect(() => {
    dispatch(fetchCourses({ status: "published" }) as any);
  }, [dispatch]);

  const isEnrolled = (courseId: string) =>
    currentUser?.role === "student" &&
    (currentUser?.enrolledCourses || []).some(
      (id: string) => id?.toString() === courseId?.toString()
    );

  return (
    <>
      <Breadcrumb title="Courses" />

      <section className="course-content">
        <div className="container">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: 620 }}>
            <h2 className="mb-2">Explore Our Courses</h2>
            <p className="text-muted mb-0">
              Master content creation, monetization, and digital skills — pick a
              course and start earning online.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border" />
            </div>
          ) : !courses?.length ? (
            <div className="text-center text-muted py-5">
              No courses available yet.
            </div>
          ) : (
            <div className="row row-gap-4">
              {courses.map((c: any) => {
                const showCompareAt = hasCompareAt(c.originalPrice, c.price);
                const showPrice = hasPrice(c.price) || showCompareAt;
                return (
                  <div className="col-lg-4 col-md-6" key={c._id}>
                    <div className="card h-100 shadow-sm border-0 course-card">
                      <div className="card-img-top overflow-hidden rounded-top">
                        <Link to={courseUrl(c)}>
                          <ImageGlobal
                            src={c.courseThumbnailUrl}
                            alt={c.courseTitle}
                            height={200}
                          />
                        </Link>
                      </div>
                      <div className="card-body d-flex flex-column">
                        {c.courseCategory && (
                          <span className="badge bg-primary-transparent text-primary rounded-pill mb-2 align-self-start">
                            {c.courseCategory}
                          </span>
                        )}
                        <h5 className="mb-2">
                          <Link
                            to={courseUrl(c)}
                            className="text-dark"
                          >
                            {c.courseTitle}
                          </Link>
                        </h5>

                        {c.duration && (
                          <div className="mb-2 text-muted d-flex align-items-center" style={{ fontSize: 13 }}>
                            <i className="isax isax-clock me-1" />
                            {c.duration}
                          </div>
                        )}

                        {c.freeAccess && (
                          <span className="badge bg-success-transparent text-success rounded-pill mb-2 align-self-start">
                            Free Access
                          </span>
                        )}
                        {showPrice && !c.freeAccess && (
                          <div className="mb-3 d-flex align-items-center gap-2">
                            {showCompareAt && (
                              <span className="text-muted text-decoration-line-through">
                                {formatPrice(c.originalPrice)}
                              </span>
                            )}
                            <span className="fs-18 fw-bold text-secondary">
                              {formatPrice(c.price)}
                            </span>
                          </div>
                        )}

                        <div className="mt-auto d-flex gap-2">
                          {isEnrolled(c._id) || c.freeAccess ? (
                            <Link
                              to={`${route.courseWatch}?id=${c._id}&std=${currentUser?._id}`}
                              className="btn btn-primary w-100"
                            >
                              {isEnrolled(c._id) ? "Watch Now" : "Start Learning"}
                            </Link>
                          ) : (
                            // #47 — Enroll Now starts the real in-LMS flow.
                            // WhatsApp stays available on the course detail
                            // and enrollment pages for questions.
                            <Link
                              to={`${route.enroll}?course=${c._id}`}
                              className="btn btn-primary w-100"
                            >
                              Enroll Now
                            </Link>
                          )}
                          <Link
                            to={courseUrl(c)}
                            className="btn btn-outline-secondary w-100"
                          >
                            Course Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CourseGrid;
