import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { WHATSAPP_ENROLL } from "../../../core/common/bluverseLinks";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import { fetchProducts } from "../../../core/redux/productSlice";
import { createOrder } from "../../../core/redux/orderSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// Shop (#42/#43) — replaces the old static "What We Offer" services page.
// Buy Now hands off to WhatsApp (no payment gateway, per the doc); Submit
// Payment Proof is the manual verification pipeline layered on top of that.
const Services = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => (state as any).auth.user);
  const { products, loading } = useSelector(
    (state: RootState) => (state as any).product
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [proofFor, setProofFor] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ search, category }) as any);
  }, [dispatch, search, category]);

  const categories = Array.from(
    new Set(products.map((p: any) => p.category))
  ) as string[];

  const isStudent = currentUser?.role === "student";

  const handleSubmitProof = async () => {
    if (!proofFor) return;
    if (!isStudent) {
      toast.error("Only logged-in students can submit payment proof.");
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append("productId", proofFor._id);
    formData.append("studentId", currentUser._id);
    formData.append(
      "studentName",
      currentUser?.student?.firstName && currentUser?.student?.lastName
        ? `${currentUser.student.firstName} ${currentUser.student.lastName}`
        : currentUser?.student?.userName || ""
    );
    formData.append("studentEmail", currentUser?.student?.email || "");
    formData.append("transactionId", transactionId);
    if (screenshot) formData.append("paymentScreenshot", screenshot);

    const result: any = await dispatch(createOrder(formData) as any);
    setSubmitting(false);
    if (result.type?.endsWith("/rejected")) {
      toast.error(result.payload?.message || "Could not submit. Please try again.");
    } else {
      toast.success("Payment proof submitted — we'll review it shortly.");
      setProofFor(null);
      setTransactionId("");
      setScreenshot(null);
    }
  };

  return (
    <>
      <Breadcrumb title="Shop" />
      <section className="course-content">
        <div className="container">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: 640 }}>
            <h2 className="mb-2">Bluverse Shop</h2>
            <p className="text-muted mb-0">
              Monetized accounts, AI tool subscriptions, hosting, and more —
              buy via WhatsApp, no payment gateway needed.
            </p>
          </div>

          <div className="row mb-4 g-2 justify-content-between">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option value={c} key={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border" />
            </div>
          ) : !products.length ? (
            <div className="text-center text-muted py-5">
              No products available yet.
            </div>
          ) : (
            <div className="row row-gap-4">
              {products.map((p: any) => (
                <div className="col-lg-4 col-md-6" key={p._id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-img-top overflow-hidden rounded-top">
                      <ImageGlobal src={p.imageUrl} alt={p.title} height={180} />
                    </div>
                    <div className="card-body d-flex flex-column">
                      <span className="badge bg-primary-transparent text-primary rounded-pill mb-2 align-self-start">
                        {p.category}
                      </span>
                      <h5 className="mb-2">{p.title}</h5>
                      <p className="text-muted mb-3" style={{ fontSize: 14 }}>
                        {p.description}
                      </p>
                      <div className="mt-auto">
                        {/* #18 — product prices are free text now, so
                            Number() would render "Rs NaN" for a label like
                            "Contact Us". formatPrice adds the Rs and
                            separators for real amounts and passes labels
                            through untouched. */}
                        {hasPrice(p.price) && (
                          <p className="fs-18 fw-bold text-secondary mb-2">
                            {formatPrice(p.price)}
                          </p>
                        )}
                        <div className="d-flex gap-2">
                          <a
                            href={WHATSAPP_ENROLL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary w-100"
                          >
                            Buy Now
                          </a>
                          <button
                            type="button"
                            className="btn btn-outline-secondary w-100"
                            onClick={() => setProofFor(p)}
                          >
                            I've Paid
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit Payment Proof modal (#43) */}
      <div
        className={`modal fade${proofFor ? " show d-block" : ""}`}
        style={proofFor ? { background: "rgba(0,0,0,0.2)" } : {}}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Submit Payment Proof</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                onClick={() => setProofFor(null)}
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-muted">
                For: <strong>{proofFor?.title}</strong>
              </p>
              <div className="mb-3">
                <label className="form-label">Transaction ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN123456"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Payment Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setProofFor(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={submitting || (!transactionId && !screenshot)}
                onClick={handleSubmitProof}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
