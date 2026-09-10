import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { fetchMyEnrollments } from "../../../core/redux/enrollmentSlice";
import type { EnrollmentRequest } from "../../../core/redux/enrollmentSlice";
import { all_routes } from "../../router/all_routes";

// #47.10 — "My Enrollments": every request this student has made, with its
// current state and access window.

const STATUS_STYLE: Record<string, string> = {
  "Pending Verification": "bg-warning-transparent text-warning",
  "Under Review": "bg-info-transparent text-info",
  "Payment Verified": "bg-info-transparent text-info",
  Approved: "bg-success-transparent text-success",
  "Payment Rejected": "bg-danger-transparent text-danger",
  Cancelled: "bg-light text-muted",
  Expired: "bg-light text-muted",
};

const StudentEnrollments: React.FC = () => {
  const dispatch = useDispatch();
  const route = all_routes;
  const auth = useSelector((s: any) => s.auth?.user);
  const { requests, loading } = useSelector((s: any) => s.enrollment || {});

  useEffect(() => {
    if (auth?._id) dispatch(fetchMyEnrollments(auth._id) as any);
  }, [dispatch, auth?._id]);

  const accessLabel = (r: EnrollmentRequest) => {
    if (r.status !== "Approved") return "—";
    if (!r.accessExpiresAt) return "Lifetime";
    const expired = moment(r.accessExpiresAt).isBefore(moment());
    return (
      <span className={expired ? "text-danger" : ""}>
        {expired ? "Expired " : "Until "}
        {moment(r.accessExpiresAt).format("D MMM YYYY")}
      </span>
    );
  };

  return (
    <>
      <Breadcrumb title="My Enrollments" />
      <div className="content">
        <div className="container">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              ) : !requests?.length ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-3">
                    You haven't enrolled in anything yet.
                  </p>
                  <Link to={route.courseGrid} className="btn btn-primary">
                    Browse courses
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Course</th>
                        <th>Plan</th>
                        <th>Submitted</th>
                        <th>Access</th>
                        <th>Status</th>
                        <th className="text-end" />
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r: EnrollmentRequest) => (
                        <tr key={r._id}>
                          <td className="fw-semibold">{r.requestId}</td>
                          <td>{r.courseTitle}</td>
                          <td>
                            {r.planName || "—"}
                            {r.planPrice && (
                              <div className="text-muted fs-12">
                                {r.planPrice}
                              </div>
                            )}
                          </td>
                          <td className="text-nowrap">
                            {moment(r.createdAt).format("D MMM YYYY")}
                          </td>
                          <td className="text-nowrap">{accessLabel(r)}</td>
                          <td>
                            <span
                              className={`badge ${
                                STATUS_STYLE[r.status] ?? "bg-light text-muted"
                              }`}
                            >
                              {r.status}
                            </span>
                            {r.status === "Payment Rejected" &&
                              r.rejectionReason && (
                                <div
                                  className="text-danger mt-1"
                                  style={{ fontSize: 12 }}
                                >
                                  {r.rejectionReason}
                                </div>
                              )}
                          </td>
                          <td className="text-end text-nowrap">
                            <Link
                              to={`${route.enrollStatus}?ref=${r.requestId}`}
                              className="btn btn-sm btn-light"
                            >
                              View
                            </Link>
                            {r.status === "Payment Rejected" && (
                              <Link
                                to={`${route.enroll}?course=${r.course}`}
                                className="btn btn-sm btn-primary ms-1"
                              >
                                Resubmit
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentEnrollments;
