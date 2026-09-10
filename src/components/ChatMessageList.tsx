import moment from "moment";
import { useState } from "react";
import ImageGlobal from "../core/common/ImageGlobal/ImageGlobal";

const EMOJI_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const timeLabel = (msg: any) => {
  const msgDate = moment(msg.createdAt);
  return msgDate.isSame(moment(), "day")
    ? msgDate.format("hh:mm A")
    : msgDate.format("DD MMM, hh:mm A");
};

const getSenderId = (sender: any) =>
  typeof sender === "string" ? sender : sender?._id;

// URLs pasted into a message weren't clickable at all (#2's URL bug).
// split() with a capturing group returns the URLs at odd indices — check
// the index, not a stateful global-regex .test() (which has lastIndex
// gotchas when re-run per element).
const URL_RE = /(https?:\/\/[^\s]+)/g;
function linkify(text: string) {
  if (!text) return text;
  const parts = text.split(URL_RE);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}

// #2.13 — read receipt on your own messages.
//
//   ✓   sent    — stored on the server, nobody else has opened it yet
//   ✓✓  read    — at least one other participant has seen it
//
// The doc also lists a separate "delivered" state. There is no per-recipient
// delivery signal to base that on (the server doesn't track which devices
// received which message), so showing it would be a guess dressed up as fact.
// Two honest states instead of three invented ones.
const ReadReceipt = ({
  msg,
  currentUserId,
}: {
  msg: any;
  currentUserId?: string;
}) => {
  // A message not yet saved has no id, so it can't have been read.
  const seen = (msg?.seenBy ?? []).filter(
    (id: any) => String(typeof id === "string" ? id : id?._id) !== String(currentUserId)
  );
  const isRead = seen.length > 0;
  return (
    <span
      title={isRead ? `Read by ${seen.length}` : "Sent"}
      aria-label={isRead ? "Read" : "Sent"}
      style={{
        fontSize: 10,
        lineHeight: 1,
        letterSpacing: -2,
        color: isRead ? "#2563EB" : "#1b1e24",
        opacity: isRead ? 1 : 0.5,
      }}
    >
      {isRead ? "✓✓" : "✓"}
    </span>
  );
};

// Reusable ReactionBar always BELOW the bubble
const ReactionBar = ({
  reactions,
  msgId,
  pickerForId,
  setPickerForId,
  onReactMessage,
  isSentByCurrent,
}: {
  reactions: any[];
  msgId: string;
  pickerForId: string | null;
  setPickerForId: (id: string | null) => void;
  onReactMessage: any;
  isSentByCurrent: boolean;
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: isSentByCurrent ? "row" : "row-reverse",
        background: "rgba(108,112,116,0.23)",
        gap: 3,
        borderRadius: 21,
        padding: "4px 4px",
        marginTop: -8,
        zIndex: 9,
        position: "relative",
      }}
    >
      {/* Reaction Chips */}
      {pickerForId !== msgId &&
        reactions.map((r) => (
          <span
            key={r.emoji}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              cursor: "pointer",
              position: "relative",
              transition: "box-shadow 0.2s, border 0.2s",
            }}
            onClick={() => {
              if (r.reacted) {
                onReactMessage &&
                  onReactMessage({
                    messageId: msgId,
                    emoji: "", // Empty string signals REMOVE (see backend below)
                    removeEmoji: r.emoji, // tell backend which emoji to remove
                  });
              } else {
                // Add reaction
                onReactMessage &&
                  onReactMessage({
                    messageId: msgId,
                    emoji: r.emoji,
                  });
              }
            }}
            title={r.reacted ? "Remove your reaction" : "React"}
          >
            <span style={{ fontSize: 17 }}>{r.emoji}</span>
            {r.count > 1 && (
              <span
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  background: "#e43e51",
                  color: "#fff",
                  borderRadius: 7,
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "1px 5px",
                  minWidth: 15,
                  textAlign: "center",
                  boxShadow: "0 1px 4px #e43e5144",
                  transform: "translate(45%, 45%)",
                }}
              >
                {r.count}
              </span>
            )}
          </span>
        ))}
      {/* "+" Picker Chip */}
      <span
        style={{
          background: "#fff",
          borderRadius: "100%",
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          cursor: "pointer",
          border: "1px solid #7e828b",
          boxShadow: "0 1px 7px #fff",
        }}
        onClick={() => setPickerForId(pickerForId === msgId ? null : msgId)}
        title="Add reaction"
      >
        +
      </span>
      {/* Emoji Picker Popup */}
      {pickerForId === msgId && (
        <div
          className="msg-reaction-picker shadow"
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 21,
            zIndex: 999,
            padding: 5,
            display: "flex",
            gap: 5,
            boxShadow: "0 5px 24px #dedede",
          }}
        >
          {EMOJI_LIST.map((emoji) => (
            <span
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                onReactMessage && onReactMessage({ messageId: msgId, emoji });
                setPickerForId(null);
              }}
              key={emoji}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatMessageList = ({
  messages,
  currentUser,
  onReactMessage,
  onEditMessage,
  onDeleteMessage,
  // #2.13 — receipts are hidden in announcement channels. Defaults to false so
  // existing call sites keep working unchanged.
  isAnnouncement = false,
}: any) => {
  const [pickerForId, setPickerForId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [urlPath, setUrlPath] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const isModerator = currentUser?.role === "instructor" || currentUser?.role === "admin";

  function groupReactions(reactions = []) {
    const map: Record<
      string,
      { emoji: string; count: number; reacted: boolean }
    > = {};
    reactions.forEach((r: any) => {
      if (!map[r.emoji])
        map[r.emoji] = { emoji: r.emoji, count: 0, reacted: false };
      map[r.emoji].count += 1;
      if (r.user === currentUser._id) map[r.emoji].reacted = true;
    });
    return Object.values(map);
  }

  function renderMessageRow(msg: any, isSentByCurrent: boolean) {
    const reactions = groupReactions(msg.reactions);
    return (
      <li
        className={isSentByCurrent ? "sent-message-group" : "media received"}
        key={msg._id}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isSentByCurrent ? "flex-end" : "flex-start",
          gap: 0,
          marginBottom: 10,
          position: "relative",
        }}
      >
        <div
          className={
            "msg-box " +
            (isSentByCurrent && !msg.attachment ? "bg-secondary" : "bg-light")
          }
          style={{
            background: isSentByCurrent ? "" : "#f6f8fb",
            borderRadius: 15,
            padding: "5px 15px",
            maxWidth: 345,
            fontWeight: 500,
            wordBreak: "break-word",
            minHeight: 40,
            zIndex: 2,
          }}
          onMouseLeave={() => setPickerForId(null)}
        >
          {msg?.type === "attachment" && msg?.attachment ? (
            <>
              <ImageGlobal
                src={msg.attachment}
                alt="Attachment"
                height={100}
                onClick={() => {
                  setShowModal(true);
                  setUrlPath(msg.attachment);
                }}
              />
            </>
          ) : editingId === msg._id ? (
            <div className="d-flex align-items-center gap-1">
              <input
                type="text"
                className="form-control form-control-sm"
                value={editValue}
                autoFocus
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editValue.trim()) {
                    onEditMessage?.({ messageId: msg._id, content: editValue.trim() });
                    setEditingId(null);
                  } else if (e.key === "Escape") {
                    setEditingId(null);
                  }
                }}
              />
              <i
                className="isax isax-tick-circle5 text-success"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (editValue.trim()) {
                    onEditMessage?.({ messageId: msg._id, content: editValue.trim() });
                  }
                  setEditingId(null);
                }}
              />
              <i
                className="isax isax-close-circle"
                style={{ cursor: "pointer" }}
                onClick={() => setEditingId(null)}
              />
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 500,
                color: isSentByCurrent ? "#fff" : "#1b1e24",
              }}
            >
              {linkify(msg.content)}
              {msg.editedAt && (
                <span
                  style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}
                >
                  (edited)
                </span>
              )}
            </p>
          )}
          <div
            style={{
              marginTop: 3,
              display: "flex",
              alignItems: "center",
              gap: 6,
              justifyContent: isSentByCurrent ? "flex-end" : "flex-start",
              color: isSentByCurrent ? "#fff" : "#bbb",
            }}
          >
            <p
              style={{
                fontSize: 10,
                opacity: 0.62,
                margin: 0,
                color: "#1b1e24",
              }}
            >
              {timeLabel(msg)}
            </p>
            {/* #2.13 — read receipt, on your own messages only, and never in an
                announcement channel (a broadcast to a whole cohort has no
                meaningful "read by" state). */}
            {isSentByCurrent && !isAnnouncement && (
              <ReadReceipt msg={msg} currentUserId={currentUser?._id} />
            )}
            {msg?.type !== "attachment" && isSentByCurrent && editingId !== msg._id && (
              <i
                className="isax isax-edit-2"
                style={{ fontSize: 11, cursor: "pointer", color: "#1b1e24" }}
                title="Edit"
                onClick={() => {
                  setEditingId(msg._id);
                  setEditValue(msg.content || "");
                }}
              />
            )}
            {(isSentByCurrent || isModerator) && (
              <i
                className="isax isax-trash"
                style={{ fontSize: 11, cursor: "pointer", color: "#1b1e24" }}
                title="Delete"
                onClick={() => {
                  if (window.confirm("Delete this message?")) {
                    onDeleteMessage?.({ messageId: msg._id });
                  }
                }}
              />
            )}
          </div>
        </div>
        {/* Reaction bar is always sibling, not child or absolutely placed */}
        <ReactionBar
          reactions={reactions}
          msgId={msg._id}
          pickerForId={pickerForId}
          setPickerForId={setPickerForId}
          onReactMessage={onReactMessage}
          isSentByCurrent={isSentByCurrent}
        />
      </li>
    );
  }

  return (
    <>
      {messages.length === 0 ? (
        <li className="text-center text-muted py-5">
          No messages yet. Start the conversation!
        </li>
      ) : (
        <>
          {messages.map((msg: any) => {
            const senderId = getSenderId(msg.sender);
            const isSentByCurrent = senderId === currentUser?._id;
            return renderMessageRow(msg, isSentByCurrent);
          })}
          {/* Add/Edit lesson modal */}
          <div
            className={`modal fade${showModal ? " show d-block" : ""}`}
            style={showModal ? { background: "rgba(0,0,0,0.2)" } : {}}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header d-flex align-items-center justify-content-between">
                  <h5>Attachment</h5>
                  <button
                    type="button"
                    className="btn-close custom-btn-close"
                    aria-label="Close"
                    onClick={() => {
                      setShowModal(false);
                      setUrlPath("");
                    }}
                  >
                    <i className="isax isax-close-circle5" />
                  </button>
                </div>
                <div className="modal-body">
                  <ImageGlobal
                    src={urlPath}
                    alt="Attachment"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatMessageList;
