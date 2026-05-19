import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { fetchStudentEnrolledCourses } from "../../../core/redux/studentCoursesSlice";
import { all_routes } from "../../router/all_routes";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";

const StudentCourse = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.auth.user);
  const { courses, loading } = useSelector(
    (state: any) => state.studentCourses
  );

  // PAGINATION STATE
  const perPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(courses.length / perPage);
  const paginatedCourses = courses.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchStudentEnrolledCourses(currentUser._id) as any);
    }
  }, [currentUser?._id, dispatch]);

  // When courses change, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [courses]);

  return (
    <>
      <Breadcrumb title="Enrolled Courses" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex flex-wrap gap-3 align-items-center justify-content-between">
                <h5>Enrolled Courses</h5>
              </div>
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border"></span>
                </div>
              ) : paginatedCourses.length === 0 ? (
                <div className="py-5 text-center">
                  No enrolled courses found.
                </div>
              ) : (
                <div className="row">
                  {paginatedCourses.map((course: any, idx: number) => (
                    <div className="col-xl-4 col-md-6" key={course._id || idx}>
                      <div className="course-item-two course-item p-3 mx-0">
                        <div className="course-img">
                          <Link to={`${route.courseDetails}?id=${course._id}`}>
                            <ImageGlobal
                              src={course?.courseThumbnailUrl ?? ""}
                              alt={course.courseTitle}
                              className="cover"
                            />
                          </Link>
                        </div>
                        <div className="course-content">
                          <div className="d-flex justify-content-between mb-2">
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              {course.createdBy}
                            </span>
                            <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                              {course.courseCategory}
                            </span>
                          </div>
                          <h6 className="title mb-2 text-truncate">
                            <Link
                              to={`${route.courseDetails}?id=${course._id}`}
                            >
                              {course.courseTitle}
                            </Link>
                          </h6>
                          <div className="d-flex align-items-center justify-content-between">
                            <h5 className="text-secondary mb-0"></h5>
                            <Link
                              to={`${route.courseDetails}?id=${course._id}`}
                              className="btn btn-secondary btn-sm d-inline-flex align-items-center mt-2 mb-1"
                            >
                              View Course{" "}
                              <i className="isax isax-arrow-right-3 ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* /pagination */}
              {totalPages > 1 && (
                <div className="row align-items-center mt-2">
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
                          className={`page-item ${
                            page === i + 1 ? "active" : ""
                          }`}
                          key={i}
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
              {/* /pagination */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentCourse;
