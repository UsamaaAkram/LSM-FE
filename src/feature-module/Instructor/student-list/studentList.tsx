import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Table from "../../../core/common/dataTable/index";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import {
  getStudentSummary,
  signupStudent,
} from "../../../core/redux/studentSlice";
import { all_routes } from "../../router/all_routes";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";
import AddStudentModal from "./AddStudentModal";
import StudentFilterModal from "./StudentFilterModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StudentList: React.FC = () => {
  const dispatch = useDispatch();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});
  const [view, setView] = useState<"all" | "enrolled">("all");
  const { students, loading } = useSelector((state: any) => state.student);
  const [showAddModal, setShowAddModal] = useState(false);

  // Course-progress detail popup (#31/T5.9)
  const [progressDetail, setProgressDetail] = useState<any>(null);
  const [progressDetailLoading, setProgressDetailLoading] = useState(false);
  const openProgressDetail = async (studentId: string) => {
    setProgressDetailLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/students/${studentId}`);
      setProgressDetail(res.data);
    } catch {
      toast.error("Could not load progress details.");
    } finally {
      setProgressDetailLoading(false);
    }
  };

  const handleCreateStudent = async (values: any) => {
    const res = await dispatch(
      signupStudent({ ...values, role: "student", sendCredentials: true }) as any
    );
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Student created successfully!");
      setShowAddModal(false);
      dispatch(getStudentSummary({}) as any);
      // Optionally refresh list here
    } else {
      toast.error(res.payload || "Student creation failed.");
    }
  };

  // Call summary API whenever filters or the All/Enrolled view change
  useEffect(() => {
    const params: any = { ...filters };
    if (view === "enrolled") params.enrolled = "true";
    dispatch(getStudentSummary(params) as any);
  }, [dispatch, filters, view]);

  const columns = [
    {
      title: "Student Name",
      dataIndex: "",
      render: (_: string, record: any) => (
        <div className="d-flex align-items-center">
          <ImageGlobal
            src={record?.photo}
            className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
          />
          <Link
            to={`${all_routes.studentsDetails}?id=${record._id}`}
            className="text-secondary"
          >
            <p className="fs-14 mb-0 uppercase text-secondary">
              {record?.firstName && record?.lastName
                ? ` ${record?.firstName} ${record?.lastName}`
                : record?.userName}
            </p>
            <p className="fs-14 mb-0 uppercase">{record?.email || "N/A"}</p>
          </Link>
        </div>
      ),
    },
    {
      title: "Processed By",
      dataIndex: "",
      render: (_: string, record: any) => {
        return (
          <p className="fs-14 mb-0 uppercase">{record?.enrolledBy || "N/A"}</p>
        );
      },
    },
    {
      title: "Enrollment Date",
      dataIndex: "enrollmentDate",
      render: (text: string) => {
        return moment(text).format("DD/MM/YYYY");
      },
    },

    {
      title: "Batch",
      dataIndex: "",
      render: (_: string, record: any) => {
        return <p className="fs-14 mb-0 uppercase">{record?.batch || "N/A"}</p>;
      },
    },

    {
      title: "Branch",
      dataIndex: "",
      render: (_: string, record: any) => {
        return (
          <p className="fs-14 mb-0 uppercase">{record?.branch || "N/A"}</p>
        );
      },
    },
    {
      title: "Courses",
      dataIndex: "enrolledCourses",
      render: (_: string, record: any) => record?.coursesLength ?? 0,
    },
    {
      title: "Course Progress",
      dataIndex: "percent",
      render: (_: any, record: any) => (
        <div
          className="d-flex align-items-center gap-2"
          style={{ cursor: "pointer" }}
          onClick={() => openProgressDetail(record._id)}
          title="View progress details"
        >
          <div
            className="progress progress-xs flex-shrink-0"
            style={{ height: 4, width: 90 }}
          >
            <div
              className="progress-bar bg-success"
              style={{ width: `${record?.percent ?? 0}%` }}
            />
          </div>
          <span className="fs-13">{record?.percent ?? 0}%</span>
        </div>
      ),
    },
    {
      title: "Status",
      render: (_: any, record: any) => (
        <span
          className={
            record.isDisable ? "text-danger fw-bold" : "text-success fw-bold"
          }
        >
          {record.isDisable ? "Inactive" : "Active"}
        </span>
      ),
    },
  ];
  return (
    <>
      <Breadcrumb title="Students List" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />
            {/* /Sidebar */}
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">Students</h5>
                <Button
                  variant="secondary mb-3"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Student
                </Button>
              </div>
              {/* Registered / Enrolled tabs */}
              <ul className="nav nav-pills mb-3 gap-2">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${view === "all" ? "active" : ""}`}
                    onClick={() => setView("all")}
                  >
                    Registered
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${
                      view === "enrolled" ? "active" : ""
                    }`}
                    onClick={() => setView("enrolled")}
                  >
                    Enrolled
                  </button>
                </li>
              </ul>
              <div className="row justify-content-between align-items-center mb-3">
                <div className="col-md-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowFilter(true)}
                  >
                    Add Filter
                  </Button>
                </div>

                <div className="col-md-4">
                  <div className="input-icon mb-3">
                    <span className="input-icon-addon">
                      <i className="isax isax-search-normal-14" />
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-md"
                      placeholder="Search"
                      onChange={(e: any) => {
                        setFilters((prev: any) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
              <StudentFilterModal
                show={showFilter}
                onClose={() => setShowFilter(false)}
                onApply={(values) => {
                  setFilters(values);
                }}
                onReset={() => {
                  setFilters({});
                }}
                filters={filters}
              />
              <AddStudentModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleCreateStudent}
                loading={loading}
              />
              {loading ? (
                <div className="py-5 text-center">
                  <span className="spinner-border spinner-border-sm" />
                </div>
              ) : (
                <Table dataSource={students} columns={columns} Search={false} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course-progress detail popup (#31/T5.9) */}
      <Modal show={!!progressDetail || progressDetailLoading} onHide={() => setProgressDetail(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Course Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {progressDetailLoading ? (
            <div className="py-4 text-center">
              <span className="spinner-border spinner-border-sm" />
            </div>
          ) : !progressDetail?.progress?.length ? (
            <p className="text-muted mb-0">No course progress recorded yet.</p>
          ) : (
            progressDetail.progress.map((p: any) => (
              <div className="card mb-3" key={p.courseID}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Course ID: {p.courseID}</h6>
                    <span className="fw-semibold">{p.percent ?? 0}%</span>
                  </div>
                  <div className="progress progress-xs mb-3" style={{ height: 4 }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${p.percent ?? 0}%` }}
                    />
                  </div>
                  <div className="row row-gap-2 fs-13 text-muted">
                    <div className="col-4">
                      Lessons Watched: {p.lessonWatched?.length ?? 0}
                    </div>
                    <div className="col-4">
                      Assignments: {p.assignments?.filter((a: any) => a.isSubmitted).length ?? 0}
                      /{p.assignments?.length ?? 0}
                    </div>
                    <div className="col-4">
                      Quizzes: {p.quizzes?.filter((q: any) => q.completed).length ?? 0}
                      /{p.quizzes?.length ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default StudentList;
