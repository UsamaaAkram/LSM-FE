import React, { useState } from "react";

import {
  LINK_DELIVERY_TYPES,
  STATUS_FLOW,
  STATUS_STYLE,
  normaliseStatus,
} from "../../redux/orderSlice";
import type { Order, OrderStatus } from "../../redux/orderSlice";
import { WHATSAPP_ENROLL } from "../bluverseLinks";

// Shared order pieces (brief §6 and §8).
//
// Both the student's My Products page and the staff review queue render the
// same badge, timeline and delivery panel. They live here so the two can never
// disagree about what a status looks like or where a delivery is shown, which
// is how "the admin says delivered and the student sees nothing" happens.

export const orderDate = (v?: string | null) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

/** Colour-coded status pill. Every stage has its own colour (brief: the two review states looked identical). */
export const StatusBadge: React.FC<{ status?: string; className?: string }> = ({
  status,
  className,
}) => {
  const s = normaliseStatus(status);
  const style = STATUS_STYLE[s] || STATUS_STYLE["Pending Payment"];
  return (
    <span className={`badge ${style.badge} ${className || ""}`}>{style.label}</span>
  );
};

/**
 * The brief's visual progress tracker.
 *
 * A rejected order is drawn as its own terminal state rather than as a point
 * along the flow — showing "step 2 of 6" for something that has stopped would
 * imply it is still moving.
 */
export const OrderTimeline: React.FC<{ order: Order }> = ({ order }) => {
  const current = normaliseStatus(order.status);

  if (current === "Rejected") {
    return (
      <div className="alert alert-danger mb-0">
        <strong>Rejected.</strong>{" "}
        {order.rejectionReason ||
          "We couldn't verify this payment. Please contact support."}
      </div>
    );
  }

  const reached = STATUS_FLOW.indexOf(current as any);
  // A status outside the flow (bad data, or a value added server-side that this
  // build doesn't know) must not silently render as "nothing reached" — treat
  // the first stage as done and say so rather than showing a blank tracker.
  const idx = reached >= 0 ? reached : 0;

  return (
    <div className="d-flex flex-wrap align-items-start gap-0">
      {STATUS_FLOW.map((stage, i) => {
        const done = i <= idx;
        const style = STATUS_STYLE[stage as OrderStatus];
        return (
          <React.Fragment key={stage}>
            <div
              className="text-center"
              style={{ minWidth: 96, flex: "1 1 96px" }}
            >
              <div
                className="mx-auto d-flex align-items-center justify-content-center"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: done ? style.dot : "transparent",
                  border: `2px solid ${done ? style.dot : "#dee2e6"}`,
                  color: "#fff",
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                {done ? "✓" : ""}
              </div>
              <div
                className={`mt-1 ${done ? "fw-semibold" : "text-muted"}`}
                style={{ fontSize: 11 }}
              >
                {stage}
              </div>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div
                className="flex-grow-1 d-none d-md-block"
                style={{
                  height: 2,
                  marginTop: 11,
                  minWidth: 8,
                  background: i < idx ? STATUS_STYLE[stage as OrderStatus].dot : "#dee2e6",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/** Copy-to-clipboard, for keys and credentials that are tedious to select by hand. */
const CopyField: React.FC<{ label: string; value: string; mask?: boolean }> = ({
  label,
  value,
  mask,
}) => {
  const [shown, setShown] = useState(!mask);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access is blocked on insecure origins and in some embedded
      // webviews. The value is on screen either way, so this is not an error
      // worth interrupting the student with.
    }
  };

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
      <span className="text-muted" style={{ minWidth: 96, fontSize: 13 }}>
        {label}
      </span>
      <code
        className="px-2 py-1 rounded bg-light flex-grow-1"
        style={{ wordBreak: "break-all" }}
      >
        {shown ? value : "•".repeat(Math.min(value.length, 16))}
      </code>
      {mask && (
        <button
          type="button"
          className="btn btn-sm btn-light"
          onClick={() => setShown((v) => !v)}
        >
          {shown ? "Hide" : "Show"}
        </button>
      )}
      <button type="button" className="btn btn-sm btn-light" onClick={copy}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
};

/**
 * What the student actually received (brief §5).
 *
 * Falls back to the pre-expansion `deliveredContent` field so orders delivered
 * before the rebuild still show their handover instead of appearing empty.
 */
export const DeliveryPanel: React.FC<{ order: Order }> = ({ order }) => {
  const d = order.delivery || {};
  const legacy = String(order.deliveredContent || "").trim();
  const value = String(d.value || "").trim();
  const hasCreds = !!String(d.username || "").trim();
  const instructions = String(d.instructions || "").trim();

  if (!value && !hasCreds && !instructions && !legacy) {
    return (
      <p className="text-muted mb-0" style={{ fontSize: 13 }}>
        Nothing has been handed over yet.
      </p>
    );
  }

  const isLink = LINK_DELIVERY_TYPES.includes(String(d.type || ""));

  return (
    <div>
      {d.type && (
        <div className="mb-2">
          <span className="badge bg-light text-dark">{d.type}</span>
          {d.deliveredAt && (
            <span className="text-muted ms-2" style={{ fontSize: 12 }}>
              Delivered {orderDate(d.deliveredAt)}
              {d.deliveredByName ? ` by ${d.deliveredByName}` : ""}
            </span>
          )}
        </div>
      )}

      {value && isLink && (
        <p className="mb-2">
          <a href={value} target="_blank" rel="noopener noreferrer">
            <i className="isax isax-link-2 me-1" />
            Open your {String(d.type).toLowerCase()}
          </a>
        </p>
      )}
      {value && !isLink && <CopyField label={String(d.type)} value={value} />}

      {hasCreds && (
        <>
          <CopyField label="Username" value={String(d.username)} />
          {/* Masked by default: these pages get opened on shared screens. */}
          {!!String(d.password || "").trim() && (
            <CopyField label="Password" value={String(d.password)} mask />
          )}
        </>
      )}

      {instructions && (
        <div className="mt-2 p-2 bg-light rounded" style={{ whiteSpace: "pre-wrap" }}>
          {instructions}
        </div>
      )}

      {/* Only shown when there is nothing newer, so a re-delivered order does
          not display both the old blob and the new fields. */}
      {!value && !hasCreds && !instructions && legacy && (
        <div className="p-2 bg-light rounded" style={{ whiteSpace: "pre-wrap" }}>
          {legacy}
        </div>
      )}
    </div>
  );
};

/** Per-order support block (brief §6). */
export const OrderSupport: React.FC<{ order: Order }> = ({ order }) => {
  // A wa.me/message/<code> short link silently drops ?text=, so the reference
  // is only pre-filled when the constant is a plain number link.
  const base = WHATSAPP_ENROLL.split("?")[0];
  const href = /wa\.me\/message\//.test(base)
    ? base
    : `${base}?text=${encodeURIComponent(
        `Hi, I need help with my order ${order.orderId || ""} (${order.productTitle}).`
      )}`;

  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-sm btn-success"
      >
        <i className="isax isax-whatsapp me-1" />
        WhatsApp support
      </a>
      <a href="mailto:bluversedigitalhub@gmail.com" className="btn btn-sm btn-light">
        <i className="isax isax-sms me-1" />
        Email support
      </a>
      <span className="text-muted" style={{ fontSize: 12 }}>
        Quote your reference {order.orderId || "—"}. Order status is always
        managed here in the LMS, whatever is discussed on WhatsApp.
      </span>
    </div>
  );
};
