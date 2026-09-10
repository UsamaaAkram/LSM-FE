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
  // Review form (#27) — marks + written feedback + status, instead of a
  // single "Mark as Checked" toggle.
  const [reviewMarks, setReviewMarks] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewStatus, setReviewStatus] = useState<
    "Reviewed" | "Needs Revision" | "Completed"
  >("Reviewed");

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
    {
      title: "Status",
      dataIndex: "status",
      render: (_: any, record: any) => {
        const status = record.status || "Pending";
        const badgeClass: Record<string, string> =
          {
            Pending: "bg-light text-dark",
            "Under Review": "bg-warning",
            Reviewed: "bg-info",
            "Needs Revision": "bg-danger",
            Completed: "bg-success",
          };
        return (
          <span className={`badge ${badgeClass[status] || "bg-light text-dark"}`}>
            {status}
          </span>
        );
      },
    },

    {
      title: "Action",
      render: (_: any, record: any) => (
        <span
          className={`isax isax-eye`}
          style={{
            cursor: "pointer",
          }}
          onClick={() => {
            dispatch(setSelectedSubmission(record));
            setReviewMarks(record.marks != null ? String(record.marks) : "");
            setReviewFeedback(record.feedback || "");
            setReviewStatus(
              record.status === "Needs Revision" ||
                record.status === "Completed"
                ? record.status
                : "Reviewed"
            );
          }}
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
                    status: reviewStatus,
                    marks: reviewMarks ? Number(reviewMarks) : undefined,
                    feedback: reviewFeedback,
                  })
                ).then(() => {
                  dispatch(
                    fetchStudentSubmissions({
                      studentId: selectedStudent || undefined,
                      courseId: selectedCourse || undefined,
                    }) as any
                  );
                });
              }
            }}
          >
            Save Review
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

            <div className="mb-2">
              <strong>Assignment</strong>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: studentSubmission?.selectedSubmission.assignment,
                }}
              />
            </div>

            {!!studentSubmission?.selectedSubmission.links?.length && (
              <div className="mb-3">
                <strong>Links</strong>
                <ul className="mb-0">
                  {studentSubmission.selectedSubmission.links.map(
                    (link: string, i: number) => (
                      <li key={i}>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                          {link}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* #3.6 - the attachment a student uploaded. fileUrl already
                existed on the schema but nothing ever produced it, so this
                never had anything to show before. */}
            {(studentSubmission?.selectedSubmission.file?.url ||
              studentSubmission?.selectedSubmission.fileUrl) && (
              <div className="mb-3">
                <strong>Attachment</strong>
                <div>
                  <a
                    href={
                      studentSubmission.selectedSubmission.file?.url ||
                      studentSubmission.selectedSubmission.fileUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="isax isax-document-download me-1" />
                    {studentSubmission.selectedSubmission.file?.originalname ||
                      "Download submitted file"}
                  </a>
                  {studentSubmission.selectedSubmission.file?.size ? (
                    <small className="text-muted ms-2">
                      (
                      {Math.max(
                        1,
                        Math.round(
                          studentSubmission.selectedSubmission.file.size / 1024
                        )
                      )}{" "}
                      KB)
                    </small>
                  ) : null}
                </div>
              </div>
            )}

            <hr />
            <div className="mb-3">
              <label className="form-label d-block">Status</label>
              <select
                className="form-select"
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value as any)}
              >
                <option value="Reviewed">Reviewed</option>
                <option value="Needs Revision">Needs Revision</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Marks</label>
              <input
                type="number"
                className="form-control"
                value={reviewMarks}
                onChange={(e) => setReviewMarks(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label d-block">Feedback</label>
              <textarea
                className="form-control"
                rows={3}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default StudentSubmissionModule;
