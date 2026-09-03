import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import StudentSidebar from "../common/studentSidebar";
import ProfileCard from "../common/profileCard";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import { fetchOrders } from "../../../core/redux/orderSlice";
import type { AppDispatch, RootState } from "../../../core/redux/store";

// "My Orders" (#43) — was a fully static/fake page (hardcoded #ORD010 rows,
// a generic invoice template with placeholder names). Now backed by the
// real Shop order pipeline, scoped to the logged-in student.
const STATUS_BADGE: Record<string, string> = {
  "Pending Payment": "bg-secondary",
  "Under Review": "bg-warning",
  Approved: "bg-info",
  Rejected: "bg-danger",
  Completed: "bg-success",
};

const StudentOrder = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => (state as any).auth.user);
  const { orders, loading } = useSelector((state: RootState) => (state as any).order);

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchOrders({ studentId: currentUser._id }) as any);
    }
  }, [dispatch, currentUser?._id]);

  return (
    <>
      <Breadcrumb title="My Orders" />
      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <StudentSidebar />
            <div className="col-lg-9">
              <div className="page-title d-flex align-items-center justify-content-between mb-3">
                <h5>My Orders</h5>
              </div>
              {loading ? (
                <div className="text-center py-5">
                  <span className="spinner-border" />
                </div>
              ) : !orders.length ? (
                <div className="text-center text-muted py-5">
                  No orders yet — buy something from the Shop!
                </div>
              ) : (
                <div className="table-responsive custom-table">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Delivered</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o: any) => (
                        <tr key={o._id}>
                          <td>{o.productTitle}</td>
                          {/* #43 — what this order was for. Orders placed
                              before the amount was recorded show a dash. */}
                          <td>
                            {hasPrice(o.pricePaid) ? (
                              formatPrice(o.pricePaid)
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td>{moment(o.createdAt).format("DD MMM YYYY")}</td>
                          <td>
                            <span
                              className={`badge ${
                                STATUS_BADGE[o.status] || "bg-secondary"
                              } d-inline-flex align-items-center`}
                            >
                              <i className="fa-solid fa-circle fs-5 me-1" />
                              {o.status}
                            </span>
                          </td>
                          <td>
                            {o.deliveredContent ? (
                              <span className="text-break">{o.deliveredContent}</span>
                            ) : (
                              <span className="text-muted">
                                {o.status === "Rejected"
                                  ? "—"
                                  : "Pending admin review"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentOrder;
