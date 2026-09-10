import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import {
  deleteAnnouncement,
  editAnnouncement,
  fetchAnnouncements,
  pinAnnouncement,
  publishAnnouncement,
} from "../../../core/redux/announcementSlice";
import type { Announcement } from "../../../core/redux/announcementSlice";

// #2.1 / #2.4 / #2.7 — Announcements management.
//
// This page was template scaffolding: it rendered a fixed list from a static
// file and nothing on it wrote anywhere. It now manages the real announcement
// channel — the same one students see in Messages — with publish, edit, delete
// and pin.

const STAFF = ["admin", "superadmin", "super-admin", "instructor", "teacher"];

const senderName = (a: Announcement) => {
  const s = a.sender;
  if (!s || typeof s === "string") return "Bluverse";
  return s.name || s.userName || "Bluverse";
};

// Makes URLs clickable (#2.2). Splits on one pattern and uses index parity
// rather than repeatedly testing a global regex, which carries state between
// calls and gives inconsistent results.
const URL_RE = /(https?:\/\/[^\s]+)/g;
const linkify = (text: string) =>
  String(text ?? "")
    .split(URL_RE)
    .map((part, i) =>
      i % 2 === 1 ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );

const InstructorAnnouncements: React.FC = () => {
  const dispatch = useDispatch();
  const { items, chatId, loading, saving, error } = useSelector(
    (s: any) => s.announcements || {}
  );
  const currentUser = useSelector((s: any) => s.auth?.user);

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const me = useMemo(() => {
    const role = String(currentUser?.role ?? "");
    return {
      id: currentUser?._id ?? "",
      role,
      isStaff: STAFF.includes(role.toLowerCase()),
      // Message senders are polymorphic; admins are stored as User.
      senderModel: role === "instructor" ? "Instructor" : "User",
    };
  }, [currentUser]);

  useEffect(() => {
    dispatch(fetchAnnouncements() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const action: any = await dispatch(
      publishAnnouncement({
        sender: me.id,
        senderModel: me.senderModel,
        role: me.role,
        content: draft.trim(),
      }) as any
    );
    if (publishAnnouncement.fulfilled.match(action)) {
      setDraft("");
      toast.success("Announcement published.");
    }
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) return;
    const action: any = await dispatch(
      editAnnouncement({
        id,
        content: editValue.trim(),
        userId: me.id,
        role: me.role,
      }) as any
    );
    if (editAnnouncement.fulfilled.match(action)) {
      setEditingId(null);
      setEditValue("");
      toast.success("Announcement updated.");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this announcement for everyone?")) return;
    const action: any = await dispatch(
      deleteAnnouncement({
        id,
        userId: me.id,
        userModel: me.senderModel,
      }) as any
    );
    if (deleteAnnouncement.fulfilled.match(action)) {
      toast.success("Announcement deleted.");
    }
  };

  const togglePin = (a: Announcement) =>
    dispatch(
      pinAnnouncement({ id: a._id, pinned: !a.isPinned, role: me.role }) as any
    );

  return (
    <>
      <Breadcrumb title="Announcements" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title mb-3">
                <h5>Announcements</h5>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                  Published to every student in the Announcement group.
                </p>
              </div>

              {/* Composer — staff only */}
              {me.isStaff ? (
                <form onSubmit={publish} className="card border-0 shadow-sm mb-3">
                  <div className="card-body">
                    <textarea
                      className="form-control mb-2"
                      rows={3}
                      placeholder="Write an announcement. Links are made clickable automatically."
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <div className="d-flex justify-content-end">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm"
                        disabled={saving || !draft.trim() || !chatId}
                      >
                        {saving ? "Publishing..." : "Publish"}
                      </button>
                    </div>
                    {!chatId && !loading && (
                      <p
                        className="text-danger mb-0 mt-2"
                        style={{ fontSize: 13 }}
                      >
                        No announcement group exists yet, so there is nowhere to
                        publish to. Create the Announcements group first.
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <div className="alert alert-light border">
                  Only staff can publish announcements.
                </div>
              )}

              {/* List */}
              {loading && !items?.length ? (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              ) : !items?.length ? (
                <div className="text-center text-muted py-5">
                  <p className="fs-18 mb-1">📢</p>
                  <p className="mb-0">No announcements yet.</p>
                </div>
              ) : (
                items.map((a: Announcement) => (
                  <div
                    key={a._id}
                    className={`card border-0 shadow-sm mb-3 ${
                      a.isPinned ? "border-start border-warning border-3" : ""
                    }`}
                  >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <strong>{senderName(a)}</strong>
                            {a.isPinned && (
                              <span
                                className="badge bg-warning-transparent text-warning"
                                style={{ fontSize: 10 }}
                              >
                                Pinned
                              </span>
                            )}
                          </div>
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {moment(a.createdAt).format("D MMM YYYY, HH:mm")}
                            {a.editedAt ? " · edited" : ""}
                          </div>
                        </div>

                        {me.isStaff && (
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              title={a.isPinned ? "Unpin" : "Pin to top"}
                              onClick={() => togglePin(a)}
                            >
                              {a.isPinned ? "Unpin" : "Pin"}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              onClick={() => {
                                setEditingId(a._id);
                                setEditValue(a.content || "");
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm text-danger"
                              onClick={() => remove(a._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {editingId === a._id ? (
                        <div className="mt-3">
                          <textarea
                            className="form-control mb-2"
                            rows={3}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                          />
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => saveEdit(a._id)}
                              disabled={!editValue.trim()}
                            >
                              Save changes
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              onClick={() => {
                                setEditingId(null);
                                setEditValue("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                          {linkify(a.content)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorAnnouncements;
