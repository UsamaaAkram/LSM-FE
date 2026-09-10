import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { WHATSAPP_ENROLL } from "../../../core/common/bluverseLinks";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import { createOrder } from "../../../core/redux/orderSlice";
import { fetchProducts } from "../../../core/redux/productSlice";
import { all_routes } from "../../router/all_routes";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// Order Verification (brief §1).
//
// Buy Now used to open a modal on the shop grid; the client's note was that
// "I've paid" had nowhere to go. This is the dedicated page it now lands on:
// contact the seller, pay, then submit the proof here.
//
// There is no card gateway on this page. That is deliberate and flagged: the
// brief's own flow is screenshot + manual verification, and a real gateway
// needs a merchant account and a commercial decision first. When one exists it
// slots in beside "Contact the seller" without changing anything below.

const PAYMENT_METHODS = [
  "Bank Transfer",
  "JazzCash",
  "EasyPaisa",
  "Raast",
  "Cash",
  "Other",
];

const MAX_SCREENSHOT_MB = 10;

const OrderVerification = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const productId = params.get("product") || "";

  const currentUser = useSelector((s: RootState) => (s as any).auth.user);
  const { products, loading } = useSelector((s: RootState) => (s as any).product);
  const { saving } = useSelector((s: RootState) => (s as any).order);

  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    // The grid may not have been visited (a shared link lands here directly),
    // so the product list is fetched rather than assumed to be in the store.
    if (!products?.length) dispatch(fetchProducts({}) as any);
  }, [dispatch, products?.length]);

  const product = useMemo(
    () => (products || []).find((p: any) => p._id === productId),
    [products, productId]
  );

  // Revoked on change and on unmount: object URLs are held by the browser
  // until released, and re-picking a file repeatedly would leak each one.
  useEffect(() => {
    if (!screenshot) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const isStudent = currentUser?.role === "student";

  const whatsappHref = useMemo(() => {
    const base = WHATSAPP_ENROLL.split("?")[0];
    if (/wa\.me\/message\//.test(base)) return base;
    const msg = product
      ? `Hi, I want to buy ${product.title}. Please share the payment details.`
      : "Hi, I want to buy a product from the Bluverse Shop.";
    return `${base}?text=${encodeURIComponent(msg)}`;
  }, [product]);

  const pickScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > MAX_SCREENSHOT_MB * 1024 * 1024) {
      // Checked here as well as on the server so the customer is told before
      // sitting through the whole upload.
      toast.error(`That screenshot is larger than ${MAX_SCREENSHOT_MB} MB.`);
      e.target.value = "";
      return;
    }
    setScreenshot(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!isStudent) {
      toast.error("Please sign in as a student to submit your payment proof.");
      return;
    }
    // Either is enough on its own — some banks give a reference but no
    // shareable receipt, and some transfers only produce a screenshot.
    if (!screenshot && !transactionId.trim()) {
      toast.error("Add a payment screenshot or the transaction ID.");
      return;
    }

    const fd = new FormData();
    fd.append("productId", product._id);
    fd.append("studentId", currentUser._id);
    fd.append(
      "studentName",
      currentUser?.student?.firstName && currentUser?.student?.lastName
        ? `${currentUser.student.firstName} ${currentUser.student.lastName}`
        : currentUser?.student?.userName || currentUser?.userName || ""
    );
    fd.append("studentEmail", currentUser?.student?.email || currentUser?.email || "");
    fd.append("paymentMethod", method);
    fd.append("transactionId", transactionId.trim());
    fd.append("customerNote", note.trim());
    if (screenshot) fd.append("paymentScreenshot", screenshot);

    const action: any = await dispatch(createOrder(fd) as any);
    if (createOrder.fulfilled.match(action)) {
      toast.success(
        `Payment proof submitted. Your reference is ${action.payload.orderId}.`
      );
      navigate(all_routes.studentMyProducts);
    } else {
      toast.error(action.payload || "Could not submit. Please try again.");
    }
  };

  if (loading && !products?.length) {
    return (
      <>
        <Breadcrumb title="Order Verification" />
        <div className="content">
          <div className="container text-center py-5">
            <span className="spinner-border" />
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Breadcrumb title="Order Verification" />
        <div className="content">
          <div className="container text-center py-5">
            <p className="mb-3">
              We couldn&apos;t find that product. It may have been removed.
            </p>
            <Link to={all_routes.services} className="btn btn-secondary">
              Back to Shop
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Order Verification" />
      <div className="content">
        <div className="container">
          <div className="row g-4">
            {/* What they're buying */}
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="mb-3">Your order</h6>
                  {product.imageUrl && (
                    <ImageGlobal
                      src={product.imageUrl}
                      alt={product.title}
                      className="img-fluid rounded mb-3"
                    />
                  )}
                  <p className="fw-semibold mb-1">{product.title}</p>
                  <p className="text-muted mb-2" style={{ fontSize: 13 }}>
                    {product.category}
                  </p>
                  <p className="mb-3">
                    {hasPrice(product.price) ? (
                      <span className="fs-18 fw-bold">
                        {formatPrice(product.price)}
                      </span>
                    ) : (
                      <span className="text-muted">Price on request</span>
                    )}
                  </p>

                  <hr />
                  <h6 className="mb-2">Step 1 — pay the seller</h6>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    Message us on WhatsApp for the account details, make the
                    transfer, then come back and submit your proof below.
                  </p>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success w-100"
                  >
                    <i className="isax isax-whatsapp me-1" />
                    Contact the seller
                  </a>
                </div>
              </div>
            </div>

            {/* Proof of payment */}
            <div className="col-lg-8">
              <form onSubmit={submit} className="card border-0 shadow-sm">
                <div className="card-body">
                  <h6 className="mb-1">Step 2 — submit your payment proof</h6>
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    We verify every payment by hand. You&apos;ll get a reference
                    number and can track progress under My Products.
                  </p>

                  {!isStudent && (
                    <div className="alert alert-warning">
                      Please{" "}
                      <Link to={all_routes.login}>sign in as a student</Link> to
                      submit your payment proof.
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Payment method</label>
                      <select
                        className="form-select"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                      >
                        {PAYMENT_METHODS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Transaction ID / reference number
                      </label>
                      <input
                        className="form-control"
                        placeholder="e.g. 4821993017"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Payment screenshot{" "}
                        <small className="text-muted">
                          (image, up to {MAX_SCREENSHOT_MB} MB)
                        </small>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={pickScreenshot}
                      />
                      {preview && (
                        <img
                          src={preview}
                          alt="Payment screenshot preview"
                          className="img-fluid rounded border mt-2"
                          style={{ maxHeight: 260 }}
                        />
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        Note <small className="text-muted">(optional)</small>
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Anything we should know about this payment"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <Link to={all_routes.services} className="btn btn-light">
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-secondary"
                      disabled={saving || !isStudent}
                    >
                      {saving ? "Submitting..." : "Submit payment proof"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderVerification;
