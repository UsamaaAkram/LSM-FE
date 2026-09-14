import moment from "moment";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { whatsappRequestHelp } from "../../../core/common/bluverseLinks";
import { fetchEnrollmentByRef } from "../../../core/redux/enrollmentSlice";
import { all_routes } from "../../router/all_routes";

// #47.3 — the status page a student lands on after submitting, reachable later
// by its reference (/enroll-status?ref=ENR-2026-000123).

// Which timeline stages are complete for a given status.
const stageState = (status: string) => {
  const done = (n: number) => {
    switch (status) {
      case "Payment Rejected":
        // Details and payment were submitted; verification failed.
        return n <= 2;
      case "Approved":
        return n <= 4;
      case "Payment Verified":
        return n <= 3;
      case "Under Review":
      case "Pending Verification":
      default:
        return n <= 2;
    }
  };
  return done;
};

const STATUS_STYLE: Record<string, string> = {
  "Pending Verification": "bg-warning-transparent text-warning",
  "Under Review": "bg-info-transparent text-info",
  "Payment Verified": "bg-info-transparent text-info",
  Approved: "bg-success-transparent text-success",
  "Payment Rejected": "bg-danger-transparent text-danger",
  Cancelled: "bg-light text-muted",
  Expired: "bg-light text-muted",
};

const EnrollStatus: React.FC = () => {
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const route = all_routes;

  const { current, error } = useSelector((s: any) => s.enrollment || {});

  useEffect(() => {
    if (ref) dispatch(fetchEnrollmentByRef(ref) as any);
  }, [dispatch, ref]);

  const waHref = () => whatsappRequestHelp(ref, current?.courseTitle);

  if (!ref) {
    return (
      <>
        <Breadcrumb title="Enrollment Status" />
        <div className="content">
          <div className="container text-center py-5">
            <h5>No request reference provided</h5>
            <p className="text-muted">
              Open this page from the link in your confirmation, or check My
              Enrollments in your dashboard.
            </p>
            <Link to={route.studentDashboard} className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (error && !current) {
    return (
      <>
        <Breadcrumb title="Enrollment Status" />
        <div className="content">
          <div className="container text-center py-5">
            <h5>We couldn't find that request</h5>
            <p className="text-muted">
              Check the reference and try again, or contact us on WhatsApp.
            </p>
            <a
              href={waHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-success"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </>
    );
  }

  if (!current) {
    return (
      <div className="content">
        <div className="container text-center py-5">
          <span className="spinner-border" />
        </div>
      </div>
    );
  }

  const done = stageState(current.status);
  const rejected = current.status === "Payment Rejected";
  const approved = current.status === "Approved";

  const stages = [
    { n: 1, label: "Details submitted" },
    {
      n: 2,
      label: current.isFreeEnrollment ? "Free course" : "Payment submitted",
    },
    { n: 3, label: rejected ? "Verification failed" : "Payment verification" },
    { n: 4, label: "Course access" },
  ];

  return (
    <>
      <Breadcrumb title="Enrollment Status" />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                      <p className="text-muted mb-1 fs-13">
                        Enrollment request
                      </p>
                      <h5 className="mb-1">{current.requestId}</h5>
                      <p className="mb-0 text-muted">{current.courseTitle}</p>
                    </div>
                    <span
                      className={`badge ${
                        STATUS_STYLE[current.status] ?? "bg-light text-muted"
                      }`}
                    >
                      {current.status}
                    </span>
                  </div>

                  <hr />

                  {approved ? (
                    <div className="alert alert-success mb-4">
                      <strong>You're in.</strong> Your payment was verified and
                      the course is now available in your dashboard.
                      {current.accessExpiresAt && (
                        <div className="mt-1 fs-13">
                          Access runs until{" "}
                          {moment(current.accessExpiresAt).format("D MMMM YYYY")}
                          .
                        </div>
                      )}
                    </div>
                  ) : rejected ? (
                    <div className="alert alert-danger mb-4">
                      <strong>We couldn't verify your payment.</strong>
                      {current.rejectionReason && (
                        <div className="mt-1">{current.rejectionReason}</div>
                      )}
                      <div className="mt-2">
                        <Link
                          to={`${route.enroll}?course=${current.course}`}
                          className="btn btn-sm btn-danger"
                        >
                          Submit corrected details
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-light border mb-4">
                      Your request has been received and our team is verifying
                      your payment. Course access is activated after approval.
                    </div>
                  )}

                  {/* Timeline */}
                  <ul className="list-unstyled mb-4">
                    {stages.map((s) => {
                      const isDone = done(s.n);
                      const isFail = rejected && s.n === 3;
                      return (
                        <li
                          key={s.n}
                          className="d-flex align-items-center gap-2 py-2"
                        >
                          <span
                            className={`d-inline-flex align-items-center justify-content-center rounded-circle ${
                              isFail
                                ? "bg-danger text-white"
                                : isDone
                                ? "bg-success text-white"
                                : "bg-light text-muted"
                            }`}
                            style={{ width: 26, height: 26, flex: "0 0 auto" }}
                          >
                            <i
                              className={`isax ${
                                isFail
                                  ? "isax-close-circle"
                                  : isDone
                                  ? "isax-tick-circle"
                                  : "isax-clock"
                              } fs-14`}
                            />
                          </span>
                          <span
                            className={
                              isDone || isFail ? "" : "text-muted"
                            }
                          >
                            {s.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Summary */}
                  <h6 className="mb-2">Request details</h6>
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <tbody>
                        {/* Personal details are no longer returned to an
                            anonymous caller: this page is public and the
                            reference is sequential, so anyone counting upwards
                            could have harvested names and emails. Rendered
                            only when the viewer is entitled to them. */}
                        {(current.firstName || current.email) && (
                          <>
                            <tr>
                              <td className="text-muted">Name</td>
                              <td>
                                {current.firstName} {current.lastName}
                              </td>
                            </tr>
                            <tr>
                              <td className="text-muted">Email</td>
                              <td>{current.email}</td>
                            </tr>
                          </>
                        )}
                        {current.planName && (
                          <tr>
                            <td className="text-muted">Plan</td>
                            <td>
                              {current.planName}
                              {current.planPrice ? ` — ${current.planPrice}` : ""}
                            </td>
                          </tr>
                        )}
                        {current.paymentMethod && (
                          <tr>
                            <td className="text-muted">Payment method</td>
                            <td>{current.paymentMethod}</td>
                          </tr>
                        )}
                        {current.transactionId && (
                          <tr>
                            <td className="text-muted">Reference</td>
                            <td>{current.transactionId}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="text-muted">Submitted</td>
                          <td>
                            {moment(current.createdAt).format(
                              "D MMMM YYYY [at] HH:mm"
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mt-4">
                    {approved ? (
                      <Link
                        to={route.studentCourses}
                        className="btn btn-primary"
                      >
                        Go to my courses
                      </Link>
                    ) : (
                      <Link
                        to={route.studentDashboard}
                        className="btn btn-light"
                      >
                        Back to dashboard
                      </Link>
                    )}
                    <a
                      href={waHref()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success"
                    >
                      <i className="isax isax-message-text me-1" />
                      Need help? Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrollStatus;
