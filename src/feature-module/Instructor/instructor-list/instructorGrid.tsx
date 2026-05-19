import { useEffect, useState } from "react";
import { ToggleButton } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import Table from "../../../core/common/dataTable/index";
import {
  getAllInstructors,
  updateInstructorProfile,
} from "../../../core/redux/instructor";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

const AllInstructorGrid = () => {
  const dispatch = useDispatch();
  const { instructors, loading, error } = useSelector(
    (state: any) => state.instructor
  );

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editInstructor, setEditInstructor] = useState<any>(null);
  const [editIsDisable, setEditIsDisable] = useState(true);
  const [editModules, setEditModules] = useState<any[]>([]);

  useEffect(() => {
    dispatch(getAllInstructors() as any);
  }, [dispatch]);

  // Open modal to edit instructor
  const handleEdit = (instructor: any) => {
    setEditInstructor(instructor);
    setEditIsDisable(instructor.isDisable);
    setEditModules(
      Array.isArray(instructor.modules)
        ? instructor.modules.map((mod: any) => ({ ...mod }))
        : []
    );
    setShowModal(true);
  };

  // Update modules toggle in modal
  const handleModuleToggle = (idx: number) => {
    setEditModules((prev) =>
      prev.map((mod, i) =>
        i === idx ? { ...mod, isDisable: !mod.isDisable } : mod
      )
    );
  };

  // Save changes
  const handleSave = async () => {
    if (!editInstructor?.id) return;
    const result = await dispatch(
      updateInstructorProfile({
        id: editInstructor.id,
        data: {
          isDisable: editIsDisable,
          modules: editModules,
        },
        isAdminUpdate: true,
      }) as any
    );
    // Only refetch after update is successful
    if (updateInstructorProfile.fulfilled.match(result)) {
      dispatch(getAllInstructors() as any);
    }
    setShowModal(false);
  };

  useEffect(() => {
    toast.error(error);
  }, [error]);

  const columns = [
   
    {
      title: "Name",
      render: (_: any, record: any) => (
        <div>
          <span className="font-semibold">
          {record.firstName && record.lastName ? `${record.firstName} ${record.lastName}` : record?.userName}
          </span>
        </div>
      ),
      sorter: (a: any, b: any) =>
        ((a.firstName ?? "") + (a.lastName ?? "")).localeCompare(
          (b.firstName ?? "") + (b.lastName ?? "")
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text: string) => <span>{text}</span>,
      sorter: (a: any, b: any) => (a.email ?? "").localeCompare(b.email ?? ""),
    },
    {
      title: "Phone Number",
      render: (_: any, record: any) => <span>{record.phoneNumber ?? "--"}</span>,
    },
    {
      title: "Join Date",
      dataIndex: "createdAt",
      render: (text: string) => (
        <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>
      ),
      sorter: (a: any, b: any) =>
        Date.parse(a.createdAt ?? "") - Date.parse(b.createdAt ?? ""),
    },
    {
      title: "Account Status",
      render: (_: any, record: any) => (
        <span
          className={
            record.isDisable ? "text-danger fw-bold" : "text-success fw-bold"
          }
        >
          {record.isDisable ? "Inactive" : "Active"}
        </span>
      ),
    },

    {
      title: "Actions",
      render: (_: any, record: any) => (
        <button className="btn btn-sm" onClick={() => handleEdit(record)}>
          <i className="isax isax-edit-2" />
        </button>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb title="Instructors List" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between">
                <h5 className="fw-bold">Instructors List</h5>
              </div>
              <div className="row justify-content-end">
                <div className="col-md-4">
                  <div className="input-icon mb-3 invisible">
                    <span className="input-icon-addon">
                      <i className="isax isax-search-normal-14" />
                    </span>
                    <input
                      type="email"
                      className="form-control form-control-md"
                      placeholder="Search"
                    />
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="my-5 text-center">Loading...</div>
              ) : (
                <Table
                  dataSource={instructors}
                  columns={columns}
                  Search={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (simple, you can use any modal library or custom style) */}
      {showModal && editInstructor && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{
            background: "rgba(0,0,0,0.2)",
            position: "fixed",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">
                  Edit Instructor: {editInstructor.userName}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-2 me-2">
                    Account Status
                  </label>
                  <ToggleButton
                    type="checkbox"
                    id={`modal-status-toggle`}
                    size="sm"
                    checked={!editIsDisable}
                    value="1"
                    variant={!editIsDisable ? "success" : "danger"}
                    onChange={() => setEditIsDisable((prev) => !prev)}
                  >
                    {!editIsDisable ? "Active" : "Inactive"}
                  </ToggleButton>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold mb-2">
                    Modules Access
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {editModules.map((mod, idx) => (
                      <div key={mod._id} className="me-3 mb-2">
                        <ToggleButton
                          type="checkbox"
                          id={`mod-toggle-${mod._id}`}
                          checked={!mod.isDisable}
                          value="1"
                          variant={
                            !mod.isDisable ? "success" : "outline-secondary"
                          }
                          onChange={() => handleModuleToggle(idx)}
                          size="sm"
                        >
                          {mod.name}{" "}
                          {mod.isDisable ? "(Disabled)" : "(Enabled)"}
                        </ToggleButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setShowModal(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="btn btn-secondary ms-2"
                  onClick={handleSave}
                  type="button"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllInstructorGrid;
