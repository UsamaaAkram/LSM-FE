import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Table from "../../../core/common/dataTable/index";
import { all_routes } from "../../router/all_routes";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

// REDUX stuff
import { useDispatch, useSelector } from "react-redux";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { deleteCourse, fetchCourses } from "../../../core/redux/courses";
import { toast } from "react-toastify";
import moment from "moment";

const InstructorCourse = () => {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector(
    (state: any) =>
      state.courses || { courses: [], loading: false, error: null }
  );

  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined
  );
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch courses
  useEffect(() => {
    dispatch(fetchCourses({ status: filterStatus, search }) as any);
  }, [dispatch, filterStatus, search]);

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

  // Table columns
  const columns = [
    {
      title: "Course Name",
      dataIndex: "courseTitle",
      render: (_text: string, record: any) => {
        return (
          <div className="d-flex align-items-center">
            <Link
              to={`${all_routes.courseDetails}?id=${record._id}`}
              className="avatar avatar-lg me-2 flex-shrink-0"
            >
              <ImageGlobal
                src={record.courseThumbnailUrl}
                alt="Course Thumbnail"
                width={80}
                height={50}
              />
            </Link>
            <div>
              <h6 className="fw-medium mb-2">
                <Link to={`${all_routes.courseDetails}?id=${record._id}`}>
                  {record.courseTitle}
                </Link>
              </h6>
              {/* Adjust these for your schema if needed */}
              <div className="d-flex align-items-center">
                <span className="d-inline-flex fs-12 align-items-center me-2 pe-2 border-end">
                  <i className="isax isax-video-circle me-1 text-gray-9 fw-bold" />
                  {record.curriculum?.reduce(
                    (a: number, c: any) => a + c.lessons.length,
                    0
                  ) || 0}{" "}
                  Lessons
                </span>
                <span className="d-inline-flex fs-12 align-items-center me-2 pe-2 border-end">
                  <i className="isax isax-message-question me-1 text-gray-9 fw-bold" />
                  {record.quizzesCount} Quizzes
                </span>
                <span className="d-inline-flex fs-12 align-items-center">
                  <i className="isax isax-clock me-1 text-gray-9 fw-bold" />
                  {formatDuration(record.duration) || "N/A"}
                </span>
              </div>
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => a.courseTitle.length - b.courseTitle.length,
    },

    {
      title: "Processed By",
      dataIndex: "",
      render: (_: string, record: any) => {
        return (
          <p className="fs-14 mb-0 uppercase">{record?.createdBy || "N/A"}</p>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span
          className={`badge badge-sm ${
            text === "pending"
              ? "bg-skyblue"
              : text === "draft"
              ? "bg-info"
              : "bg-success"
          } d-inline-flex align-items-center me-1`}
        >
          <i className="fa-solid fa-circle fs-5 me-1" />
          {text}
        </span>
      ),
      sorter: (a: any, b: any) =>
        (a.status || "").localeCompare(b.status || ""),
    },
    {
      title: "Action",
      dataIndex: "",
      render: (_: any, record: any) => (
        <div className="d-flex align-items-center">
          <Link
            to={`${all_routes.editCourse}?id=${record._id}`} // Update this route for edit
            className="d-inline-flex fs-14 me-1 action-icon"
          >
            <i className="isax isax-edit-2" />
          </Link>
          <Link
            to="#"
            className="d-inline-flex fs-14 action-icon"
            data-bs-toggle="modal"
            data-bs-target="#delete_modal"
            onClick={() => setDeleteId(record._id)}
          >
            <i className="isax isax-trash" />
          </Link>
        </div>
      ),
    },
  ];

  // Delete handler
  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(deleteCourse(deleteId) as any);
      toast.success("Course deleted successfully!");
      setDeleteId(null);
    }
  };

  // Status Filter handler
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status === "All" ? undefined : status.toLowerCase());
  };

  // Search handler
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <>
      <Breadcrumb title="Courses" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">Courses</h5>
                <Link
                  to={all_routes.addNewCourse}
                  className="btn btn-secondary rounded-pill"
                >
                  Add New Course
                </Link>
              </div>
              <div className="row mb-3 gap-3">
                <div className="col-md-8">
                  <div className="dropdown">
                    <button
                      type="button"
                      className="dropdown-toggle text-gray-6 btn rounded border d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Status
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <button
                          className="dropdown-item rounded-1"
                          onClick={() => handleStatusFilter("All")}
                        >
                          All
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item rounded-1"
                          onClick={() => handleStatusFilter("Published")}
                        >
                          Published
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item rounded-1"
                          onClick={() => handleStatusFilter("Pending")}
                        >
                          Pending
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item rounded-1"
                          onClick={() => handleStatusFilter("Draft")}
                        >
                          Draft
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title"
                    value={search}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              {/* DataTable API-integrated */}
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border"></span>
                </div>
              ) : (
                <Table dataSource={courses} columns={columns} Search={false} />
              )}
            </div>
          </div>
        </div>
      </div>
      <>
        {/* Delete Modal */}
        <div className="modal fade" id="delete_modal" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center custom-modal-body">
                <span className="avatar avatar-lg bg-danger-transparent rounded-circle mb-2">
                  <i className="isax isax-trash fs-24 text-danger" />
                </span>
                <div>
                  <h4 className="mb-2">Delete Course</h4>
                  <p className="mb-3">
                    Are you sure you want to delete course?
                  </p>
                  <div className="d-flex align-items-center justify-content-center">
                    <Link
                      to="#"
                      className="btn bg-gray-100 rounded-pill me-2"
                      data-bs-dismiss="modal"
                      onClick={() => setDeleteId(null)}
                    >
                      Cancel
                    </Link>
                    <Link
                      to="#"
                      className="btn btn-secondary rounded-pill"
                      data-bs-dismiss="modal"
                      onClick={() => handleDelete()}
                    >
                      Yes, Delete
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default InstructorCourse;
