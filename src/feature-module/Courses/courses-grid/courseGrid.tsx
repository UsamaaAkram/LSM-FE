import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { fetchCourses } from "../../../core/redux/courses";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import { WHATSAPP_ENROLL } from "../../../core/common/bluverseLinks";
import { all_routes } from "../../router/all_routes";

const CourseGrid = () => {
  const dispatch = useDispatch<AppDispatch>();
  const route = all_routes;
  const { courses, loading } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses({ status: "published" }) as any);
  }, [dispatch]);

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
                const hasDiscount =
                  c.originalPrice && c.originalPrice > (c.price || 0);
                return (
                  <div className="col-lg-4 col-md-6" key={c._id}>
                    <div className="card h-100 shadow-sm border-0 course-card">
                      <div className="card-img-top overflow-hidden rounded-top">
                        <Link to={`${route.courseDetails}?id=${c._id}`}>
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
                            to={`${route.courseDetails}?id=${c._id}`}
                            className="text-dark"
                          >
                            {c.courseTitle}
                          </Link>
                        </h5>

                        {(c.price > 0 || hasDiscount) && (
                          <div className="mb-3 d-flex align-items-center gap-2">
                            {hasDiscount && (
                              <span className="text-muted text-decoration-line-through">
                                Rs {Number(c.originalPrice).toLocaleString()}
                              </span>
                            )}
                            <span className="fs-18 fw-bold text-secondary">
                              Rs {Number(c.price || 0).toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="mt-auto d-flex gap-2">
                          <a
                            href={WHATSAPP_ENROLL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary w-100"
                          >
                            Enroll Now
                          </a>
                          <Link
                            to={`${route.courseDetails}?id=${c._id}`}
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
