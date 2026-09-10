import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import ProfileCard from "../common/profileCard";
import StudentSidebar from "../common/studentSidebar";
import {
  DeliveryPanel,
  OrderSupport,
  OrderTimeline,
  StatusBadge,
  orderDate,
} from "../../../core/common/order/orderParts";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import { fetchMyOrders, normaliseStatus } from "../../../core/redux/orderSlice";
import type { Order } from "../../../core/redux/orderSlice";
import { all_routes } from "../../router/all_routes";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// My Products (brief §4, §5, §6).
//
// This replaces the template's Order History page, which rendered the same
// invented rows (order #ORD010) for every student and wrote nowhere. Delivery
// details are served sealed until the order actually reaches a delivered
// state, so nothing here can leak a licence key early.

const TABS = [
  { key: "all", label: "All orders" },
  { key: "active", label: "In progress" },
  { key: "delivered", label: "Delivered" },
] as const;

const DELIVERED = ["Product Delivered", "Completed"];

const MyProducts = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((s: RootState) => (s as any).auth.user);
  const { orders, loading, error } = useSelector((s: RootState) => (s as any).order);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const studentId = currentUser?._id;

  useEffect(() => {
    if (studentId) dispatch(fetchMyOrders(studentId) as any);
  }, [dispatch, studentId]);

  const filtered = useMemo(() => {
    const list: Order[] = orders || [];
    if (tab === "all") return list;
    return list.filter((o) => {
      const delivered = DELIVERED.includes(normaliseStatus(o.status));
      return tab === "delivered" ? delivered : !delivered;
    });
  }, [orders, tab]);

  return (
    <>
      <Breadcrumb title="My Products" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <div>
                  <h5 className="mb-0">My Products</h5>
                  <p className="text-muted mb-0" style={{ fontSize: 13 }}>
                    Everything you&apos;ve bought from the Shop, and where each
                    order has got to.
                  </p>
                </div>
                <Link to={all_routes.services} className="btn btn-sm btn-secondary">
                  Browse Shop
                </Link>
              </div>

              <ul className="nav nav-pills mb-3 gap-2">
                {TABS.map((t) => (
                  <li className="nav-item" key={t.key}>
                    <button
                      type="button"
                      className={`nav-link ${tab === t.key ? "active" : ""}`}
                      onClick={() => setTab(t.key)}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>

              {error && <div className="alert alert-danger">{error}</div>}

              {loading && !orders?.length ? (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              ) : !filtered.length ? (
                <div className="text-center text-muted py-5">
                  <p className="fs-18 mb-1">🛍️</p>
                  <p className="mb-3">
                    {orders?.length
                      ? "Nothing in this tab."
                      : "You haven't bought anything yet."}
                  </p>
                  <Link to={all_routes.services} className="btn btn-secondary">
                    Visit the Shop
                  </Link>
                </div>
              ) : (
                filtered.map((o) => {
                  const open = openId === o._id;
                  const delivered = DELIVERED.includes(normaliseStatus(o.status));
                  return (
                    <div key={o._id} className="card border-0 shadow-sm mb-3">
                      <div className="card-body">
                        <div className="d-flex gap-3 flex-wrap align-items-start">
                          {o.productImageUrl ? (
                            <ImageGlobal
                              src={o.productImageUrl}
                              alt={o.productTitle}
                              className="rounded"
                              style={{ width: 72, height: 72, objectFit: "cover" }}
                            />
                          ) : (
                            <div
                              className="rounded bg-light d-flex align-items-center justify-content-center"
                              style={{ width: 72, height: 72 }}
                            >
                              <i className="isax isax-box" />
                            </div>
                          )}

                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                              <div>
                                <p className="fw-semibold mb-1">{o.productTitle}</p>
                                <div
                                  className="text-muted d-flex flex-wrap gap-3"
                                  style={{ fontSize: 12 }}
                                >
                                  <span>Ref {o.orderId || "—"}</span>
                                  <span>{orderDate(o.createdAt)}</span>
                                  <span>
                                    {hasPrice(o.pricePaid)
                                      ? formatPrice(o.pricePaid)
                                      : "—"}
                                  </span>
                                  {o.transactionId && (
                                    <span>Txn {o.transactionId}</span>
                                  )}
                                </div>
                              </div>
                              <StatusBadge status={o.status} />
                            </div>

                            <div className="mt-3">
                              <OrderTimeline order={o} />
                            </div>

                            {delivered && (
                              <div className="mt-3 p-3 border rounded bg-white">
                                <p className="fw-semibold mb-2" style={{ fontSize: 14 }}>
                                  Your product
                                </p>
                                <DeliveryPanel order={o} />
                              </div>
                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-link px-0 mt-2"
                              onClick={() => setOpenId(open ? null : o._id || null)}
                            >
                              {open ? "Hide details" : "Order details & support"}
                            </button>

                            {open && (
                              <div className="mt-2 pt-3 border-top">
                                <div className="row g-3" style={{ fontSize: 13 }}>
                                  <div className="col-md-6">
                                    <p className="mb-1">
                                      <span className="text-muted">
                                        Payment method:{" "}
                                      </span>
                                      {o.paymentMethod || "—"}
                                    </p>
                                    <p className="mb-1">
                                      <span className="text-muted">
                                        Transaction ID:{" "}
                                      </span>
                                      {o.transactionId || "—"}
                                    </p>
                                    {o.customerNote && (
                                      <p className="mb-1">
                                        <span className="text-muted">Your note: </span>
                                        {o.customerNote}
                                      </p>
                                    )}
                                    {o.paymentScreenshotUrl && (
                                      <a
                                        href={o.paymentScreenshotUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        View the screenshot you sent
                                      </a>
                                    )}
                                  </div>
                                  <div className="col-md-6">
                                    <p className="text-muted mb-1">History</p>
                                    {(o.statusHistory || []).length ? (
                                      <ul className="list-unstyled mb-0">
                                        {[...(o.statusHistory || [])]
                                          .reverse()
                                          .map((h, i) => (
                                            <li key={i} className="mb-1">
                                              <StatusBadge status={h.status} />
                                              <span className="text-muted ms-2">
                                                {orderDate(h.at)}
                                              </span>
                                              {h.note && (
                                                <div className="text-muted">
                                                  {h.note}
                                                </div>
                                              )}
                                            </li>
                                          ))}
                                      </ul>
                                    ) : (
                                      <p className="text-muted mb-0">
                                        No history recorded.
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-top">
                                  <OrderSupport order={o} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProducts;
