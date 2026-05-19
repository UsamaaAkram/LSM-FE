import moment from "moment";
import ImageGlobal from "../core/common/ImageGlobal/ImageGlobal";

const getOtherParticipant = (participants: any, currentUserId: any) => {
  if (!Array.isArray(participants)) return undefined;
  return participants.find((u: any) => {
    if (!u) return false;
    if (typeof u === "string") return u !== currentUserId;
    return u._id !== currentUserId;
  });
};

const timeLabel = (msg: any) => {
  let timeLabel;
  const msgDate = moment(msg.createdAt);
  if (msgDate.isSame(moment(), "day")) {
    timeLabel = msgDate.format("hh:mm A");
  } else {
    timeLabel = msgDate.format("DD MMM, hh:mm A");
  }
  return timeLabel;
};

const ChatSidebarList = ({
  filteredChats,
  activeChat,
  setActiveChat,
  currentUser,
}: any) => {
  const uniqueChats = Array.from(
    new Map(filteredChats?.map((chat: any) => [chat._id, chat])).values()
  );

  return (
    <>
      {uniqueChats.map((chat: any) => {
        let chatDisplayName = chat.groupName;
        let photo = "assets/img/user/user-29.jpg";
        if (!chat.isGroup) {
          const otherParticipant = getOtherParticipant(
            chat.participants,
            currentUser._id
          );
          chatDisplayName =
            otherParticipant?.name.trim() ? otherParticipant?.name.trim() : otherParticipant?.userName ?? "";
          photo = otherParticipant?.photo || photo;
        } else {
          photo = chat.photo || photo;
        }

        return (
          <div
            key={chat._id}
            className={`d-flex align-items-center px-2 py-2 mb-2 chat-member ${
              activeChat?._id === chat._id
                ? "border border-primary rounded-lg bg-light"
                : "rounded-lg !bg-light border border-muted"
            }`}
            style={{
              cursor: "pointer",
              transition: "background 0.2s",
              minHeight: "60px",
              boxShadow:
                activeChat?._id === chat._id ? "0 0 10px #0053f350" : "none",
              background:
                activeChat?._id === chat._id ? "#f0f8ff" : "transparent",
            }}
            onClick={() => setActiveChat(chat)}
          >
            <ImageGlobal
              src={photo}
              alt="User Image"
              className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
            />
            <div>
              <h6 className="fs-16 fw-medium mb-1 d-flex align-items-center">
                {chatDisplayName}{" "}
                {chat.unreadCount > 0 && (
                  <span className="msg-count badge badge-secondary d-flex align-items-center justify-content-center rounded-circle ms-2">
                    {chat.unreadCount}
                  </span>
                )}
              </h6>
              <p>
                {" "}
                Last message:{" "}
                {chat.updatedAt
                  ? timeLabel({ createdAt: chat.updatedAt })
                  : "New"}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ChatSidebarList;
