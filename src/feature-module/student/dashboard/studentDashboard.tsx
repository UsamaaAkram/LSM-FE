import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Table from "../../../core/common/dataTable/index";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import type { AppDispatch } from "../../../core/redux/store";
import { fetchStudentCoursesProgress } from "../../../core/redux/studentDashboardSlice";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";

const StudentDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();

  const currentUser = useSelector((state: any) => state.auth.user);
  const { loading, coursesProgress } = useSelector(
    (state: any) => state.studentDashboard
  );

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchStudentCoursesProgress(currentUser._id) as any);
    }
  }, [dispatch, currentUser?._id]);

  const columns = [
    {
      title: "Course Name",
      dataIndex: "courseTitle",
      render: (text: string) => <span className="fw-semibold">{text}</span>,
    },

    {
      title: "Course Progress",
      dataIndex: "courseProgress",
      render: (_: any, record: any) => {
        return (
          <div className="d-flex align-items-center">
            <div
              className="progress progress-xs flex-shrink-0"
              role="progressbar"
              style={{ height: 4, width: 110 }}
            >
              <div
                className="progress-bar bg-success"
                style={{ width: record?.courseProgress }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "Video",
      render: (_: any, record: any) => {
        return <>{`${record?.videoProgress}%`}</>;
      },
    },
    {
      title: "Assignment",
      render: (_: any, record: any) => {
        return <>{`${record?.assignmentProgress}%`}</>;
      },
    },
    {
      title: "Quiz",
      render: (_: any, record: any) => {
        return <>{`${record?.quizProgress}%`}</>;
      },
    },
    {
      title: "Grade",
      render: (_: any, record: any) => record?.grad ?? "--",
    },
    {
      title: "Grand Total",
      render: (_: any, record: any) => (
        <strong>{`${record?.grandTotal}%`}</strong>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb title="Dashboard" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="row">
                <div className="col-md-6 col-xl-4">
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
                          <h4 className="fs-24 mt-1">
                            {coursesProgress?.totalEnrolledCourses}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
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
                          <span className="d-block">Wishlist Courses</span>
                          <h4 className="fs-24 mt-1">
                            {coursesProgress?.totalWishlist}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xl-4">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="icon-box bg-success-transparent me-2 me-xxl-3 flex-shrink-0">
                          <ImageWithBasePath
                            src="assets/img/icon/bookmark.svg"
                            alt=""
                          />
                        </span>
                        <div>
                          <span className="d-block">Completed Courses</span>
                          <h4 className="fs-24 mt-1">
                            {coursesProgress?.totalCompleteCourses}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">Course Progress</h5>
              </div>
              {loading ? (
                <div className="py-5 text-center">
                  <span className="spinner-border spinner-border-sm" />
                </div>
              ) : (
                <Table
                  dataSource={coursesProgress?.result || []}
                  columns={columns}
                  Search={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
