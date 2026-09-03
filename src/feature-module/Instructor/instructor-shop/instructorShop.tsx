import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import Table from "../../../core/common/dataTable/index";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../../../core/redux/productSlice";
import { fetchOrders, updateOrderStatus } from "../../../core/redux/orderSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";
import InstructorSidebar from "../common/instructorSidebar";
import ProfileCard from "../common/profileCard";

const emptyProduct = {
  title: "",
  description: "",
  category: "",
  price: "",
  deliveryNote: "",
  status: "draft" as "draft" | "published",
};

// Shop admin (#42/#43) — product catalog CRUD + order review queue
// (approve/reject payment proof, hand over delivered content).
const InstructorShop = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading: productsLoading } = useSelector(
    (state: RootState) => (state as any).product
  );
  const { orders, loading: ordersLoading } = useSelector(
    (state: RootState) => (state as any).order
  );

  const [showProductModal, setShowProductModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [image, setImage] = useState<File | null>(null);

  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [deliveredContent, setDeliveredContent] = useState("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    dispatch(fetchProducts({ includeDrafts: "true" }) as any);
    dispatch(fetchOrders({}) as any);
  }, [dispatch]);

  const openAddProduct = () => {
    setEditId(null);
    setForm(emptyProduct);
    setImage(null);
    setShowProductModal(true);
  };

  const openEditProduct = (p: any) => {
    setEditId(p._id);
    setForm({
      title: p.title,
      description: p.description,
      category: p.category,
      price: String(p.price),
      deliveryNote: p.deliveryNote || "",
      status: p.status || "draft",
    });
    setImage(null);
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
    if (image) formData.append("image", image);
    const action = editId
      ? updateProduct({ id: editId, data: formData })
      : createProduct(formData);
    const result: any = await dispatch(action as any);
    if (result.type?.endsWith("/rejected")) {
      toast.error(result.payload?.message || "Save failed.");
    } else {
      toast.success(editId ? "Product updated." : "Product added.");
      setShowProductModal(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    await dispatch(deleteProduct(id) as any);
    toast.success("Product deleted.");
  };

  const openReview = (order: any) => {
    setReviewOrder(order);
    setDeliveredContent(order.deliveredContent || "");
    setAdminNote(order.adminNote || "");
  };

  const handleReviewSave = async (status: string) => {
    if (!reviewOrder) return;
    const result: any = await dispatch(
      updateOrderStatus({
        id: reviewOrder._id,
        status,
        deliveredContent,
        adminNote,
      }) as any
    );
    if (result.type?.endsWith("/rejected")) {
      toast.error(result.payload?.message || "Update failed.");
    } else {
      toast.success(`Order marked ${status}.`);
      setReviewOrder(null);
    }
  };

  const productColumns = [
    {
      title: "Image",
      render: (_: any, r: any) => (
        <ImageGlobal src={r.imageUrl} alt={r.title} height={50} />
      ),
    },
    { title: "Title", dataIndex: "title" },
    { title: "Category", dataIndex: "category" },
    {
      title: "Price",
      dataIndex: "price",
      // #18 — free text now, so Number() would print "Rs NaN" for a label like
      // "Contact Us". formatPrice adds Rs and separators only for real amounts.
      render: (v: string) => (hasPrice(v) ? formatPrice(v) : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v: string) => (
        <span className={`badge ${v === "published" ? "bg-success" : "bg-warning"}`}>
          {v}
        </span>
      ),
    },
    {
      title: "Action",
      render: (_: any, r: any) => (
        <div className="d-flex align-items-center gap-2">
          <i
            className="isax isax-edit-2"
            style={{ cursor: "pointer" }}
            onClick={() => openEditProduct(r)}
          />
          <i
            className="isax isax-trash"
            style={{ cursor: "pointer" }}
            onClick={() => handleDeleteProduct(r._id)}
          />
        </div>
      ),
    },
  ];

  const orderColumns = [
    { title: "Product", dataIndex: "productTitle" },
    { title: "Student", dataIndex: "studentName" },
    {
      // #43 — the figure to check the payment screenshot against. Orders placed
      // before this was recorded show a dash rather than a made-up number.
      title: "Amount",
      dataIndex: "pricePaid",
      render: (v: string) =>
        hasPrice(v) ? (
          formatPrice(v)
        ) : (
          <span className="text-muted" title="Not recorded for this order">
            —
          </span>
        ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (v: string) => moment(v).format("DD MMM YYYY"),
    },
    { title: "Transaction ID", dataIndex: "transactionId" },
    {
      title: "Proof",
      render: (_: any, r: any) =>
        r.paymentScreenshotUrl ? (
          <a href={r.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
            View
          </a>
        ) : (
          "—"
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v: string) => <span className="badge bg-secondary">{v}</span>,
    },
    {
      title: "Action",
      render: (_: any, r: any) => (
        <Link to="#" onClick={() => openReview(r)}>
          Review
        </Link>
      ),
    },
  ];

  return (
    <>
      <Breadcrumb title="Shop" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <ul
                className="nav-tabs mb-4 nav-justified border-0 nav-style-1 d-sm-flex d-block"
                role="tablist"
              >
                <li className="nav-item active">
                  <Link
                    className="btn nav-link active"
                    data-bs-toggle="tab"
                    role="tab"
                    to="#shop-products"
                  >
                    Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="btn nav-link"
                    data-bs-toggle="tab"
                    role="tab"
                    to="#shop-orders"
                  >
                    Orders
                  </Link>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane active show" id="shop-products" role="tabpanel">
                  <div className="d-flex justify-content-end mb-3">
                    <button className="btn btn-secondary" onClick={openAddProduct}>
                      <i className="isax isax-add-circle me-1" />
                      Add Product
                    </button>
                  </div>
                  {productsLoading ? (
                    <div className="text-center py-5">
                      <span className="spinner-border" />
                    </div>
                  ) : (
                    <Table dataSource={products} columns={productColumns} Search={false} />
                  )}
                </div>
                <div className="tab-pane" id="shop-orders" role="tabpanel">
                  {ordersLoading ? (
                    <div className="text-center py-5">
                      <span className="spinner-border" />
                    </div>
                  ) : (
                    <Table dataSource={orders} columns={orderColumns} Search={false} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Product modal */}
      <div
        className={`modal fade${showProductModal ? " show d-block" : ""}`}
        style={showProductModal ? { background: "rgba(0,0,0,0.2)" } : {}}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5>{editId ? "Edit Product" : "Add Product"}</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                onClick={() => setShowProductModal(false)}
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Price (Rs) *</label>
                    <input
                      type="number"
                      className="form-control"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Category *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. AI Tools, VPN, Hosting"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
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
                  <div className="col-md-12">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">
                      Delivery Note{" "}
                      <small className="text-muted">
                        (internal — what to hand over once approved)
                      </small>
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={form.deliveryNote}
                      onChange={(e) => setForm({ ...form, deliveryNote: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={() => setShowProductModal(false)}
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

      {/* Order review modal */}
      <div
        className={`modal fade${reviewOrder ? " show d-block" : ""}`}
        style={reviewOrder ? { background: "rgba(0,0,0,0.2)" } : {}}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Review Order</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                onClick={() => setReviewOrder(null)}
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Product:</strong> {reviewOrder?.productTitle}
              </p>
              <p>
                <strong>Student:</strong> {reviewOrder?.studentName} (
                {reviewOrder?.studentEmail})
              </p>
              <p>
                <strong>Transaction ID:</strong> {reviewOrder?.transactionId || "—"}
              </p>
              {reviewOrder?.paymentScreenshotUrl && (
                <div className="mb-3">
                  <ImageGlobal
                    src={reviewOrder.paymentScreenshotUrl}
                    alt="Payment proof"
                    height={200}
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">
                  Delivered Content{" "}
                  <small className="text-muted">(link/key/credentials)</small>
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={deliveredContent}
                  onChange={(e) => setDeliveredContent(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Admin Note</label>
                <input
                  type="text"
                  className="form-control"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline-danger"
                onClick={() => handleReviewSave("Rejected")}
              >
                Reject
              </button>
              <button
                className="btn btn-info"
                onClick={() => handleReviewSave("Approved")}
              >
                Approve
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleReviewSave("Completed")}
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorShop;
