// components/EditGroupMembersModal.tsx

import React from "react";
import { Modal } from "react-bootstrap";
import { Switch } from "antd";
import { useDispatch } from "react-redux";
import {
  addMemberToGroup,
  removeMemberFromGroup,
} from "../core/redux/chatSlice";
import type { AppDispatch } from "../core/redux/store";

interface User {
  _id: string;
  name?: string;
  userName?: string;
  role?: string;
}

interface Participant {
  _id: string;
  name?: string;
  userName?: string;
  role?: string;
}

interface Chat {
  _id: string;
  isGroup?: boolean;
  groupName?: string;
  participants: Participant[];
  admin?: Participant[] | string[];
}

interface Props {
  show: boolean;
  onHide: () => void;
  activeChat: Chat | null;
  currentUser: User;
  users: User[];
}

const EditGroupMembersModal: React.FC<Props> = ({
  show,
  onHide,
  activeChat,
  currentUser,
  users,
}) => {
  if (!activeChat || !activeChat.isGroup) return null;
  const dispatch = useDispatch<AppDispatch>();

  const isAdmin =
    (Array.isArray(activeChat.admin) &&
      activeChat.admin.some(
        (admin: any) =>
          (typeof admin === "string" ? admin : admin?._id) === currentUser._id
      )) ||
    ["admin", "instructor"].includes(currentUser.role ?? "");

  if (!activeChat.isGroup) return null;

  const groupUserIds = activeChat.participants.map((p) =>
    typeof p === "string" ? p : p._id
  );

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Edit {`${activeChat.groupName}`} members
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {users.map((u) => {
            const inGroup = groupUserIds.includes(u._id);
            return (
              <li
                key={u._id}
                style={{
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: 8 }}>
                  {u.name ?? u.userName}{" "}
                  <span style={{ color: "#999", fontSize: 12 }}>
                    ({u.role})
                  </span>
                </span>
                {isAdmin && u._id !== currentUser._id && (
                  <Switch
                  size="small"
                    checked={inGroup}
                    onChange={(checked) => {
                      if (checked) {
                        dispatch(
                          addMemberToGroup({
                            chatId: activeChat._id,
                            userIdToAdd: u._id,
                            requestorId: currentUser._id,
                          })
                        );
                      } else {
                        dispatch(
                          removeMemberFromGroup({
                            chatId: activeChat._id,
                            userIdToRemove: u._id,
                            requestorId: currentUser._id,
                          })
                        );
                      }
                    }}
                  />
                )}
                {!isAdmin && (
                  <span
                    style={{
                      marginLeft: 10,
                      color: inGroup ? "green" : "#ccc",
                      fontWeight: 500,
                    }}
                  >
                    {inGroup ? "Active" : ""}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Modal.Body>
    </Modal>
  );
};

export default EditGroupMembersModal;
