import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../../core/common/dataTable/index";
import { fetchCourses } from "../../../core/redux/courses";
import {
  clearSelectedSubmission,
  fetchStudentSubmissions,
  markSubmissionChecked,
  setSelectedSubmission,
} from "../../../core/redux/studentSubmissionSlice"; // import reducer!

import { Button, Modal } from "antd"; // Use Ant Design or your own modal
import dayjs from "dayjs";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import { getStudentSummary } from "../../../core/redux/studentSlice";

const StudentSubmissionModule = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Dropdown data
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const courses: any = useSelector<RootState>(
    (state: any) => state.courses.courses
  );
  const students: any = useSelector<RootState>(
    (state: any) => state.student.students
  );
  const studentSubmission: any = useSelector<RootState>(
    (state: any) => state.studentSubmission
  );

  // Load dropdowns
  useEffect(() => {
    dispatch(fetchCourses({}) as any);
    dispatch(getStudentSummary({}) as any);
  }, [dispatch]);

  // Refetch submissions when filters change
  useEffect(() => {
    dispatch(
      fetchStudentSubmissions({
        studentId: selectedStudent || undefined,
        courseId: selectedCourse || undefined,
      }) as any
    );
  }, [selectedStudent, selectedCourse, dispatch]);

  const findCourseLabel = (id: string) => {
    const found = courses.find((c: any) => c._id === id);
    return found ? found.courseTitle : "";
  };

  // Table columns
  const columns = [
    { title: "Student", dataIndex: "studentName" },
    {
      title: "Course",
      dataIndex: "courseTitle",
      render: (_: any, record: any) => findCourseLabel(record.courseId),
    },

    {
      title: "Submitted At",
      dataIndex: "assignmentDate",
      render: (value: string) =>
        value ? dayjs(value).format("YYYY-MM-DD") : "",
    },
    { title: "Student", dataIndex: "studentName" },

    {
      title: "Status",
      dataIndex: "isSubmitted",
      render: (val: any) =>
        val ? (
          <span className="badge bg-success">Checked</span>
        ) : (
          <span className="badge bg-danger">Not Checked</span>
        ),
    },

    {
      title: "Action",
      render: (_: any, record: any) => (
        <span
          className={`isax isax-eye`}
          style={{
            cursor: "pointer",
          }}
          onClick={() => dispatch(setSelectedSubmission(record))}
        ></span>
      ),
    },
  ];

  return (
    <>
      <div>
        <div className="row mb-4 d-flex align-items-center justify-content-end">
          <div className="col-md-3">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-select"
            >
              <option value="">All Courses</option>
              {courses?.map((c: any) => (
                <option value={c._id} key={c._id}>
                  {c.courseTitle}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="form-select"
            >
              <option value="">All Students</option>
              {students?.map((s: any) => (
                <option value={s._id} key={s._id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
        {studentSubmission?.loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : (
          <Table
            dataSource={studentSubmission?.submissions}
            columns={columns}
            Search={false}
          />
        )}
      </div>
      <Modal
        open={!!studentSubmission?.selectedSubmission}
        onCancel={() => dispatch(clearSelectedSubmission())}
        footer={[
          <Button
            key="submit"
            className="secondary"
            loading={studentSubmission?.markSubmittedLoading}
            onClick={() => {
              const s = studentSubmission.selectedSubmission;
              if (s) {
                dispatch(
                  markSubmissionChecked({
                    studentId: s.studentId,
                    courseId: s.courseId,
                    assignmentsID: s.assignmentsID,
                  })
                );
                dispatch(
                  fetchStudentSubmissions({
                    studentId: selectedStudent || undefined,
                    courseId: selectedCourse || undefined,
                  }) as any
                );
              }
            }}
            disabled={studentSubmission?.selectedSubmission?.isSubmitted}
          >
            {studentSubmission?.selectedSubmission?.isSubmitted
              ? "Already Checked"
              : "Mark as Checked"}
          </Button>,
        ]}
        width={600}
        title="Submission Details"
      >
        {studentSubmission?.selectedSubmission && (
          <div>
            <p>
              <strong>Student:</strong>{" "}
              {studentSubmission?.selectedSubmission.studentName}
            </p>

            <p>
              <strong>Course:</strong>{" "}
              {findCourseLabel(studentSubmission?.selectedSubmission.courseId)}
            </p>
            <p>
              <strong>Submitted At:</strong>{" "}
              {studentSubmission?.selectedSubmission.assignmentDate
                ? dayjs(
                    studentSubmission?.selectedSubmission.assignmentDate
                  ).format("YYYY-MM-DD")
                : ""}
            </p>

            <p>
              <strong>Assignment</strong>{" "}
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: studentSubmission?.selectedSubmission.assignment,
                }}
              />
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default StudentSubmissionModule;
