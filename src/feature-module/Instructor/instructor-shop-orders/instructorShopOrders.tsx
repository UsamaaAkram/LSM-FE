import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ProfileCard from "../common/profileCard";
import InstructorSidebar from "../common/instructorSidebar";
import {
  DeliveryPanel,
  OrderTimeline,
  StatusBadge,
  orderDate,
} from "../../../core/common/order/orderParts";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import Pagination, { usePagination } from "../../../core/common/Pagination";
import {
  ALL_STATUSES,
  DELIVERY_TYPES,
  deliverOrder,
  fetchOrders,
  normaliseStatus,
  updateOrderStatus,
} from "../../../core/redux/orderSlice";
import type { Order } from "../../../core/redux/orderSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// Shop Orders (brief §2, §3, §9).
//
// The review queue: see the proof, verify the payment, hand the product over,
// move the status. The delivery form is separate from the status control on
// purpose — the client's headline complaint was that approving a payment
// delivered nothing, so the server refuses to mark an order delivered until
// there is something attached, and this screen mirrors that.

const STAFF = ["admin", "superadmin", "super-admin", "instructor", "teacher"];

const InstructorShopOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => (s as any).auth.user);
  const { orders, counts, loading, saving, error } = useSelector(
    (s: RootState) => (s as any).order
  );

  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Draft state per open order, so typing in the delivery form doesn't fight
  // with the list refreshing underneath.
  const [dType, setDType] = useState<string>("Download Link");
  const [dValue, setDValue] = useState("");
  const [dUser, setDUser] = useState("");
  const [dPass, setDPass] = useState("");
  const [dInstr, setDInstr] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const role = String(currentUser?.role || "");
  const isStaff = STAFF.includes(role.toLowerCase());
  const actorName = currentUser?.name || currentUser?.userName || role;

  // Debounced so a search box doesn't fire a request per keystroke.
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    dispatch(fetchOrders({ status, search: debounced }) as any);
  }, [dispatch, status, debounced]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // Same reset rule as every other table: a new status filter or search is a
  // new result set, so the page returns to 1.
  const { page, pageSize, pageCount, total, pageRows, setPage, setPageSize } =
    usePagination<Order>(orders || [], `${status}|${debounced}`);

  const openOrder: Order | undefined = useMemo(
    () => (orders || []).find((o: Order) => o._id === openId),
    [orders, openId]
  );

  const openReview = (o: Order) => {
    setOpenId(o._id || null);
    const d = o.delivery || {};
    setDType(d.type || "Download Link");
    setDValue(d.value || "");
    setDUser(d.username || "");
    setDPass(d.password || "");
    setDInstr(d.instructions || o.deliveredContent || "");
    setAdminNote(o.adminNote || "");
    setRejectReason(o.rejectionReason || "");
  };

  const refresh = () => dispatch(fetchOrders({ status, search: debounced }) as any);

  const move = async (o: Order, next: string) => {
    if (next === "Rejected" && !rejectReason.trim()) {
      toast.error("Give a reason for the rejection — the customer sees it.");
      return;
    }
    const action: any = await dispatch(
      updateOrderStatus({
        id: o._id as string,
        status: next,
        adminNote: adminNote.trim() || undefined,
        rejectionReason: next === "Rejected" ? rejectReason.trim() : undefined,
        role,
        actorName,
      }) as any
    );
    if (updateOrderStatus.fulfilled.match(action)) {
      toast.success(`Order moved to ${next}.`);
      refresh();
    } else {
      toast.error(action.payload || "Could not update the order.");
    }
  };

  const saveDelivery = async (o: Order, markDelivered: boolean) => {
    const action: any = await dispatch(
      deliverOrder({
        id: o._id as string,
        type: dType,
        value: dValue.trim(),
        username: dUser.trim(),
        password: dPass.trim(),
        instructions: dInstr.trim(),
        markDelivered,
        role,
        actorName,
      }) as any
    );
    if (deliverOrder.fulfilled.match(action)) {
      toast.success(
        markDelivered ? "Delivered — the customer has been notified." : "Delivery saved."
      );
      refresh();
    } else {
      toast.error(action.payload || "Could not save the delivery.");
    }
  };

  if (!isStaff) {
    return (
      <>
        <Breadcrumb title="Shop Orders" />
        <div className="content">
          <div className="container">
            <div className="alert alert-warning">
              Only staff can review shop orders.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Shop Orders" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="page-title mb-3">
                <h5 className="mb-0">Shop Orders</h5>
                <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                  Verify payments, hand products over, and keep the customer&apos;s
                  status in step.
                </p>
              </div>

              {/* Filters (brief §9) */}
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <input
                    className="form-control mb-3"
                    placeholder="Search by order ID, customer name, email, product or transaction ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm ${status === "" ? "btn-primary" : "btn-light"}`}
                      onClick={() => setStatus("")}
                    >
                      All
                    </button>
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn-sm ${status === s ? "btn-primary" : "btn-light"}`}
                        onClick={() => setStatus(s)}
                      >
                        {s}
                        {counts?.[s] ? (
                          <span className="badge bg-secondary ms-1">{counts[s]}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {loading && !orders?.length ? (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              ) : !orders?.length ? (
                <div className="text-center text-muted py-5">
                  <p className="mb-0">No orders match this view.</p>
                </div>
              ) : (
                <div className="card border-0 shadow-sm">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Amount</th>
                          <th>Proof</th>
                          <th>Status</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map((o: Order) => (
                          <tr key={o._id}>
                            <td style={{ fontSize: 13 }}>
                              <div className="fw-semibold">{o.orderId || "—"}</div>
                              <div className="text-muted">{orderDate(o.createdAt)}</div>
                            </td>
                            <td style={{ fontSize: 13 }}>
                              <div>{o.studentName || "—"}</div>
                              <div className="text-muted">{o.studentEmail || ""}</div>
                            </td>
                            <td style={{ fontSize: 13 }}>{o.productTitle}</td>
                            <td style={{ fontSize: 13 }}>
                              {hasPrice(o.pricePaid) ? formatPrice(o.pricePaid) : "—"}
                            </td>
                            <td style={{ fontSize: 13 }}>
                              {o.paymentScreenshotUrl ? (
                                <a
                                  href={o.paymentScreenshotUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Screenshot
                                </a>
                              ) : (
                                <span className="text-muted">none</span>
                              )}
                              {o.transactionId && (
                                <div className="text-muted">{o.transactionId}</div>
                              )}
                            </td>
                            <td>
                              <StatusBadge status={o.status} />
                            </td>
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-sm btn-secondary"
                                onClick={() =>
                                  openId === o._id ? setOpenId(null) : openReview(o)
                                }
                              >
                                {openId === o._id ? "Close" : "Review"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 pb-3">
                    <Pagination
                      page={page}
                      pageCount={pageCount}
                      total={total}
                      pageSize={pageSize}
                      onPage={setPage}
                      onPageSize={setPageSize}
                      label="orders"
                    />
                  </div>
                </div>
              )}

              {/* Review panel */}
              {openOrder && (
                <div className="card border-0 shadow-sm mt-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                      <div>
                        <h6 className="mb-1">
                          {openOrder.orderId} — {openOrder.productTitle}
                        </h6>
                        <div className="text-muted" style={{ fontSize: 13 }}>
                          {openOrder.studentName} · {openOrder.studentEmail} ·{" "}
                          {openOrder.paymentMethod || "method not given"}
                        </div>
                      </div>
                      <StatusBadge status={openOrder.status} />
                    </div>

                    <OrderTimeline order={openOrder} />

                    <div className="row g-3 mt-3">
                      {/* Proof */}
                      <div className="col-md-5">
                        <p className="fw-semibold mb-2" style={{ fontSize: 14 }}>
                          Payment proof
                        </p>
                        <p className="mb-1" style={{ fontSize: 13 }}>
                          <span className="text-muted">Amount charged: </span>
                          {hasPrice(openOrder.pricePaid)
                            ? formatPrice(openOrder.pricePaid)
                            : "—"}
                        </p>
                        <p className="mb-1" style={{ fontSize: 13 }}>
                          <span className="text-muted">Transaction ID: </span>
                          {openOrder.transactionId || "—"}
                        </p>
                        {openOrder.customerNote && (
                          <p className="mb-2" style={{ fontSize: 13 }}>
                            <span className="text-muted">Customer note: </span>
                            {openOrder.customerNote}
                          </p>
                        )}
                        {openOrder.paymentScreenshotUrl ? (
                          <a
                            href={openOrder.paymentScreenshotUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={openOrder.paymentScreenshotUrl}
                              alt="Payment proof"
                              className="img-fluid rounded border"
                              style={{ maxHeight: 300 }}
                            />
                          </a>
                        ) : (
                          <p className="text-muted" style={{ fontSize: 13 }}>
                            No screenshot was attached.
                          </p>
                        )}
                      </div>

                      {/* Delivery (brief §5) */}
                      <div className="col-md-7">
                        <p className="fw-semibold mb-2" style={{ fontSize: 14 }}>
                          Deliver the product
                        </p>
                        <div className="row g-2">
                          <div className="col-md-6">
                            <label className="form-label">Delivery type</label>
                            <select
                              className="form-select"
                              value={dType}
                              onChange={(e) => setDType(e.target.value)}
                            >
                              {DELIVERY_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>

                          {dType === "Login Credentials" ? (
                            <>
                              <div className="col-md-6">
                                <label className="form-label">Username</label>
                                <input
                                  className="form-control"
                                  value={dUser}
                                  onChange={(e) => setDUser(e.target.value)}
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label">Password</label>
                                <input
                                  className="form-control"
                                  value={dPass}
                                  onChange={(e) => setDPass(e.target.value)}
                                />
                              </div>
                            </>
                          ) : (
                            <div className="col-md-6">
                              <label className="form-label">
                                {dType.includes("Link") || dType === "External URL"
                                  ? "URL"
                                  : "Value"}
                              </label>
                              <input
                                className="form-control"
                                placeholder={
                                  dType === "License Key"
                                    ? "XXXX-XXXX-XXXX"
                                    : "https://..."
                                }
                                value={dValue}
                                onChange={(e) => setDValue(e.target.value)}
                              />
                            </div>
                          )}

                          <div className="col-12">
                            <label className="form-label">
                              Instructions for the customer
                            </label>
                            <textarea
                              className="form-control"
                              rows={3}
                              placeholder="How to use it, activation steps, anything they need to know"
                              value={dInstr}
                              onChange={(e) => setDInstr(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mt-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            disabled={saving}
                            onClick={() => saveDelivery(openOrder, false)}
                          >
                            Save without delivering
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            disabled={saving}
                            onClick={() => saveDelivery(openOrder, true)}
                          >
                            Deliver &amp; notify customer
                          </button>
                        </div>

                        {/* What the customer will actually see. Shown here so a
                            blank handover is caught before it is released. */}
                        <div className="mt-3 p-2 border rounded bg-light">
                          <p
                            className="text-muted mb-2"
                            style={{ fontSize: 12 }}
                          >
                            What the customer sees once delivered
                          </p>
                          <DeliveryPanel order={openOrder} />
                        </div>
                      </div>
                    </div>

                    <hr />

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">
                          Internal note{" "}
                          <small className="text-muted">
                            (staff only — never shown to the customer)
                          </small>
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Rejection reason{" "}
                          <small className="text-muted">
                            (required to reject — the customer reads this)
                          </small>
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-3">
                      {ALL_STATUSES.filter(
                        (s) => s !== normaliseStatus(openOrder.status)
                      ).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`btn btn-sm ${
                            s === "Rejected" ? "btn-outline-danger" : "btn-outline-secondary"
                          }`}
                          disabled={saving}
                          onClick={() => move(openOrder, s)}
                        >
                          Move to {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorShopOrders;
