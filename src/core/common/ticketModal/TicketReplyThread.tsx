import moment from "moment";
import React from "react";

// #43 — the ticket conversation thread, shared by the student and instructor
// ticket pages (the markup was duplicated verbatim in both).
//
// Reply dates: the server now stamps an ISO timestamp. Older replies were
// stored as `new Date().toLocaleString()`, which is locale-dependent — in
// en-US that is "8/20/2026, 3:45:12 PM" (M/D/YYYY), so the previous hardcoded
// "DD/MM/YYYY, HH:mm:ss" parse was already wrong for most rows and produced
// "Invalid date". Parse ISO first, then fall back through the legacy shapes.
const REPLY_DATE_FORMATS = [
  moment.ISO_8601,
  "M/D/YYYY, h:mm:ss A",
  "DD/MM/YYYY, HH:mm:ss",
];

const formatReplyDate = (value?: string): string => {
  if (!value) return "";
  const m = moment(value, REPLY_DATE_FORMATS, false);
  return m.isValid() ? m.format("D MMMM YYYY [at] HH:mm") : value;
};

// Staff turns are visually distinguished from the student's own messages so a
// long thread can be skimmed. Roles come from the reply itself (#43).
const roleLabel = (role?: string): string => {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "Admin";
    case "superadmin":
    case "super-admin":
      return "Super Admin";
    case "instructor":
    case "teacher":
      return "Instructor";
    case "student":
      return "Student";
    default:
      return "";
  }
};

const isStaff = (role?: string): boolean => {
  const r = (role || "").toLowerCase();
  return r !== "" && r !== "student";
};

export interface TicketReplyThreadProps {
  replies?: any[];
  /** Ticket status — drives the read-only notice when locked. */
  status?: string;
  replyText: string;
  onReplyTextChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting?: boolean;
}

const TicketReplyThread: React.FC<TicketReplyThreadProps> = ({
  replies,
  status,
  replyText,
  onReplyTextChange,
  onSubmit,
  submitting,
}) => {
  // Resolved and Closed tickets are permanently read-only (#43 item 6). The
  // server enforces this too; hiding the box avoids a guaranteed-failing post.
  const locked = status === "Closed" || status === "Resolved";

  // Oldest first, so the conversation reads top to bottom.
  const ordered = [...(replies || [])].sort((a, b) => {
    const am = moment(a?.date, REPLY_DATE_FORMATS, false);
    const bm = moment(b?.date, REPLY_DATE_FORMATS, false);
    if (!am.isValid() || !bm.isValid()) return 0;
    return am.valueOf() - bm.valueOf();
  });

  return (
    <div>
      {ordered.map((reply: any, idx: number) => {
        const label = roleLabel(reply.role);
        return (
          <div
            key={reply._id || idx}
            className={`mb-3 py-2 px-3 border rounded-3 ${
              isStaff(reply.role) ? "bg-light border-primary-subtle" : ""
            }`}
          >
            <div className="d-flex justify-content-between align-items-start gap-2">
              <div>
                <h6 className="fs-16 fw-medium mb-0 d-flex align-items-center gap-2">
                  <strong>{reply.name || reply.userName || ""}</strong>
                  {label && (
                    <span
                      className={`badge ${
                        isStaff(reply.role)
                          ? "bg-primary-transparent text-primary"
                          : "bg-light text-muted"
                      }`}
                      style={{ fontSize: 10 }}
                    >
                      {label}
                    </span>
                  )}
                </h6>
                <p className="fs-10 text-muted mb-0">{reply.email}</p>
              </div>
              <span className="fs-10 text-muted text-nowrap">
                {formatReplyDate(reply.date)}
              </span>
            </div>
            <div className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
              {reply.message}
            </div>
            {reply.attachment?.url && (
              <a
                href={reply.attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="d-inline-flex align-items-center mt-2 fs-13"
              >
                <i className="isax isax-paperclip-2 me-1" />
                {reply.attachment.originalname || "Attachment"}
              </a>
            )}
          </div>
        );
      })}

      {locked ? (
        <div className="alert alert-light border mb-0 fs-13">
          This ticket is {String(status).toLowerCase()}. The conversation is
          read-only — open a new ticket if you still need help.
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <textarea
            className="form-control mb-2"
            value={replyText}
            onChange={(e) => onReplyTextChange(e.target.value)}
            placeholder="Write your reply"
            rows={2}
            required
          />
          <button
            className="btn btn-secondary btn-sm rounded-pill"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Add Reply"}
          </button>
        </form>
      )}
    </div>
  );
};

export default TicketReplyThread;
