import React, { useState } from "react";
import { Modal, Button, FormControl } from "react-bootstrap";
import { Switch } from "antd";
import { useDispatch } from "react-redux";
import { createGroup } from "../core/redux/chatSlice";
import type { AppDispatch } from "../core/redux/store";

interface User {
  _id: string;
  name?: string;
  userName?: string;
  role?: string;
}

interface Props {
  show: boolean;
  onHide: () => void;
  users: User[];
  currentUser: User;
}

const NewGroupModal: React.FC<Props> = ({
  show,
  onHide,
  users,
  currentUser,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  const handleToggle = (id: string, checked: boolean) => {
    setSelectedUserIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleSubmit = async () => {
    if (!groupName || selectedUserIds.length < 1 || !currentUser._id) return;
    await dispatch(
      createGroup({
        adminId: currentUser._id,
        groupName,
        participantIds: [currentUser._id, ...selectedUserIds],
        isAnnouncement, // <-- pass the flag
      })
    );
    setGroupName("");
    setSelectedUserIds([]);
    setIsAnnouncement(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Group</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormControl
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.currentTarget.value)}
          className="mb-2"
        />

        <div className="mb-2">
          <p className="mb-1">
            <b>Announcement:</b>
          </p>
          <span style={{ marginRight: 8 }}>Announcement Group</span>
          <Switch
            size="small"
            checked={isAnnouncement}
            onChange={setIsAnnouncement}
          />
        </div>

        <div style={{ maxHeight: 240, overflowY: "auto" }}>
          <label>
            <b>Select Members:</b>
          </label>
          <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 8 }}>
            {users
              .filter((u) => u._id !== currentUser._id)
              .map((user) => (
                <li
                  key={user._id}
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span style={{ marginRight: 8 }}>
                    {user.name ?? user.userName}{" "}
                    <span style={{ fontSize: 12, color: "#999" }}>
                      ({user.role})
                    </span>
                  </span>
                  <Switch
                    size="small"
                    checked={selectedUserIds.includes(user._id)}
                    onChange={(checked) => handleToggle(user._id, checked)}
                  />
                </li>
              ))}
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!groupName || selectedUserIds.length < 1}
        >
          Create Group
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NewGroupModal;
