import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Table from "../../../core/common/dataTable/index";
import { fetchCourses } from "../../../core/redux/courses";
import { fetchStudentQuizResults } from "../../../core/redux/instructor";
import type { AppDispatch } from "../../../core/redux/store";
import { getStudentSummary } from "../../../core/redux/studentSlice";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";
import { toast } from "react-toastify";

const InstructorQuizResult = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { quizResults, loading, error }: any = useSelector<any>(
    (state: any) => state.instructor
  );

  // Dropdown data state
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  // Load students and courses on mount
  useEffect(() => {
    dispatch(getStudentSummary({}))
      .unwrap()
      .then((data: any) => setStudents(data));
    dispatch(fetchCourses({}))
      .unwrap()
      .then((data: any) => setCourses(data));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStudentQuizResults({
        studentId: selectedStudent || undefined,
        courseId: selectedCourse || undefined,
      })
    );
  }, [selectedStudent, selectedCourse, dispatch]);

  const columns = [
    {
      title: "Student Name",
      dataIndex: "studentName",
    },
    {
      title: "Course",
      dataIndex: "courseTitle",
    },
    {
      title: "Quiz Title",
      dataIndex: "quizTitle",
    },

    {
      title: "Marks",
      render: (_: any, record: any) => {
        return (
          <span>
            {record.marks}/{record.totalMarks}
          </span>
        );
      },
    },
    {
      title: "Attempts",
      dataIndex: "totalAttempts",
    },
    {
      title: "Finish Time",
      dataIndex: "lastAttemptDate",
      render: (date: any) =>
        date ? moment(date).format("DD/MM/YY HH:mm") : "-",
    },
    {
      title: "Status",
      dataIndex: "completed",
      render: (val: any) =>
        val ? (
          <span className="badge bg-success">Passed</span>
        ) : (
          <span className="badge bg-danger">Not Passed</span>
        ),
    },
  ];

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <>
      <Breadcrumb title="Quiz Results" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            {/* Sidebar */}
            <InstructorSidebar />
            {/* /Sidebar */}
            <div className="col-lg-9">
              <h5 className="page-title mb-4">Quiz Results</h5>

              {/* Filter bar */}
              <div className="row mb-3">
                <div className="col-md-5 mb-2">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Courses</option>
                    {courses.map((c: any) => (
                      <option value={c._id} key={c._id}>
                        {c.title || c.courseTitle}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5 mb-2">
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="form-select"
                  >
                    <option value="">All Students</option>
                    {students.map((s: any) => (
                      <option value={s._id} key={s._id}>
                        {s?.firstName?.length && s?.lastName?.length
                          ? s?.firstName + " " + (s?.lastName || "")
                          : s.userName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Results Table */}
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border"></span>
                </div>
              ) : (
                <Table
                  dataSource={quizResults}
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

export default InstructorQuizResult;
