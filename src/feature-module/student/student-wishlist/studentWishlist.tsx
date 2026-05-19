import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import StudentSidebar from "../common/studentSidebar";
import { all_routes } from "../../router/all_routes";
import { fetchStudentWishlistCourses } from "../../../core/redux/studentWishlistSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import ProfileCard from "../common/profileCard";

const StudentWishlist = () => {
  const route = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const authUser: any = useSelector<RootState>((state) => state.auth.user);
  const studentWishlist: any = useSelector<RootState>(
    (state: any) => state.studentWishlist
  );

  // Pagination
  const perPage = 6;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(studentWishlist.courses.length / perPage);
  const pageCourses = studentWishlist.courses.slice(
    (page - 1) * perPage,
    page * perPage
  );

  useEffect(() => {
    if (authUser?._id) {
      dispatch(fetchStudentWishlistCourses(authUser._id));
    }
  }, [authUser?._id, dispatch]);

  useEffect(() => {
    setPage(1);
  }, [studentWishlist.courses]);

  return (
    <>
      <Breadcrumb title="Wishlist" />
      <div className="content">
        <div className="container">
          {/* Profile box can go here */}
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5>Wishlist</h5>
              </div>
              {studentWishlist.loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border"></span>
                </div>
              ) : pageCourses.length === 0 ? (
                <div className="py-5 text-center">No courses in wishlist.</div>
              ) : (
                <div className="row">
                  {pageCourses.map((course: any, idx: any) => (
                    <div
                      className="col-xl-4 col-md-6 d-flex"
                      key={course._id || idx}
                    >
                      <div className="course-item p-3 course-item-two w-100">
                        <div className="position-relative overflow-hidden rounded-3">
                          <div className="course-img">
                            <Link
                              to={`${route.courseDetails}?id=${course._id}`}
                            >
                              <ImageGlobal
                                src={course?.courseThumbnailUrl ?? ""}
                                alt={course.courseTitle}
                                className="cover"
                              />
                            </Link>
                          </div>
                          <div className="position-absolute start-0 top-0 d-flex align-items-start w-100 z-index-2 p-2">
                            <span
                              className="fav-icon like selected"
                              tabIndex={-1}
                            >
                              <i className="isax isax-heart not-filled" />
                              <i className="isax isax-heart5 filled-heart" />
                            </span>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                            {course.createdBy}
                          </span>
                          <span className="badge badge-light rounded-pill bg-light d-inline-flex align-items-center fs-13 fw-medium mb-0">
                            {course.courseCategory}
                          </span>
                        </div>
                        <h6 className="mt-3 mb-2 text-truncate">
                          <Link to={`${route.courseDetails}?id=${course._id}`}>
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
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="row align-items-center">
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentWishlist;
