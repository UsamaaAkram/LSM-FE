import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import {
  approveEnrollment,
  fetchEnrollmentRequests,
  rejectEnrollment,
  setEnrollmentStatus,
} from "../../../core/redux/enrollmentSlice";
import type { EnrollmentRequest } from "../../../core/redux/enrollmentSlice";

// #47.5-7 — the staff queue: review a request, inspect the payment proof, then
// approve (which grants access) or reject with a reason the student will see.

const TABS = [
  { key: "Pending Verification", label: "Pending" },
  { key: "Under Review", label: "Under Review" },
  { key: "Approved", label: "Approved" },
  { key: "Payment Rejected", label: "Rejected" },
  { key: "", label: "All" },
];

const STATUS_STYLE: Record<string, string> = {
  "Pending Verification": "bg-warning-transparent text-warning",
  "Under Review": "bg-info-transparent text-info",
  "Payment Verified": "bg-info-transparent text-info",
  Approved: "bg-success-transparent text-success",
  "Payment Rejected": "bg-danger-transparent text-danger",
  Cancelled: "bg-light text-muted",
  Expired: "bg-light text-muted",
};

const InstructorEnrollments: React.FC = () => {
  const dispatch = useDispatch();
  const { requests, loading } = useSelector((s: any) => s.enrollment || {});
  const currentUser = useSelector((s: any) => s.auth?.user);

  const [tab, setTab] = useState("Pending Verification");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EnrollmentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const actor = useMemo(
    () => ({
      name: currentUser?.name ?? currentUser?.userName ?? "",
      email: currentUser?.email ?? "",
      role: currentUser?.role ?? "admin",
    }),
    [currentUser]
  );

  const load = () => {
    dispatch(
      fetchEnrollmentRequests({
        ...(tab ? { status: tab } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      }) as any
    );
  };

  // Debounced so typing in the search box doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (requests || []).forEach((r: EnrollmentRequest) => {
      c[r.status] = (c[r.status] ?? 0) + 1;
    });
    return c;
  }, [requests]);

  const close = () => {
    setSelected(null);
    setRejectReason("");
  };

  const doApprove = async () => {
    if (!selected?._id) return;
    setBusy(true);
    const action: any = await dispatch(
      approveEnrollment({ id: selected._id, actor }) as any
    );
    setBusy(false);
    if (approveEnrollment.fulfilled.match(action)) {
      toast.success("Approved — the student now has access.");
      close();
      load();
    } else {
      toast.error((action.payload as string) || "Could not approve.");
    }
  };

  const doReject = async () => {
    if (!selected?._id) return;
    if (!rejectReason.trim()) {
      toast.error("Please give a reason — the student will see it.");
      return;
    }
    setBusy(true);
    const action: any = await dispatch(
      rejectEnrollment({
        id: selected._id,
        reason: rejectReason.trim(),
        actor,
      }) as any
    );
    setBusy(false);
    if (rejectEnrollment.fulfilled.match(action)) {
      toast.success("Rejected — the student has been told why.");
      close();
      load();
    } else {
      toast.error((action.payload as string) || "Could not reject.");
    }
  };

  const doUnderReview = async (r: EnrollmentRequest) => {
    if (!r._id) return;
    const action: any = await dispatch(
      setEnrollmentStatus({ id: r._id, status: "Under Review", actor }) as any
    );
    if (setEnrollmentStatus.fulfilled.match(action)) load();
    else toast.error((action.payload as string) || "Could not update.");
  };

  return (
    <>
      <Breadcrumb title="Enrollment Requests" />
      <div className="content">
        <div className="container">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <ul className="nav nav-pills gap-1">
                  {TABS.map((t) => (
                    <li className="nav-item" key={t.label}>
                      <button
                        type="button"
                        className={`nav-link btn btn-sm ${
                          tab === t.key ? "active" : ""
                        }`}
                        onClick={() => setTab(t.key)}
                      >
                        {t.label}
                        {t.key && counts[t.key] ? ` (${counts[t.key]})` : ""}
                      </button>
                    </li>
                  ))}
                </ul>
                <input
                  type="search"
                  className="form-control form-control-sm"
                  style={{ maxWidth: 280 }}
                  placeholder="Search name, email, reference, transaction..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              ) : !requests?.length ? (
                <div className="text-center text-muted py-5">
                  No enrollment requests here.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Student</th>
                        <th>Course</th>
                        <th>Plan</th>
                        <th>Paid via</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r: EnrollmentRequest) => (
                        <tr key={r._id}>
                          <td className="fw-semibold">{r.requestId}</td>
                          <td>
                            <div>
                              {r.firstName} {r.lastName}
                            </div>
                            <div className="text-muted fs-12">{r.email}</div>
                            {r.whatsapp && (
                              <div className="text-muted fs-12">
                                {r.whatsapp}
                              </div>
                            )}
                          </td>
                          <td>{r.courseTitle}</td>
                          <td>
                            {r.planName || "—"}
                            {r.planPrice && (
                              <div className="text-muted fs-12">
                                {r.planPrice}
                              </div>
                            )}
                          </td>
                          <td>
                            {r.isFreeEnrollment ? (
                              <span className="badge bg-success-transparent text-success">
                                Free
                              </span>
                            ) : (
                              <>
                                {r.paymentMethod || "—"}
                                {r.transactionId && (
                                  <div className="text-muted fs-12">
                                    {r.transactionId}
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                          <td className="text-nowrap">
                            {moment(r.createdAt).format("D MMM YYYY")}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                STATUS_STYLE[r.status] ?? "bg-light text-muted"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="text-end text-nowrap">
                            {r.status === "Pending Verification" && (
                              <button
                                type="button"
                                className="btn btn-sm btn-light me-1"
                                onClick={() => doUnderReview(r)}
                              >
                                Start review
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => setSelected(r)}
                            >
                              Open
                            </button>
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

      {/* Review modal */}
      {selected && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.4)" }}
          role="dialog"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="mb-0">{selected.requestId}</h5>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  onClick={close}
                  aria-label="Close"
                >
                  <i className="isax isax-close-circle5" />
                </button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Student</h6>
                    <ul className="list-unstyled fs-14">
                      <li>
                        <strong>
                          {selected.firstName} {selected.lastName}
                        </strong>
                      </li>
                      <li className="text-muted">{selected.email}</li>
                      {selected.whatsapp && (
                        <li className="text-muted">{selected.whatsapp}</li>
                      )}
                    </ul>
                    <h6 className="mt-3">Enrollment</h6>
                    <ul className="list-unstyled fs-14">
                      <li>
                        <span className="text-muted">Course:</span>{" "}
                        {selected.courseTitle}
                      </li>
                      {selected.planName && (
                        <li>
                          <span className="text-muted">Plan:</span>{" "}
                          {selected.planName}
                          {selected.planAccessDays
                            ? ` (${selected.planAccessDays} days)`
                            : " (lifetime)"}
                        </li>
                      )}
                      {selected.planPrice && (
                        <li>
                          <span className="text-muted">Price:</span>{" "}
                          {selected.planPrice}
                        </li>
                      )}
                      {selected.invoiceNumber && (
                        <li>
                          <span className="text-muted">Invoice:</span>{" "}
                          {selected.invoiceNumber}
                        </li>
                      )}
                      <li>
                        <span className="text-muted">Submitted:</span>{" "}
                        {moment(selected.createdAt).format(
                          "D MMM YYYY [at] HH:mm"
                        )}
                      </li>
                    </ul>

                    {!selected.isFreeEnrollment && (
                      <>
                        <h6 className="mt-3">Payment</h6>
                        <ul className="list-unstyled fs-14">
                          <li>
                            <span className="text-muted">Method:</span>{" "}
                            {selected.paymentMethod}
                          </li>
                          <li>
                            <span className="text-muted">Reference:</span>{" "}
                            {selected.transactionId}
                          </li>
                          {selected.paymentNote && (
                            <li>
                              <span className="text-muted">Note:</span>{" "}
                              {selected.paymentNote}
                            </li>
                          )}
                        </ul>
                      </>
                    )}
                  </div>

                  <div className="col-md-6">
                    <h6>Payment proof</h6>
                    {selected.paymentScreenshot?.url ? (
                      <a
                        href={selected.paymentScreenshot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open full size"
                      >
                        <img
                          src={selected.paymentScreenshot.url}
                          alt="Payment screenshot"
                          className="img-fluid rounded border"
                        />
                      </a>
                    ) : (
                      <p className="text-muted fs-14">
                        {selected.isFreeEnrollment
                          ? "Free course — no payment required."
                          : "No screenshot attached."}
                      </p>
                    )}

                    {!!selected.statusHistory?.length && (
                      <>
                        <h6 className="mt-3">History</h6>
                        <ul className="list-unstyled fs-13">
                          {selected.statusHistory.map((h, i) => (
                            <li key={i} className="border-bottom py-1">
                              <strong>{h.to}</strong>
                              {h.byName ? ` · ${h.byName}` : ""}
                              {h.byRole ? ` (${h.byRole})` : ""}
                              <div className="text-muted">
                                {moment(h.at).format("D MMM YYYY HH:mm")}
                                {h.reason ? ` — ${h.reason}` : ""}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>

                {selected.status === "Approved" ? (
                  <div className="alert alert-success mt-3 mb-0">
                    Approved by {selected.processedByName || "staff"} on{" "}
                    {moment(selected.approvedAt).format("D MMM YYYY")}. Access
                    {selected.accessExpiresAt
                      ? ` runs until ${moment(selected.accessExpiresAt).format(
                          "D MMM YYYY"
                        )}.`
                      : " is lifetime."}
                  </div>
                ) : selected.status === "Payment Rejected" ? (
                  <div className="alert alert-danger mt-3 mb-0">
                    Rejected: {selected.rejectionReason}
                  </div>
                ) : (
                  <div className="mt-3">
                    <label className="form-label">
                      Rejection reason{" "}
                      <small className="text-muted">
                        (required only if rejecting — the student sees this)
                      </small>
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g. The screenshot is unclear. Please upload a readable one."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={close}>
                  Close
                </button>
                {selected.status !== "Approved" &&
                  selected.status !== "Payment Rejected" && (
                    <>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={doReject}
                        disabled={busy}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={doApprove}
                        disabled={busy}
                      >
                        {busy ? "Working..." : "Approve & grant access"}
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstructorEnrollments;
