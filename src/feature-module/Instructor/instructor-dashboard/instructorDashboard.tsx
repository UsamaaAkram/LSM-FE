import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../router/all_routes";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

import { useDispatch } from "react-redux";
import { fetchCourses } from "../../../core/redux/courses";
import type { AppDispatch } from "../../../core/redux/store";
import { getAllStudents } from "../../../core/redux/studentSlice";

const InstructorDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(fetchCourses({}));
    dispatch(getAllStudents());
  }, [dispatch]);
  const { courses } = useSelector(
    (state: any) =>
      state.courses || { courses: [], loading: false, error: null }
  );

  const { students } = useSelector(
    (state: any) =>
      state.student
  );


  // Calculate Stats
  const totalCourses = courses.length;

  const totalPublishedCourses = useMemo(
    () => courses.filter((c: any) => c.status === "published").length,
    [courses]
  );

  const topRecentCourses = useMemo(
    () =>
      [...courses]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [courses]
  );

  // Unique enrolled course count (each course only counted once)
  const enrolledCourseSet = useMemo(() => {
    const set = new Set<string>();
    students?.forEach((student: any) => {
      (student.enrolledCourses || []).forEach((courseId: string) => {
        set.add(courseId);
      });
    });
    return set;
  }, [students]);
  const enrolledCoursesCount = enrolledCourseSet.size;

  // All-time unique student count
  const totalStudents = students.length;

  return (
    <>
      <Breadcrumb title="Dashboard" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />
            {/* /Sidebar */}
            <div className="col-lg-9">
              <div className="row">
                <div className="col-md-6 col-xl-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-primary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/graduation.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Enrolled Courses</span>
                          <h4 className="fs-24 mt-1">{enrolledCoursesCount}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-secondary-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/book.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Published Courses</span>
                          <h4 className="fs-24 mt-1">
                            {totalPublishedCourses}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-info-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/user-octagon.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Total Students</span>
                          <h4 className="fs-24 mt-1">{totalStudents}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-blue-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/book-2.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Total Courses</span>
                          <h4 className="fs-24 mt-1">{totalCourses}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h5 className="mb-3 fw-bold">Recently Created Courses</h5>
              <div className="table-responsive custom-table">
                <table className="table">
                  <thead className="thead-light">
                    <tr>
                      <th>Courses</th>
                      <th>Enrolled</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRecentCourses.map((course: any) => (
                      <tr key={course._id}>
                        <td>
                          <div className="course-title d-flex align-items-center">
                            <Link
                              to={`${all_routes.courseDetails}/${course._id}`}
                              className="avatar avatar-xl flex-shrink-0 me-2"
                            >
                              {/* Use courseThumbnailUrl and fallback if missing */}
                              {course.courseThumbnailUrl ? (
                                <ImageGlobal
                                  src={course.courseThumbnailUrl}
                                  alt="Img"
                                  className="img-fluid rounded"
                                />
                              ) : (
                                <ImageWithBasePath
                                  src="assets/img/default-course.png"
                                  alt="Img"
                                />
                              )}
                            </Link>
                            <div>
                              <p className="fw-medium mb-0">
                                <Link
                                  to={`${all_routes.courseDetails}?id=${course._id}`}
                                >
                                  {course.courseTitle}
                                </Link>
                              </p>
                              <small>{course.courseCategory}</small>
                            </div>
                          </div>
                        </td>
                        <td>{course.studentCount ?? 0}</td>
                        <td>
                          <span className="badge bg-success rounded-pill">
                            {course.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {topRecentCourses.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center">
                          No recent courses found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDashboard;
