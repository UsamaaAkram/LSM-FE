import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import {
  commentOnPost,
  communityPostRemoved,
  communityPostUpserted,
  createCommunityPost,
  deleteCommunityPost,
  fetchCommunityCategories,
  fetchCommunityPosts,
  lockCommunityPost,
  pinCommunityPost,
  reactToPost,
} from "../core/redux/communitySlice";
import type {
  CommunityPost,
  ReactionType,
} from "../core/redux/communitySlice";
import { renderRichText } from "../core/common/richText";
import { chatSocket } from "../utils/chatSocket";

// #2.5 — the Community tab, shared by the student and instructor Messages pages.

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "celebrate", emoji: "🎉", label: "Celebrate" },
  { type: "applause", emoji: "👏", label: "Applause" },
  { type: "helpful", emoji: "🔥", label: "Helpful" },
];

const MODERATOR_ROLES = ["admin", "superadmin", "super-admin", "instructor", "teacher"];


const CommunityFeed: React.FC = () => {
  const dispatch = useDispatch();
  const { posts, categories, loading, posting, hasMore, error } = useSelector(
    (s: any) => s.community || {}
  );
  const auth = useSelector((s: any) => s.auth?.user);

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] = useState("General Discussion");
  const [files, setFiles] = useState<File[]>([]);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [pickerFor, setPickerFor] = useState<string | null>(null);

  const me = useMemo(() => {
    const s = auth?.student ?? auth ?? {};
    return {
      id: auth?._id ?? "",
      name:
        [s.firstName, s.lastName].filter(Boolean).join(" ") ||
        s.userName ||
        s.name ||
        s.email ||
        "You",
      role: auth?.role ?? "",
      photo: s.photo ?? "",
    };
  }, [auth]);

  const isModerator = MODERATOR_ROLES.includes(
    String(me.role).toLowerCase()
  );

  useEffect(() => {
    dispatch(fetchCommunityCategories() as any);
  }, [dispatch]);

  // Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(
      () =>
        dispatch(
          fetchCommunityPosts({
            ...(category !== "All" ? { category } : {}),
            ...(search.trim() ? { search: search.trim() } : {}),
          }) as any
        ),
      search ? 350 : 0
    );
    return () => clearTimeout(t);
  }, [dispatch, category, search]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // #2.21 — live feed. Joins the community room while this tab is mounted so
  // new posts, replies, reactions and pins arrive without a refresh.
  useEffect(() => {
    chatSocket.connect();
    chatSocket.emit("joinCommunity");

    const onUpsert = (post: CommunityPost) =>
      dispatch(communityPostUpserted(post));
    const onRemove = ({ _id }: { _id: string }) =>
      dispatch(communityPostRemoved(_id));

    chatSocket.on("communityPostCreated", onUpsert);
    chatSocket.on("communityPostUpdated", onUpsert);
    chatSocket.on("communityPostDeleted", onRemove);

    return () => {
      chatSocket.off("communityPostCreated", onUpsert);
      chatSocket.off("communityPostUpdated", onUpsert);
      chatSocket.off("communityPostDeleted", onRemove);
      chatSocket.emit("leaveCommunity");
    };
  }, [dispatch]);

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    if (!me.id) {
      toast.error("Please sign in to post.");
      return;
    }
    const action: any = await dispatch(
      createCommunityPost({
        author: me.id,
        authorName: me.name,
        authorRole: me.role,
        authorPhoto: me.photo,
        category: draftCategory,
        content: draft.trim(),
        attachments: files,
      }) as any
    );
    if (createCommunityPost.fulfilled.match(action)) {
      setDraft("");
      setFiles([]);
      toast.success("Posted.");
    }
  };

  const react = (post: CommunityPost, type: ReactionType) => {
    if (!me.id) return toast.error("Please sign in to react.");
    setPickerFor(null);
    dispatch(reactToPost({ id: post._id, user: me.id, type }) as any);
  };

  const submitComment = async (post: CommunityPost) => {
    const text = (commentDraft[post._id] || "").trim();
    if (!text) return;
    if (!me.id) return toast.error("Please sign in to reply.");
    const action: any = await dispatch(
      commentOnPost({
        id: post._id,
        author: me.id,
        authorName: me.name,
        authorRole: me.role,
        content: text,
      }) as any
    );
    if (commentOnPost.fulfilled.match(action)) {
      setCommentDraft((p) => ({ ...p, [post._id]: "" }));
    }
  };

  const myReaction = (post: CommunityPost) =>
    post.reactions?.find((r) => String(r.user) === String(me.id))?.type;

  const reactionCounts = (post: CommunityPost) => {
    const counts: Partial<Record<ReactionType, number>> = {};
    (post.reactions || []).forEach((r) => {
      counts[r.type] = (counts[r.type] ?? 0) + 1;
    });
    return counts;
  };

  const canManage = (post: CommunityPost) =>
    isModerator || String(post.author) === String(me.id);

  const loadMore = () => {
    if (!posts?.length) return;
    // The cursor must be the oldest UNPINNED post, not simply the last row.
    // Pinned posts sort to the top regardless of age, so if the last row were a
    // pinned-but-old post, asking for "older than that, unpinned" would skip
    // every unpinned post newer than it. When nothing unpinned is on screen
    // yet, start from now so the newest unpinned page comes back.
    const oldestUnpinned = [...posts]
      .filter((p: CommunityPost) => !p.isPinned && p.createdAt)
      .sort(
        (a: CommunityPost, b: CommunityPost) =>
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime()
      )[0];

    dispatch(
      fetchCommunityPosts({
        ...(category !== "All" ? { category } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
        before: oldestUnpinned?.createdAt ?? new Date().toISOString(),
      }) as any
    );
  };

  return (
    <div className="community-feed">
      {/* Composer */}
      <form onSubmit={submitPost} className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="Share something with your classmates. **bold**, *italic*, `code`, - bullets and @name all work."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <select
                className="form-select form-select-sm"
                style={{ width: "auto" }}
                value={draftCategory}
                onChange={(e) => setDraftCategory(e.target.value)}
              >
                {(categories || []).map((c: string) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label className="btn btn-sm btn-light mb-0">
                <i className="isax isax-paperclip-2 me-1" />
                Attach
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) =>
                    setFiles(Array.from(e.target.files || []).slice(0, 5))
                  }
                />
              </label>
              {files.length > 0 && (
                <span className="text-muted fs-13">
                  {files.length} file{files.length > 1 ? "s" : ""}
                  <button
                    type="button"
                    className="btn btn-sm text-danger py-0"
                    onClick={() => setFiles([])}
                  >
                    clear
                  </button>
                </span>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={posting || !draft.trim()}
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </form>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
        <div className="d-flex gap-1 flex-nowrap overflow-auto pb-1">
          {["All", ...(categories || [])].map((c: string) => (
            <button
              key={c}
              type="button"
              className={`btn btn-sm text-nowrap ${
                category === c ? "btn-primary" : "btn-light"
              }`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          type="search"
          className="form-control form-control-sm"
          style={{ maxWidth: 240 }}
          placeholder="Search discussions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Feed */}
      {loading && !posts?.length ? (
        <div className="text-center py-5">
          <span className="spinner-border" />
        </div>
      ) : !posts?.length ? (
        <div className="text-center text-muted py-5">
          <p className="mb-1 fs-18">👋</p>
          <p className="mb-0">
            {search || category !== "All"
              ? "Nothing matches that yet."
              : "Start the first discussion with your classmates."}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post: CommunityPost) => {
            const counts = reactionCounts(post);
            const mine = myReaction(post);
            const total = post.reactions?.length ?? 0;
            const comments = (post.comments || []).filter((c) => !c.isDeleted);
            return (
              <div
                key={post._id}
                className={`card border-0 shadow-sm mb-3 ${
                  post.isPinned ? "border-start border-primary border-3" : ""
                }`}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="avatar avatar-sm rounded-circle bg-light d-inline-flex align-items-center justify-content-center"
                        style={{ width: 36, height: 36 }}
                      >
                        {post.authorPhoto ? (
                          <img
                            src={post.authorPhoto}
                            alt=""
                            className="rounded-circle w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <i className="isax isax-user text-muted" />
                        )}
                      </span>
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <strong>{post.authorName || "Member"}</strong>
                          {post.authorRole &&
                            post.authorRole !== "student" && (
                              <span className="badge bg-primary-transparent text-primary" style={{ fontSize: 10 }}>
                                {post.authorRole}
                              </span>
                            )}
                          {post.isPinned && (
                            <span className="badge bg-warning-transparent text-warning" style={{ fontSize: 10 }}>
                              📌 Pinned
                            </span>
                          )}
                          {post.isLocked && (
                            <span className="badge bg-light text-muted" style={{ fontSize: 10 }}>
                              Locked
                            </span>
                          )}
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          {post.category} · {moment(post.createdAt).fromNow()}
                          {post.editedAt ? " · edited" : ""}
                        </div>
                      </div>
                    </div>

                    {canManage(post) && (
                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          data-bs-toggle="dropdown"
                          aria-label="Post actions"
                        >
                          <i className="isax isax-more" />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                          {isModerator && (
                            <>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    dispatch(
                                      pinCommunityPost({
                                        id: post._id,
                                        pinned: !post.isPinned,
                                        actor: { id: me.id, role: me.role },
                                      }) as any
                                    )
                                  }
                                >
                                  {post.isPinned ? "Unpin" : "Pin to top"}
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    dispatch(
                                      lockCommunityPost({
                                        id: post._id,
                                        locked: !post.isLocked,
                                        actor: { id: me.id, role: me.role },
                                      }) as any
                                    )
                                  }
                                >
                                  {post.isLocked ? "Unlock replies" : "Lock replies"}
                                </button>
                              </li>
                            </>
                          )}
                          <li>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => {
                                if (
                                  window.confirm("Delete this post permanently?")
                                ) {
                                  dispatch(
                                    deleteCommunityPost({
                                      id: post._id,
                                      actor: { id: me.id, role: me.role },
                                    }) as any
                                  );
                                }
                              }}
                            >
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  <p className="mt-3 mb-2" style={{ whiteSpace: "pre-wrap" }}>
                    {renderRichText(post.content)}
                  </p>

                  {!!post.attachments?.length && (
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {post.attachments.map((a, i) =>
                        /^image\//.test(a.mimetype || "") ? (
                          <a
                            key={i}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={a.url}
                              alt={a.originalname || "attachment"}
                              style={{
                                height: 120,
                                borderRadius: 6,
                                border: "1px solid #dee2e6",
                              }}
                            />
                          </a>
                        ) : (
                          <a
                            key={i}
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-light"
                          >
                            <i className="isax isax-document me-1" />
                            {a.originalname || "File"}
                          </a>
                        )
                      )}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="d-flex align-items-center gap-2 flex-wrap border-top pt-2">
                    <div className="position-relative">
                      <button
                        type="button"
                        className={`btn btn-sm ${mine ? "btn-primary" : "btn-light"}`}
                        onClick={() =>
                          setPickerFor(pickerFor === post._id ? null : post._id)
                        }
                      >
                        {mine
                          ? `${REACTIONS.find((r) => r.type === mine)?.emoji} ${
                              REACTIONS.find((r) => r.type === mine)?.label
                            }`
                          : "React"}
                      </button>
                      {pickerFor === post._id && (
                        <div
                          className="position-absolute bg-white border rounded shadow-sm p-1 d-flex gap-1"
                          style={{ bottom: "100%", left: 0, zIndex: 5 }}
                        >
                          {REACTIONS.map((r) => (
                            <button
                              key={r.type}
                              type="button"
                              className="btn btn-sm btn-light"
                              title={r.label}
                              onClick={() => react(post, r.type)}
                            >
                              {r.emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {total > 0 && (
                      <span className="text-muted fs-13">
                        {REACTIONS.filter((r) => counts[r.type]).map((r) => (
                          <span key={r.type} className="me-2">
                            {r.emoji} {counts[r.type]}
                          </span>
                        ))}
                      </span>
                    )}

                    <button
                      type="button"
                      className="btn btn-sm btn-light ms-auto"
                      onClick={() =>
                        setOpenComments((p) => ({
                          ...p,
                          [post._id]: !p[post._id],
                        }))
                      }
                    >
                      <i className="isax isax-message-text me-1" />
                      {comments.length || ""} Repl
                      {comments.length === 1 ? "y" : "ies"}
                    </button>
                  </div>

                  {/* Comments */}
                  {openComments[post._id] && (
                    <div className="mt-3 border-top pt-3">
                      {comments.map((c) => (
                        <div key={c._id} className="mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <strong className="fs-14">
                              {c.authorName || "Member"}
                            </strong>
                            {c.authorRole && c.authorRole !== "student" && (
                              <span className="badge bg-primary-transparent text-primary" style={{ fontSize: 10 }}>
                                {c.authorRole}
                              </span>
                            )}
                            <span className="text-muted" style={{ fontSize: 11 }}>
                              {moment(c.createdAt).fromNow()}
                            </span>
                          </div>
                          <div className="fs-14" style={{ whiteSpace: "pre-wrap" }}>
                            {renderRichText(c.content)}
                          </div>
                        </div>
                      ))}

                      {post.isLocked ? (
                        <p className="text-muted fs-13 mb-0">
                          Replies are locked on this discussion.
                        </p>
                      ) : (
                        <div className="d-flex gap-2 mt-2">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Write a reply..."
                            value={commentDraft[post._id] || ""}
                            onChange={(e) =>
                              setCommentDraft((p) => ({
                                ...p,
                                [post._id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                submitComment(post);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => submitComment(post)}
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="text-center py-2">
              <button
                type="button"
                className="btn btn-light btn-sm"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load older posts"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommunityFeed;
