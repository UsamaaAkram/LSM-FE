import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  dismissNotification,
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationReceived,
} from "../core/redux/notificationSlice";
import type { AppNotification } from "../core/redux/notificationSlice";
import { chatSocket } from "../utils/chatSocket";

// #2.16 — unread badge + dropdown list.
//
// Polls the cheap count endpoint rather than the full list, and only while the
// tab is visible so a backgrounded tab isn't hitting the API all day.
const POLL_MS = 60000;

const ICONS: Record<string, string> = {
  enrollment_approved: "isax isax-tick-circle text-success",
  enrollment_rejected: "isax isax-close-circle text-danger",
  enrollment_submitted: "isax isax-clipboard-tick text-primary",
  assignment_reviewed: "isax isax-clipboard-text text-primary",
  assignment_submitted: "isax isax-clipboard-text text-primary",
  quiz_graded: "isax isax-award text-primary",
  ticket_reply: "isax isax-ticket text-info",
  ticket_resolved: "isax isax-ticket text-success",
  community_reply: "isax isax-message-text text-primary",
  community_mention: "isax isax-user-tag text-primary",
  announcement: "isax isax-volume-high text-warning",
  order_status: "isax isax-shop text-primary",
  system: "isax isax-notification text-muted",
};

const NotificationBell: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((s: any) => s.auth?.user);
  const { items, unreadCount, loading } = useSelector(
    (s: any) => s.notifications || {}
  );
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const userId = auth?._id;

  // Live push, with polling kept as a safety net for a dropped socket.
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchUnreadCount(userId) as any);

    chatSocket.connect();
    // registerUser joins this user's room on the server, which is what the
    // push targets — and it covers all their devices, not just one.
    chatSocket.emit("registerUser", userId);
    const onNotification = (n: any) => dispatch(notificationReceived(n));
    chatSocket.on("notification", onNotification);

    const tick = () => {
      if (document.visibilityState === "visible") {
        dispatch(fetchUnreadCount(userId) as any);
      }
    };
    const t = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      chatSocket.off("notification", onNotification);
      clearInterval(t);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [dispatch, userId]);

  // Full list is only fetched when the panel is actually opened.
  useEffect(() => {
    if (open && userId) dispatch(fetchNotifications(userId) as any);
  }, [open, userId, dispatch]);

  // Click-outside to close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  if (!userId) return null;

  const openItem = (n: AppNotification) => {
    if (!n.isRead) dispatch(markNotificationRead(n._id) as any);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="position-relative" ref={boxRef}>
      <button
        type="button"
        className="btn position-relative"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        aria-expanded={open}
      >
        <i className="isax isax-notification fs-20" />
        {unreadCount > 0 && (
          <span
            className="position-absolute badge rounded-pill bg-danger"
            style={{ top: 2, right: 0, fontSize: 10 }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute bg-white border rounded shadow-sm"
          style={{
            right: 0,
            top: "100%",
            width: 340,
            maxHeight: 420,
            overflowY: "auto",
            zIndex: 1050,
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
            <strong className="fs-14">Notifications</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-link p-0 fs-13"
                onClick={() =>
                  dispatch(markAllNotificationsRead(userId) as any)
                }
              >
                Mark all read
              </button>
            )}
          </div>

          {loading && !items?.length ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm" />
            </div>
          ) : !items?.length ? (
            <p className="text-muted text-center py-4 mb-0 fs-13">
              Nothing new right now.
            </p>
          ) : (
            items.map((n: AppNotification) => (
              <div
                key={n._id}
                className={`d-flex gap-2 p-2 border-bottom ${
                  n.isRead ? "" : "bg-light"
                }`}
              >
                <i
                  className={`${ICONS[n.type] ?? ICONS.system} fs-18 mt-1`}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="btn text-start p-0 flex-grow-1"
                  onClick={() => openItem(n)}
                >
                  <div className="fs-14 fw-semibold">{n.title}</div>
                  {n.body && (
                    <div
                      className="text-muted fs-13"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {n.body}
                    </div>
                  )}
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    {moment(n.createdAt).fromNow()}
                    {n.actorName ? ` · ${n.actorName}` : ""}
                  </div>
                </button>
                <button
                  type="button"
                  className="btn btn-sm text-muted p-0 align-self-start"
                  aria-label="Dismiss"
                  onClick={() => dispatch(dismissNotification(n._id) as any)}
                >
                  <i className="isax isax-close-circle" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
