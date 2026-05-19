import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import CustomSelect from "../../../core/common/commonSelect";
import Table from "../../../core/common/dataTable/index";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import {
  Category,
  Priority,
} from "../../../core/common/selectOption/json/selectOption";
import type { AppDispatch } from "../../../core/redux/store";
import {
  addReply,
  createTicket,
  deleteTicket,
  fetchByUserTickets,
  updateTicket,
} from "../../../core/redux/ticketSlice";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import TicketModal from "../../../core/common/ticketModal/TicketModal";
// import TicketModal from ".";

type OptionType = { label: string; value: string | number };

const StatusOptions: OptionType[] = [
  { label: "Opened", value: "Opened" },
  { label: "Closed", value: "Closed" },
  { label: "Inprogress", value: "Inprogress" },
];

const InstructorTickets = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tickets, loading } = useSelector((state: any) => state.ticket);
  const currentUser = useSelector((state: any) => state.auth.user);

  const [filters, setFilters] = useState<{
    TicketID: string;
    Category: OptionType | null;
    Priority: OptionType | null;
    Status: OptionType | null;
  }>({
    TicketID: "",
    Category: null,
    Priority: null,
    Status: null,
  });

  const [replyText, setReplyText] = useState("");
  const [selectedTicketIdx, setSelectedTicketIdx] = useState<any | null>(null);

  // Add Ticket Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAttachmentPreviews, setAddAttachmentPreviews] = useState<string[]>(
    []
  );

  // Edit Ticket Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTicketInitial, setEditTicketInitial] = useState<any | null>(null);
  const [editTicketID, setEditTicketID] = useState<number | null>(null);

  const [editAttachmentPreviews, setEditAttachmentPreviews] = useState<
    string[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const [deleteTicketIdx, setDeleteTicketIdx] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [dispatch, filters, currentUser?._id]);

  const fetchTickets = async () => {
    const params: any = {};
    if (filters.TicketID) params.TicketID = filters.TicketID;
    if (filters.Category) params.Category = filters.Category.value;
    if (filters.Priority) params.Priority = filters.Priority.value;
    if (filters.Status) params.Status = filters.Status.value;
    dispatch(fetchByUserTickets({ id: currentUser?._id, params }));
  };

  // ADD: image preview for attachments
  const handleAddAttachmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFieldValue("Attachments", files);
    setAddAttachmentPreviews(
      files.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
      )
    );
  };

  // EDIT: image preview for attachments
  const handleEditAttachmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFieldValue("Attachments", files);
    setEditAttachmentPreviews(
      files.map((f) =>
        f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
      )
    );
  };

  // Modal open helpers
  const handleShowAddModal = () => {
    setShowAddModal(true);
    setAddAttachmentPreviews([]);
  };

  const handleShowEditModal = (ticket: any) => {
    setShowEditModal(true);
    setEditTicketID(ticket._id);
    setEditTicketInitial({
      Subject: ticket.Subject,
      Category: Category.find((c) => c.label === ticket.Category) ?? null,
      Priority: Priority.find((p) => p.label === ticket.Priority) ?? null,
      Status:
        StatusOptions.find((s) => s.label === ticket.Status) ??
        StatusOptions[0],
      Description: ticket.Description ?? "",
      Attachments: ticket.Attachments ?? null, // You can preload if you store/download original
    });
    setEditAttachmentPreviews([]);
  };

  // Formik ADD Ticket
  const handleAddTicketSubmit = async (values: any, resetForm: () => void) => {
    setIsLoading(true);
    const payload = {
      Subject: values.Subject,
      Category: values.Category?.label ?? "",
      Priority: values.Priority?.label ?? "",
      Status: values.Status?.label ?? "Opened",
      Description: values.Description,
      Attachments: values.Attachments,
      createdBy: currentUser?._id,
      Date: new Date().toLocaleDateString(),
    };

    try {
      const resultAction = await dispatch(createTicket(payload));
      if (createTicket.fulfilled.match(resultAction)) {
        toast.success("Ticket created successfully!");
        setShowAddModal(false);
        resetForm();
        setAddAttachmentPreviews([]);
      } else {
        toast.error("Error creating ticket. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error creating ticket.");
    }
    setIsLoading(false);
  };

  // Formik EDIT Ticket
  const handleEditTicketSubmit = async (values: any, resetForm: () => void) => {
    setIsLoading(true);
    let originalTicket: any = tickets.find((x: any) => x._id === editTicketID);
    const payload = {
      Subject: values.Subject,
      Category: values.Category?.label ?? "",
      Priority: values.Priority?.label ?? "",
      Status: values.Status?.label ?? originalTicket?.Status ?? "Opened",
      Description: values.Description,
      Attachments: values.Attachments,
      Date: originalTicket?.Date ?? new Date().toLocaleDateString(),
      TicketID: originalTicket?.TicketID,
      Replies: originalTicket?.Replies ?? [],
    };

    try {
      const resultAction = await dispatch(
        updateTicket({ id: originalTicket?._id, data: payload })
      );
      if (updateTicket.fulfilled.match(resultAction)) {
        toast.success("Ticket updated successfully!");
        setShowEditModal(false);
        resetForm();
        setEditAttachmentPreviews([]);
      } else {
        toast.error("Error editing ticket. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error editing ticket.");
    }
    setIsLoading(false);
  };

  // Add Reply Handler
  const handleAddReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim().length < 2 || selectedTicketIdx === null) return;
    const newReply = {
      userID: currentUser?._id,
      email:
        currentUser?.role === "student"
          ? currentUser?.student?.email
          : currentUser?.email,
      userName:
        currentUser?.role === "student"
          ? currentUser?.student?.userName ??
            currentUser?.student?.name ??
            currentUser?.student?.email
          : currentUser?.userName ?? currentUser?.name ?? currentUser?.email,
      message: replyText,
      date: new Date().toLocaleString(),
    };

    try {
      const resultAction = await dispatch(
        addReply({ ticketId: selectedTicketIdx._id, reply: newReply })
      );
      if (addReply.fulfilled.match(resultAction)) {
        toast.success("Reply added successfully!");
        const updatedTicket = resultAction.payload;
        setSelectedTicketIdx({ ...updatedTicket });
        fetchTickets();
      } else {
        toast.error("Error adding reply. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error adding reply.");
    }
    setReplyText("");
  };

  // Delete Ticket Handler
  const handleDeleteTicket = async () => {
    if (deleteTicketIdx === null) return;
    try {
      const resultAction = await dispatch(deleteTicket(deleteTicketIdx));
      if (deleteTicket.fulfilled.match(resultAction)) {
        toast.success("Ticket deleted successfully!");
        setDeleteTicketIdx(null);
      } else {
        toast.error("Error deleting ticket. Please try again.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error deleting ticket.");
    }
  };

  const handleOpenTicketDetails = (idx: any) => {
    setSelectedTicketIdx(idx);
    setReplyText("");
  };

  const filterControls = (
    <div className="row align-items-center mb-2">
      <div className="col-12">
        <div className="d-flex align-items-center flex-wrap justify-content-between">
          <div className="mb-3 me-3">
            <input
              type="text"
              className="form-control"
              value={filters.TicketID}
              placeholder="Search Ticket ID"
              onChange={(e) =>
                setFilters((f) => ({ ...f, TicketID: e.target.value }))
              }
            />
          </div>
          <div className="d-flex gap-3">
            <div className="mb-3 me-3">
              <CustomSelect
                options={Category}
                className="select"
                value={filters.Category}
                onChange={(opt) => setFilters((f) => ({ ...f, Category: opt }))}
                placeholder="Category"
              />
            </div>
            <div className="mb-3 me-3">
              <CustomSelect
                options={Priority}
                className="select"
                value={filters.Priority}
                onChange={(opt) => setFilters((f) => ({ ...f, Priority: opt }))}
                placeholder="Priority"
              />
            </div>
            <div className="mb-3">
              <CustomSelect
                options={StatusOptions}
                className="select"
                value={filters.Status}
                onChange={(opt) => setFilters((f) => ({ ...f, Status: opt }))}
                placeholder="Status"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const columns = [
    {
      title: "Ticket ID",
      dataIndex: "TicketID",
      render: (text: string) => <>{text}</>,
    },
    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a: any, b: any) => a.Date.length - b.Date.length,
    },
    {
      title: "Subject",
      dataIndex: "Subject",
      sorter: (a: any, b: any) => a.Subject.length - b.Subject.length,
    },
    {
      title: "Priority",
      dataIndex: "Priority",
      render: (text: string) => (
        <span
          className={`badge badge-sm ${
            text === "High"
              ? "bg-soft-danger"
              : text === "Low"
              ? "bg-soft-success"
              : "bg-soft-skyblue"
          } d-inline-flex align-items-center`}
        >
          <i className="fa-solid fa-circle fs-5 me-1" />
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Priority.length - b.Priority.length,
    },
    {
      title: "Category",
      dataIndex: "Category",
      sorter: (a: any, b: any) => a.Category.length - b.Category.length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: string) => (
        <span
          className={`badge badge-sm ${
            text === "Opened"
              ? "bg-purple"
              : text === "Closed"
              ? "bg-success"
              : "bg-warning"
          } bg-success d-inline-flex align-items-center`}
        >
          <i className="fa-solid fa-circle fs-5 me-1" />
          {text}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },
    {
      title: "Action",
      dataIndex: "Action",
      render: (_: any, idx: any) => {
        return (
          <div className="d-flex align-items-center">
            <Link
              to="#"
              className="d-inline-flex fs-14 me-1 action-icon"
              data-bs-toggle="modal"
              data-bs-target="#ticket_details"
              onClick={() => handleOpenTicketDetails(idx)}
            >
              <i className="isax isax-eye" />
            </Link>
            <Link
              to="#"
              className="d-inline-flex fs-14 me-2 action-icon"
              data-bs-toggle="modal"
              data-bs-target="#edit_ticket"
              onClick={() => handleShowEditModal(idx)}
            >
              <i className="isax isax-edit-2" />
            </Link>
            <Link
              to="#"
              className="d-inline-flex fs-14 action-icon"
              data-bs-toggle="modal"
              data-bs-target="#delete_modal"
              onClick={() => {
                setDeleteTicketIdx(idx._id);
              }}
            >
              <i className="isax isax-trash" />
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumb title="Tickets" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="tickets">
                <div className="d-flex align-items-center justify-content-between flex-wrap page-title">
                  <h5>Support Tickets</h5>
                  <Link
                    to="#"
                    className="btn btn-secondary rounded-pill"
                    data-bs-toggle="modal"
                    data-bs-target="#add_ticket"
                    onClick={handleShowAddModal}
                  >
                    <i className="isax isax-add-circle me-2 fs-10" />
                    Add Ticket
                  </Link>
                </div>
                {filterControls}
                {loading ? (
                  <div className="text-center py-5">
                    <span className="spinner-border"></span>
                  </div>
                ) : (
                  <Table
                    dataSource={tickets}
                    columns={columns}
                    Search={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add Ticket Modal (Formik) */}
      <TicketModal
        show={showAddModal}
        mode="add"
        loading={isLoading}
        attachmentPreviews={addAttachmentPreviews}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTicketSubmit}
        onAttachmentChange={handleAddAttachmentChange}
      />
      {/* Edit Ticket Modal (Formik) */}
      <TicketModal
        show={showEditModal}
        mode="edit"
        initialValues={editTicketInitial}
        loading={isLoading}
        attachmentPreviews={editAttachmentPreviews}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditTicketSubmit}
        onAttachmentChange={handleEditAttachmentChange}
      />
      {/* Ticket Details Modal & Reply Form */}
      <div className="modal fade" id="ticket_details">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="d-inline-flex align-items-center">
                Ticket Details{" "}
                <span className="text-primary fs-14 ms-2">
                  #
                  {selectedTicketIdx !== null ? selectedTicketIdx.TicketID : ""}
                </span>
              </h5>
              <div className="d-flex align-items-center justify-content-end">
                <span
                  className={`badge badge-sm ${
                    selectedTicketIdx !== null &&
                    selectedTicketIdx.Status === "Opened"
                      ? "bg-purple"
                      : selectedTicketIdx !== null &&
                        selectedTicketIdx.Status === "Closed"
                      ? "bg-success"
                      : "bg-warning"
                  } d-inline-flex align-items-center me-2`}
                >
                  <i className="fa-solid fa-circle fs-5 me-1" />
                  {selectedTicketIdx !== null ? selectedTicketIdx.Status : ""}
                </span>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="isax isax-close-circle5" />
                </button>
              </div>
            </div>
            <div
              className="modal-body overflow-auto"
              style={{ maxHeight: "500px" }}
            >
              <div className="row">
                <div className="col-lg-4 mb-3">
                  <h6 className="mb-1">Category</h6>
                  <p>
                    {selectedTicketIdx !== null
                      ? selectedTicketIdx.Category
                      : ""}
                  </p>
                </div>
                <div className="col-lg-4 mb-3">
                  <h6 className="mb-1">Date</h6>
                  <p>
                    {selectedTicketIdx !== null ? selectedTicketIdx.Date : ""}
                  </p>
                </div>
                <div className="col-lg-4 mb-3">
                  <h6 className="mb-1">Priority</h6>
                  <span
                    className={`badge ${
                      selectedTicketIdx !== null &&
                      selectedTicketIdx.Priority === "High"
                        ? "bg-soft-danger"
                        : selectedTicketIdx !== null &&
                          selectedTicketIdx.Priority === "Low"
                        ? "bg-soft-success"
                        : "bg-soft-skyblue"
                    } badge-sm d-inline-flex align-items-center`}
                  >
                    <i className="fa-solid fa-circle fs-5 me-1" />
                    {selectedTicketIdx !== null
                      ? selectedTicketIdx.Priority
                      : ""}
                  </span>
                </div>
                <div className="col-lg-12 mb-3">
                  <h6 className="mb-1">Subject</h6>
                  <p>
                    {selectedTicketIdx !== null
                      ? selectedTicketIdx.Subject
                      : ""}
                  </p>
                </div>
                <div className="col-lg-12 mb-3">
                  <h6 className="mb-1">Description</h6>
                  <p>
                    {selectedTicketIdx !== null
                      ? selectedTicketIdx.Description
                      : ""}
                  </p>
                </div>
                {selectedTicketIdx?.Attachments && (
                  <div className="col-lg-12 mb-3">
                    <h6 className="mb-2">Attachments</h6>
                    <ImageGlobal
                      src={selectedTicketIdx.Attachments}
                      alt="Attachments "
                      height={250}
                      className="border"
                    />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <h6 className="mb-3">Replies</h6>
                <div>
                  {selectedTicketIdx !== null &&
                  selectedTicketIdx?.Replies?.length
                    ? selectedTicketIdx.Replies!.map(
                        (reply: any, idx: number) => (
                          <div key={idx} className="mb-3 py-2 px-3  border rounded-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="fs-16 fw-medium mb-0 d-flex align-items-center">
                                  <strong>{reply.userName ?? ""}</strong>
                                </h6>
                                <p className="fs-10 text-muted">{reply.email}</p>
                              </div>
                              <span className="fs-10 text-muted">
                                {moment(
                                  reply.date,
                                  "DD/MM/YYYY, HH:mm:ss"
                                ).format("D MMMM YYYY [at] HH:mm")}
                              </span>
                            </div>
                            <div className="mt-2">{reply.message}</div>
                          </div>
                        )
                      )
                    : null}
                  <form onSubmit={handleAddReply}>
                    <textarea
                      className="form-control mb-2"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply"
                      rows={2}
                      required
                    />
                    <button
                      className="btn btn-secondary btn-sm rounded-pill"
                      type="submit"
                    >
                      Add Reply
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Delete Modal */}
      <div className="modal fade" id="delete_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center custom-modal-body">
              <span className="avatar avatar-lg bg-danger-transparent rounded-circle mb-2">
                <i className="isax isax-trash fs-24 text-danger" />
              </span>
              <div>
                <h4 className="mb-2">Delete Ticket</h4>
                <p className="mb-3">Are you sure you want to delete ticket?</p>
                <div className="d-flex align-items-center justify-content-center">
                  <Link
                    to="#"
                    className="btn bg-gray-100 rounded-pill me-2"
                    data-bs-dismiss="modal"
                    onClick={() => setDeleteTicketIdx(null)}
                  >
                    Cancel
                  </Link>
                  <Link
                    to="#"
                    className="btn btn-secondary rounded-pill"
                    data-bs-dismiss="modal"
                    onClick={handleDeleteTicket}
                  >
                    Yes, Remove
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorTickets;
