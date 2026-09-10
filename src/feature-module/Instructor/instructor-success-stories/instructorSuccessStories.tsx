import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import Table from "../../../core/common/dataTable/index";
import {
  createSuccessStory,
  deleteSuccessStory,
  fetchSuccessStories,
  updateSuccessStory,
} from "../../../core/redux/successStorySlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

const emptyForm = {
  studentName: "",
  title: "",
  story: "",
  videoUrl: "",
  featured: false,
  status: "draft" as "draft" | "published",
};

const InstructorSuccessStories = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stories, loading } = useSelector(
    (state: RootState) => (state as any).successStory
  );
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchSuccessStories({ includeDrafts: "true" }) as any);
  }, [dispatch]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setThumbnail(null);
    setShowModal(true);
  };

  const openEdit = (story: any) => {
    setEditId(story._id);
    setForm({
      studentName: story.studentName || "",
      title: story.title || "",
      story: story.story || "",
      videoUrl: story.videoUrl || "",
      featured: !!story.featured,
      status: story.status || "draft",
    });
    setThumbnail(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) =>
      formData.append(key, String(value))
    );
    if (thumbnail) formData.append("thumbnail", thumbnail);

    const action = editId
      ? updateSuccessStory({ id: editId, data: formData })
      : createSuccessStory(formData);

    const result: any = await dispatch(action as any);
    if (result.type?.endsWith("/rejected")) {
      toast.error(result.payload?.message || "Save failed.");
    } else {
      toast.success(editId ? "Story updated." : "Story added.");
      setShowModal(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this success story?")) return;
    await dispatch(deleteSuccessStory(id) as any);
    toast.success("Story deleted.");
  };

  const columns = [
    {
      title: "Thumbnail",
      render: (_: any, record: any) => (
        <ImageGlobal src={record.thumbnailUrl} alt={record.studentName} height={50} />
      ),
    },
    { title: "Student", dataIndex: "studentName" },
    { title: "Title", dataIndex: "title" },
    { title: "Platform", dataIndex: "platform" },
    {
      title: "Featured",
      render: (_: any, record: any) =>
        record.featured ? (
          <span className="badge bg-success">Featured</span>
        ) : (
          "—"
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text: string) => (
        <span className={`badge ${text === "published" ? "bg-success" : "bg-warning"}`}>
          {text}
        </span>
      ),
    },
    {
      title: "Action",
      render: (_: any, record: any) => (
        <div className="d-flex align-items-center gap-2">
          <i
            className="isax isax-edit-2"
            style={{ cursor: "pointer" }}
            onClick={() => openEdit(record)}
          />
          <i
            className="isax isax-trash"
            style={{ cursor: "pointer" }}
            onClick={() => handleDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb title="Success Stories" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold">Success Stories</h5>
                <button className="btn btn-secondary" onClick={openAdd}>
                  <i className="isax isax-add-circle me-1" />
                  Add Story
                </button>
              </div>
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              ) : (
                <Table dataSource={stories} columns={columns} Search={false} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`modal fade${showModal ? " show d-block" : ""}`}
        style={showModal ? { background: "rgba(0,0,0,0.2)" } : {}}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5>{editId ? "Edit Success Story" : "Add Success Story"}</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                onClick={() => setShowModal(false)}
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Student Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.studentName}
                      onChange={(e) =>
                        setForm({ ...form, studentName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Story *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form.story}
                      onChange={(e) => setForm({ ...form, story: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">
                      Video URL{" "}
                      <small className="text-muted">
                        (TikTok/YouTube/Instagram/Facebook link — platform badge
                        is detected automatically)
                      </small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.videoUrl}
                      onChange={(e) =>
                        setForm({ ...form, videoUrl: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Thumbnail</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label d-block">Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value as any })
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={form.featured}
                        onChange={(e) =>
                          setForm({ ...form, featured: e.target.checked })
                        }
                        id="featuredCheck"
                      />
                      <label className="form-check-label" htmlFor="featuredCheck">
                        Featured
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-secondary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorSuccessStories;
