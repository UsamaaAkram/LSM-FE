import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../../core/common/dataTable/index";
import { fetchCourses } from "../../../core/redux/courses";
import { getStudentSummary } from "../../../core/redux/studentSlice";
import {
  clearSelectedQuizSubmission,
  fetchStudentQuizSubmissions,
  setSelectedQuizSubmission,
} from "../../../core/redux/studentQuizSubmissionSlice";

import { Modal } from "antd";
import QuizAttemptReview from "../../../core/common/QuizAttemptReview";
import dayjs from "dayjs";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// Mirrors StudentSubmissionModule.tsx (Assignments) for #34's Quiz tab.
// Per-question review is available now: each attempt records every answer with
// the question and choice text as it stood at the time. Attempts taken before
// that was added carry no answers, and the review panel says so rather than
// implying detail it does not have.
const StudentQuizSubmissionModule = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const courses: any = useSelector<RootState>(
    (state: any) => state.courses.courses
  );
  const students: any = useSelector<RootState>(
    (state: any) => state.student.students
  );
  const quizSubmission: any = useSelector<RootState>(
    (state: any) => state.studentQuizSubmission
  );

  useEffect(() => {
    dispatch(fetchCourses({}) as any);
    dispatch(getStudentSummary({}) as any);
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchStudentQuizSubmissions({
        studentId: selectedStudent || undefined,
        courseId: selectedCourse || undefined,
      }) as any
    );
  }, [selectedStudent, selectedCourse, dispatch]);

  const findCourseLabel = (id: string) => {
    const found = courses.find((c: any) => c._id === id);
    return found ? found.courseTitle : "";
  };

  const columns = [
    { title: "Student", dataIndex: "studentName" },
    {
      title: "Course",
      dataIndex: "courseId",
      render: (_: any, record: any) => findCourseLabel(record.courseId),
    },
    {
      title: "Score",
      render: (_: any, record: any) =>
        `${record.marks ?? 0}/${record.totalMarks ?? 0} (${record.percent ?? 0}%)`,
    },
    { title: "Attempts", dataIndex: "totalAttempts" },
    {
      title: "Last Attempt",
      dataIndex: "lastAttemptDate",
      render: (value: string) =>
        value ? dayjs(value).format("YYYY-MM-DD") : "—",
    },
    {
      title: "Status",
      dataIndex: "completed",
      render: (val: any) =>
        val ? (
          <span className="badge bg-success">Completed</span>
        ) : (
          <span className="badge bg-warning">In Progress</span>
        ),
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <span
          className="isax isax-eye"
          style={{ cursor: "pointer" }}
          onClick={() => dispatch(setSelectedQuizSubmission(record))}
        />
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
        {quizSubmission?.loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : (
          <Table
            dataSource={quizSubmission?.submissions}
            columns={columns}
            Search={false}
          />
        )}
      </div>
      <Modal
        open={!!quizSubmission?.selectedSubmission}
        onCancel={() => dispatch(clearSelectedQuizSubmission())}
        footer={null}
        width={720}
        title="Quiz Attempt Details"
      >
        {quizSubmission?.selectedSubmission && (
          <div>
            <p>
              <strong>Student:</strong>{" "}
              {quizSubmission.selectedSubmission.studentName}
            </p>
            <p>
              <strong>Course:</strong>{" "}
              {findCourseLabel(quizSubmission.selectedSubmission.courseId)}
            </p>
            <p>
              <strong>Score:</strong>{" "}
              {quizSubmission.selectedSubmission.marks}/
              {quizSubmission.selectedSubmission.totalMarks} (
              {quizSubmission.selectedSubmission.percent}%)
            </p>
            <p>
              <strong>Attempts:</strong>{" "}
              {quizSubmission.selectedSubmission.totalAttempts}
            </p>
            <hr />
            <h6>Answer breakdown</h6>
            <QuizAttemptReview
              attempts={quizSubmission.selectedSubmission.attempts}
            />
          </div>
        )}
      </Modal>
    </>
  );
};

export default StudentQuizSubmissionModule;
