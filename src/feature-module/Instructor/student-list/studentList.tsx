import moment from "moment";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
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

const StudentList: React.FC = () => {
  const dispatch = useDispatch();
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});
  const { students, loading } = useSelector((state: any) => state.student);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreateStudent = async (values: any) => {
    const res = await dispatch(signupStudent({...values, role:'student'}) as any);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Student created successfully!");
      setShowAddModal(false);
      dispatch(getStudentSummary({}) as any);
      // Optionally refresh list here
    } else {
      toast.error(res.payload || "Student creation failed.");
    }
  };

  useEffect(() => {
    // fetch unfiltered list (or use summary endpoint without filters)
    dispatch(getStudentSummary({}) as any);
  }, [dispatch]);

  // Call summary API whenever filters change
  useEffect(() => {
    dispatch(getStudentSummary(filters) as any);
  }, [dispatch, filters]);

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
    </>
  );
};

export default StudentList;
