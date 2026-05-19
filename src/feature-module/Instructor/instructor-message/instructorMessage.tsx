import { useEffect, useRef, useState } from "react";
import { Button, FormControl, InputGroup, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ChatMessageList from "../../../components/ChatMessageList";
import ChatSidebarList from "../../../components/ChatSidebarList";
import EditGroupMembersModal from "../../../components/EditGroupMembersModal";
import NewGroupModal from "../../../components/NewGroupModal";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import {
  addMessage,
  addOrUpdateChat,
  addPage,
  blockChat,
  clearMessages,
  createChat,
  fetchChats,
  fetchChatsWithUnread,
  fetchMessages,
  markChatAsRead,
  prependMessages,
  removeChat,
  setActiveChat,
  unblockChat,
  updateMessageReaction,
  uploadAttachment,
} from "../../../core/redux/chatSlice";
import { fetchAllChatUsers } from "../../../core/redux/chatUserSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import { chatSocket } from "../../../utils/chatSocket";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

const InstructorMessage = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const user = useSelector((state) => state.auth.user);
  const chats = useSelector((state: RootState) => state.chat.chats);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const activeChat = useSelector((state: RootState) => state.chat.activeChat);
  const currentUser: any = useSelector((state: RootState) => state.auth.user);

  // State for searching chats, messages
  const [searchTerm, setSearchTerm] = useState("");
  const [messageText, setMessageText] = useState("");

  // State for new chat modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // All chat users (used for starting new chat)
  const users = useSelector((state: RootState) => state.chatUser.users);

  useEffect(() => {
    dispatch(fetchAllChatUsers());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      dispatch(fetchChats(currentUser._id));
      chatSocket.connect(); // only if not connected already

      chatSocket.on("newMessage", (msg: any) => {
        if (msg.chat === activeChat?._id) {
          dispatch(addMessage(msg));
        }
      });

      chatSocket.on("chatRestored", (chatData: any) => {
        dispatch(addOrUpdateChat(chatData));
      });

      chatSocket.on("newChatCreated", (chatData: any) => {
        dispatch(addOrUpdateChat(chatData));
      });

      return () => {
        chatSocket.off("chatRestored");
        chatSocket.off("newChatCreated");
        chatSocket.off("newMessage");
        chatSocket.disconnect();
      };
    }
  }, [dispatch, currentUser, activeChat?._id]);

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages({ chatId: activeChat?._id, page: 1, limit: 100 }));
      chatSocket.emit("joinChat", { chatId: activeChat._id });
    }
  }, [dispatch, activeChat]);

  const handleSend = () => {
    if (!messageText || !activeChat || !currentUser) return;
    chatSocket.emit("sendMessage", {
      chatId: activeChat._id,
      sender: currentUser._id,
      senderModel:
        currentUser.role === "student"
          ? "Student"
          : currentUser.role === "instructor"
          ? "Instructor"
          : "User",
      type: "text",
      content: messageText,
    });
    setMessageText("");
  };

  // Chat filter for sidebar search
  const filteredChats = chats.filter((chat: any) => {
    const participants = Array.isArray(chat.participants)
      ? chat.participants
      : [];
    const chatName =
      chat.groupName ||
      participants
        .map((p: any) =>
          typeof p === "string" ? p : p?.name || p?.userName || ""
        )
        .join(", ");
    return chatName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // User search results for modal
  const userSearchResults = users?.filter(
    (user: any) =>
      user?.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user?.userName?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleStartNewChat = (userId: string) => {
    if (!currentUser || !currentUser._id || !userId) return;
    const existingChat = chats.find((chat: any) => {
      if (!chat.participants || chat.participants.length !== 2) return false;
      const ids = chat.participants.map((p: any) =>
        typeof p === "string" ? p : p._id
      );
      return ids.includes(currentUser._id) && ids.includes(userId);
    });

    if (existingChat) {
      dispatch(setActiveChat(existingChat));
      setShowNewChatModal(false);
      return;
    }
    dispatch(
      createChat({
        participants: [currentUser._id, userId],
      })
    );
    setShowNewChatModal(false);
  };

  const getOtherParticipant = (participants: any, currentUserId: any) => {
    if (!Array.isArray(participants)) return undefined;
    return participants.find(
      (p: any) => (typeof p === "string" ? p : p._id) !== currentUserId
    );
  };

  // Close Chat
  const handleCloseChat = () => {
    if (!activeChat || !activeChat._id || !currentUser || !currentUser._id)
      return;
    chatSocket.emit("closeChat", {
      chatId: activeChat._id,
      userId: currentUser._id,
    });
    dispatch(setActiveChat(null));
    dispatch(clearMessages());
  };

  // Robustly get the other user's id for this chat (for both string and object cases)
  let otherUserId: string | undefined = undefined;
  if (Array.isArray(activeChat?.participants)) {
    for (const p of activeChat.participants) {
      const pid =
        typeof p === "string"
          ? p
          : p && typeof p === "object" && p._id
          ? p._id
          : undefined;
      if (pid && pid !== currentUser._id) {
        otherUserId = pid;
        break;
      }
    }
  }

  // Block Chat
  const handleBlockChat = () => {
    if (!activeChat || !activeChat._id || !currentUser?._id || !otherUserId)
      return;
    chatSocket.emit("blockChat", {
      chatId: activeChat._id,
      userId: currentUser._id,
    });
    dispatch(
      blockChat({
        chatId: activeChat._id,
        blocker: currentUser._id,
        blocked: otherUserId,
      })
    );
    handleCloseChat();
  };

  const handleUnblockChat = () => {
    if (!activeChat || !activeChat._id || !currentUser?._id || !otherUserId)
      return;
    dispatch(
      unblockChat({
        chatId: activeChat._id,
        blocker: currentUser._id,
        blocked: otherUserId,
      })
    );
    handleCloseChat();
  };

  useEffect(() => {
    const handler = ({
      messageId,
      userId,
      userModel,
      emoji,
      reactions,
    }: any) => {
      dispatch(
        updateMessageReaction({
          messageId,
          userId,
          userModel,
          emoji,
          reactions,
        })
      );
    };
    chatSocket.on("reactMessage", handler);
    return () => {
      chatSocket.off("reactMessage", handler);
    };
  }, [dispatch, activeChat?._id]);

  useEffect(() => {
    const handleChatUnblocked = ({ chatId }: any) => {
      if (activeChat && activeChat._id === chatId) {
        dispatch(fetchChats(currentUser._id));
      }
    };

    if (chatSocket && chatSocket.on) {
      chatSocket.on("chatUnblocked", handleChatUnblocked);
    }

    return () => {
      if (chatSocket && chatSocket.off) {
        chatSocket.off("chatUnblocked", handleChatUnblocked);
      }
    };
  }, [dispatch, activeChat, currentUser?._id]);

  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, activeChat?._id]);

  const [blockedArr, setBlockedArr] = useState<any[]>([]);
  const [isBlockedByMe, setIsBlockedByMe] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(false);

  useEffect(() => {
    const arr = activeChat?.blocked || [];
    setBlockedArr(arr);
    const myId = currentUser?._id?.toString();

    let otherId = undefined;
    if (Array.isArray(activeChat?.participants)) {
      for (const p of activeChat.participants) {
        const pid =
          typeof p === "string"
            ? p
            : p && typeof p === "object" && p._id
            ? p._id
            : undefined;
        if (pid && pid.toString() !== myId) {
          otherId = pid.toString();
          break;
        }
      }
    }

    const isMe = arr.some(
      (item: any) =>
        item.blocker?.toString() === myId &&
        item.blocked?.toString() === otherId
    );
    setIsBlockedByMe(isMe);

    const isOther = arr.some(
      (item: any) =>
        item.blocked?.toString() === myId &&
        item.blocker?.toString() === otherId
    );
    setIsBlockedByOther(isOther);
  }, [activeChat, currentUser]);

  const chatIsBlocked = blockedArr.length > 0;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat || !currentUser) return;
    setUploading(true);
    await dispatch(
      uploadAttachment({
        chatId: activeChat._id,
        file,
        senderId: currentUser.id,
        senderModel:
          currentUser.role === "student"
            ? "Student"
            : currentUser.role === "instructor"
            ? "Instructor"
            : "User",
      })
    );
    setUploading(false);
    e.target.value = ""; // Clear input
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  useEffect(() => {
    if (currentUser && currentUser._id && chatSocket) {
      // Listen for socket connection; fire registerUser once each time
      const handleConnect = () => {
        chatSocket.emit("registerUser", currentUser._id);
      };
      chatSocket.on("connect", handleConnect);
      // If already connected, fire now!
      if (chatSocket.connected) {
        chatSocket.emit("registerUser", currentUser._id);
      }
      return () => {
        chatSocket.off("connect", handleConnect);
      };
    }
  }, [currentUser?._id, chatSocket]);

  useEffect(() => {
    chatSocket.on("removedFromGroup", ({ chatId, groupName }) => {
      dispatch(removeChat(chatId));
      toast.warn(`You've been removed from the group "${groupName}"`);
      if (activeChat && activeChat._id === chatId) {
        dispatch(setActiveChat(null));
        dispatch(clearMessages());
      }
    });

    return () => {
      chatSocket.off("removedFromGroup");
    };
  }, [dispatch, activeChat]);

  useEffect(() => {
    const handleChatCreated = (updatedChat: any) => {
      dispatch(addOrUpdateChat(updatedChat));
      // If active chat, update it too!
      if (activeChat && activeChat._id === updatedChat._id) {
        dispatch(setActiveChat(updatedChat));
      }
    };
    chatSocket.on("newChatCreated", handleChatCreated);
    return () => {
      chatSocket.off("newChatCreated", handleChatCreated);
    };
  }, [dispatch, activeChat]);

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showEditMembersModal, setShowEditMembersModal] = useState(false);

  const isAnnouncementGroup = !!(
    activeChat?.isGroup && activeChat?.isAnnouncement
  );
  const isAdmin =
    activeChat?.admin &&
    Array.isArray(activeChat.admin) &&
    activeChat.admin.some(
      (admin: any) =>
        (typeof admin === "string" ? admin : admin._id) === currentUser._id
    );
  const chatInputRestricted = isAnnouncementGroup && !isAdmin;

  useEffect(() => {
    if (activeChat && currentUser?._id && messages.length) {
      const lastMessageId = messages[messages.length - 1]._id;
      dispatch(
        markChatAsRead({
          chatId: activeChat._id,
          userId: currentUser._id,
          lastMsgId: lastMessageId,
        })
      );
    }
  }, [activeChat?._id, currentUser?._id, messages.length]);

  useEffect(() => {
    const handleUnread = () => {
      if (currentUser && currentUser._id) {
        dispatch(fetchChatsWithUnread(currentUser._id));
      }
    };
    chatSocket.on("chatUnreadUpdate", handleUnread);
    return () => {
      chatSocket.off("chatUnreadUpdate", handleUnread);
    };
  }, [dispatch, currentUser?._id]);

  // Optionally, initial sidebar load (can also go in parent controller)
  useEffect(() => {
    if (currentUser && currentUser._id) {
      dispatch(fetchChatsWithUnread(currentUser._id));
    }
  }, [currentUser?._id, dispatch]);

  const [hasMore, setHasMore] = useState(true);
  const page = useSelector((state: RootState) => state.chat.page);

  useEffect(() => {
    // When activeChat changes, reset messages and load page 1
    if (activeChat && activeChat._id) {
      dispatch(clearMessages());
      dispatch(addPage(1));
      dispatch(
        fetchMessages({ chatId: activeChat?._id, page: 1, limit: 100 })
      ).then((res: any) => {
        if (res.payload.length < 100) setHasMore(false);
        else setHasMore(true);
      });
    }
  }, [activeChat?._id, dispatch]);

  const handleLoadMore = async () => {
    // Loads previous messages
    if (!activeChat || !activeChat._id || !hasMore) return;
    const nextPage = page + 1;
    dispatch(addPage(nextPage));
    const res = await dispatch(
      fetchMessages({ chatId: activeChat?._id, page: nextPage, limit: 100 })
    );
    if (res.payload.length < 100) setHasMore(false); // No more messages
    // Prepend messages to top
    dispatch(prependMessages(res.payload));
  };

  return (
    <>
      <Breadcrumb title="Messages" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="instructor-message">
                <div className="page-title d-flex justify-content-between align-items-center">
                  <h5>Messages</h5>
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => setShowNewChatModal(true)}
                    >
                      + New Chat
                    </Button>
                    {currentUser?.role === "admin" && (
                      <Button
                        variant="primary"
                        onClick={() => setShowNewGroupModal(true)}
                        style={{ marginLeft: 10 }}
                      >
                        + New Group
                      </Button>
                    )}
                  </div>
                </div>
                {/* New Chat Modal */}
                <Modal
                  show={showNewChatModal}
                  onHide={() => setShowNewChatModal(false)}
                  centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title>Start New Chat</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <InputGroup className="mb-3">
                      <FormControl
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        autoFocus
                      />
                    </InputGroup>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {userSearchResults
                        .filter((u: any) => u._id !== currentUser?._id)
                        .map((user: any) => (
                          <div
                            key={user._id}
                            className="d-flex align-items-center mb-2 justify-content-between"
                            style={{
                              borderBottom: "1px solid #f5f5f5",
                              paddingBottom: "0.5rem",
                            }}
                          >
                            <div className="d-flex align-items-center">
                              <ImageGlobal
                                src={
                                  user.photo || "assets/img/user/user-01.jpg"
                                }
                                alt={user.name ?? user.userName}
                                className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                              />
                              <div>
                                <div style={{ fontWeight: 600 }}>
                                  {user.name ?? user.userName}
                                </div>
                                <small className="text-muted">
                                  {user.role}
                                </small>
                              </div>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleStartNewChat(user._id)}
                            >
                              Start Chat
                            </Button>
                          </div>
                        ))}
                      {userSearchResults.filter(
                        (u: any) => u._id !== currentUser?._id
                      ).length === 0 && (
                        <div className="text-muted">No users found.</div>
                      )}
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setShowNewChatModal(false)}
                    >
                      Close
                    </Button>
                  </Modal.Footer>
                </Modal>
                {/* New Group Modal */}
                <NewGroupModal
                  show={showNewGroupModal}
                  onHide={() => setShowNewGroupModal(false)}
                  users={users}
                  currentUser={currentUser}
                />

                <EditGroupMembersModal
                  show={showEditMembersModal}
                  onHide={() => setShowEditMembersModal(false)}
                  activeChat={activeChat}
                  currentUser={currentUser}
                  users={users}
                />

                <div className="row">
                  {/* Chat List Sidebar */}
                  <div className="col-lg-5">
                    <div className="chat-cont-left bg-light">
                      <div className="chat-card mb-0 flex-fill">
                        <div className="chat-header">
                          <div className="input-icon">
                            <span className="input-icon-addon">
                              <i className="isax isax-search-normal-1 fs-14" />
                            </span>
                            <input
                              type="text"
                              className="form-control form-control-md"
                              placeholder="Search chats"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="chat-body chat-users-list chat-scroll">
                          {filteredChats.length === 0 ? (
                            <div className="text-muted p-3">
                              No chats found.
                            </div>
                          ) : (
                            <>
                              <ChatSidebarList
                                filteredChats={filteredChats}
                                activeChat={activeChat}
                                setActiveChat={(c: any) =>
                                  dispatch(setActiveChat(c))
                                }
                                currentUser={currentUser}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Window */}
                  <div className="col-lg-7 chat-cont-right chat-window-long">
                    <div className="chat-two-card chat-window mb-0 shadow-none flex-fill">
                      <div className="border-0 p-0 position-relative">
                        {/* Chat Header */}
                        <div className="msg_head py-3 px-2 border-bottom">
                          <div className="d-flex bd-highlight align-items-center">
                            <Link
                              to="#"
                              className="back-user-list btn me-3"
                              style={{ fontSize: "1.4rem", color: "#aaa" }}
                            >
                              <i className="fas fa-chevron-left" />
                            </Link>
                            {activeChat && activeChat.isGroup ? (
                              <ImageWithBasePath
                                src={"assets/img/grp-users.png"}
                                alt="User"
                                className="avatar avatar-md flex-shrink-0 me-2"
                              />
                            ) : (
                              <ImageGlobal
                                src={
                                  getOtherParticipant(
                                    activeChat?.participants,
                                    currentUser?._id
                                  )?.photo || "assets/img/user/user-02.jpg"
                                }
                                alt="User"
                                className="avatar avatar-md avatar-rounded flex-shrink-0 me-2"
                              />
                            )}
                            <div>
                              <h6 className="fs-16 mb-0 fw-bold">
                                {activeChat
                                  ? activeChat.groupName ||
                                    getOtherParticipant(
                                      activeChat.participants,
                                      currentUser?._id
                                    )?.name ||
                                    getOtherParticipant(
                                      activeChat.participants,
                                      currentUser?._id
                                    )?.userName ||
                                    ""
                                  : "Select chat"}
                              </h6>
                            </div>
                          </div>
                          {((activeChat &&
                            activeChat.isGroup &&
                            !activeChat.isAnnouncement) ||
                            (activeChat &&
                              currentUser.role === "admin" &&
                              activeChat.isGroup)) && (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => setShowEditMembersModal(true)}
                              style={{ marginLeft: 12 }}
                            >
                              Edit Members
                            </Button>
                          )}
                          {activeChat && !activeChat.isGroup && (
                            <div className="d-flex align-items-center send-action">
                              <Link
                                className="btn no-bg send-action-btn rounded-circle"
                                to="#"
                                data-bs-toggle="dropdown"
                              >
                                <i className="fa-solid fa-ellipsis-vertical" />
                              </Link>
                              <ul className="dropdown-menu dropdown-menu-end p-3">
                                <li>
                                  <Link
                                    to="#"
                                    className="dropdown-item"
                                    onClick={handleCloseChat}
                                  >
                                    <i className="isax isax-close-circle me-2" />
                                    Close Chat
                                  </Link>
                                </li>
                                <li>
                                  {/* Block/Unblock logic */}
                                  {isBlockedByMe ? (
                                    <Link
                                      to="#"
                                      className="dropdown-item"
                                      onClick={handleUnblockChat}
                                    >
                                      <i className="fa-solid fa-ban me-2" />
                                      Unblock
                                    </Link>
                                  ) : (
                                    <Link
                                      to="#"
                                      className="dropdown-item"
                                      onClick={handleBlockChat}
                                    >
                                      <i className="fa-solid fa-ban me-2" />
                                      Block
                                    </Link>
                                  )}
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Messages */}
                        <div
                          className="msg_card_body chat-scroll"
                          ref={chatBodyRef}
                          style={{
                            minHeight: "400px",
                            maxHeight: "48vh",
                            overflowY: "auto",
                          }}
                        >
                          <ul className="list-unstyled p-0">
                            {activeChat && activeChat._id && hasMore && (
                              <li className="d-flex justify-content-center py-2">
                                <button
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={handleLoadMore}
                                >
                                  <i className="fas fa-chevron-up me-1"></i>{" "}
                                  Load Older Messages
                                </button>
                              </li>
                            )}
                            <ChatMessageList
                              messages={messages}
                              currentUser={currentUser}
                              onReactMessage={({
                                messageId,
                                emoji,
                              }: {
                                messageId: string;
                                emoji: string;
                              }) => {
                                chatSocket.emit("reactMessage", {
                                  chatId: activeChat?._id, // Make sure this is correct!
                                  messageId,
                                  userId: currentUser._id,
                                  userModel:
                                    currentUser.role === "student"
                                      ? "Student"
                                      : currentUser.role === "instructor"
                                      ? "Instructor"
                                      : "User",
                                  emoji,
                                });
                              }}
                            />
                          </ul>
                        </div>

                        {/* Message Input */}
                        <div className="chat-footer border-0 pt-0">
                          {isBlockedByMe && (
                            <div className="alert alert-info mb-2">
                              You blocked this user. Messaging is disabled until
                              you unblock.
                            </div>
                          )}
                          {isBlockedByOther && !isBlockedByMe && (
                            <div className="alert alert-warning mb-2">
                              You are blocked by this user. Messaging is
                              disabled until they unblock you.
                            </div>
                          )}

                          {chatInputRestricted && (
                            <div className="alert alert-warning">
                              Only group admins can post announcements in this
                              group.
                            </div>
                          )}
                          {!chatInputRestricted && (
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center chat-input-icons">
                                <Link
                                  to="#"
                                  className="action-circle"
                                  onClick={triggerFileInput}
                                  style={{
                                    pointerEvents: uploading ? "none" : "auto",
                                  }}
                                >
                                  <i className="isax isax-attach-circle me-1 fs-30" />
                                </Link>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  style={{ display: "none" }}
                                  onChange={(e) => handleFileChange(e)}
                                  accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                                />
                                {uploading && <span>Uploading…</span>}
                              </div>
                              <>
                                <div className="chat-input me-2">
                                  <input
                                    className="form-control"
                                    placeholder="Type your message here..."
                                    value={messageText}
                                    onChange={(e) =>
                                      setMessageText(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && handleSend()
                                    }
                                    disabled={!activeChat || chatIsBlocked}
                                  />
                                </div>
                                <div>
                                  <button
                                    className="btn btn-secondary btn_send"
                                    onClick={handleSend}
                                    disabled={
                                      !activeChat ||
                                      !messageText ||
                                      chatIsBlocked
                                    }
                                  >
                                    <i
                                      className="isax isax-send-1 text-white"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>
                              </>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Chat Content */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorMessage;
