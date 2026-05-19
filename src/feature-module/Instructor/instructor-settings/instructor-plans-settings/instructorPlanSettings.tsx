import { DatePicker } from "antd";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import Breadcrumb from "../../../../core/common/Breadcrumb/breadcrumb";
import type { OptionType } from "../../../../core/common/commonSelect";
import CustomSelect from "../../../../core/common/commonSelect";
import InstructorSidebar from "../../common/instructorSidebar";
import ProfileCard from "../../common/profileCard";
import InstructorSettingsLink from "../settings-link/instructorSettingsLink";

import ImageWithBasePath from "../../../../core/common/imageWithBasePath";
import type { CatalogItem, Invoice } from "../../../../core/redux/invoiceSlice";
import {
  clearInvoiceState,
  createInvoice,
  deleteInvoice,
  fetchCatalog,
  fetchInvoiceById,
  fetchInvoices,
} from "../../../../core/redux/invoiceSlice";
import type { AppDispatch, RootState } from "../../../../core/redux/store";

// ─── Payment method & status options ───
const paymentMethodOptions: OptionType[] = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "JazzCash", label: "JazzCash" },
  { value: "Easypaisa", label: "Easypaisa" },
];

const paymentStatusOptions: OptionType[] = [
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

// ─── Empty form state ───
const emptyForm = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  customerCity: "",
  paymentMethod: "",
  paymentStatus: "Pending",
  dueDate: "",
  notes: "",
  discount: "",
};

const InstructorPlanSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const printRef = useRef<HTMLDivElement>(null);

  // Auth user (for createdBy)
  const user = useSelector((state: RootState) => state.auth.user);

  // Invoice state from Redux
  const {
    invoices,
    catalog,
    loading,
    catalogLoading,
    success,
    error,
  } = useSelector((state: RootState) => state.invoice);

  // Local form state
  const [form, setForm] = useState(emptyForm);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<OptionType | null>(null);
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<OptionType | null>(paymentStatusOptions[0]);
  const [selectedItems, setSelectedItems] = useState<
    { itemId: string; qty: number }[]
  >([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // ─── Fetch invoices + catalog on mount ───
  useEffect(() => {
    dispatch(fetchInvoices({}));
    dispatch(fetchCatalog());
    return () => {
      dispatch(clearInvoiceState());
    };
  }, [dispatch]);

  // ─── Re-fetch when filter changes ───
  useEffect(() => {
    if (statusFilter) {
      dispatch(fetchInvoices({ paymentStatus: statusFilter }));
    } else {
      dispatch(fetchInvoices({}));
    }
  }, [statusFilter, dispatch]);

  // ─── Success / Error toasts ───
  useEffect(() => {
    if (success) {
      // toast.success("Invoice created successfully!");
      dispatch(clearInvoiceState());
      dispatch(fetchInvoices({}));
      resetForm();
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch]);

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedItems([]);
    setSelectedPaymentMethod(null);
    setSelectedPaymentStatus(paymentStatusOptions[0]);
  };

  // ─── Form handlers ───
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ─── Item selection toggle ───
  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.itemId === itemId);
      if (exists) return prev.filter((i) => i.itemId !== itemId);
      return [...prev, { itemId, qty: 1 }];
    });
  };

  // ─── Get item price safely ───
  const getItemPrice = (item: CatalogItem): number => {
    // Handle different possible field names from API
    const price =
      (item as any).price ??
      (item as any).amount ??
      (item as any).unitPrice ??
      (item as any).cost ??
      0;
    const parsed = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(parsed) ? 0 : parsed;
  };

  // ─── Find catalog item by ID ───
  const findCatalogItem = (itemId: string): CatalogItem | undefined => {
    return catalog.find((c) => c.itemId === itemId || c._id === itemId);
  };

  // ─── Calculate total from selected items ───
  const calculateTotal = (): number => {
    let total = 0;
    selectedItems.forEach((sel) => {
      const cat = findCatalogItem(sel.itemId);
      if (cat) total += getItemPrice(cat) * sel.qty;
    });
    // Apply discount
    if (form.discount) {
      const discountStr = form.discount.replace("%", "").trim();
      const discountVal = parseFloat(discountStr);
      if (!isNaN(discountVal) && discountVal > 0) {
        total = total - (total * discountVal) / 100;
      }
    }
    return Math.max(Math.round(total * 100) / 100, 0);
  };

  // ─── Submit handler ───
  const handleCreateInvoice = () => {
    if (!form.customerName || !form.customerEmail || !form.customerPhone) {
      toast.error("Please fill in all required customer fields");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    if (!form.paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!form.dueDate) {
      toast.error("Please select a due date");
      return;
    }

    dispatch(
      createInvoice({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        customerCity: form.customerCity,
        items: selectedItems,
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
        dueDate: form.dueDate,
        notes: form.notes,
        discount: form.discount || undefined,
        createdBy: user?._id || "",
      }),
    );
  };

  // ─── Delete handler ───
  const handleDelete = () => {
    if (deleteId) {
      dispatch(deleteInvoice(deleteId))
        .unwrap()
        .then(() => {
          toast.success("Invoice deleted successfully");
          setDeleteId(null);
        });
    }
  };

  // ─── View invoice handler ───
  const handleViewInvoice = (inv: Invoice) => {
    setViewInvoice(inv);
    // Also fetch fresh data if needed
    if (inv._id) {
      dispatch(fetchInvoiceById(inv._id));
    }
  };

  // ─── Print handler ───
  const handlePrint = () => {
    if (!viewInvoice) return;

    const items = getInvoiceItemsWithDetails(viewInvoice);
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const discountPercent = viewInvoice.discount || 0;
    const discountAmount = viewInvoice.discountAmount || 0;
    const baseUrl = window.location.origin;
    const logoUrl = `${baseUrl}/assets/img/blu_light.PNG`;
    const stampUrl = `${baseUrl}/assets/img/stamp.PNG`;

    const statusColor =
      viewInvoice.paymentStatus === "Completed"
        ? "#198754"
        : viewInvoice.paymentStatus === "Pending"
          ? "#0dcaf0"
          : "#dc3545";

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${viewInvoice.invoiceId || viewInvoice._id?.slice(-6).toUpperCase() || ""}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background: #fff;
          padding: 24px 32px;
          font-size: 13px;
          line-height: 1.5;
        }
        a { color: #333; text-decoration: none; }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 1px solid #ddd;
          margin-bottom: 16px;
        }
        .header img { height: 60px; display: block; margin-bottom: 6px; }
        .header-right { text-align: right; }
        .invoice-id { color: #00bffd; font-size: 15px; font-weight: 700; margin-bottom: 4px; }

        .parties {
          display: flex;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid #ddd;
          margin-bottom: 16px;
          gap: 16px;
        }
        .party { flex: 1; }
        .party-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .party h6 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
        .party p { margin-bottom: 2px; font-size: 12px; color: #555; }
        .status-box { text-align: right; min-width: 120px; }
        .status-badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 12px;
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .payment-method { font-size: 12px; color: #888; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th {
          background: #f5f5f5;
          padding: 8px 10px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          color: #666;
          border-bottom: 2px solid #ddd;
        }
        td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .fw-bold { font-weight: 600; }

        .totals-wrapper { display: flex; justify-content: flex-end; margin-bottom: 16px; }
        .totals { width: 260px; }
        .totals .row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
        }
        .totals .row.border-top { border-top: 2px solid #333; margin-top: 6px; padding-top: 8px; }
        .totals .row.border-top span { font-size: 14px; font-weight: 700; }

        .footer-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-top: 1px solid #ddd;
          padding-top: 16px;
          margin-top: 8px;
        }
        .terms h6 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .terms p { font-size: 11px; color: #555; line-height: 1.6; }
        .notes h6 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .notes p { font-size: 11px; color: #555; }
        .signature { text-align: right; min-width: 140px; }
        .signature img { height: 70px; margin-bottom: 4px; }
        .signature h6 { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .signature p { font-size: 11px; color: #888; }

        @media print {
          body { padding: 16px 24px; }
          @page { margin: 12mm 10mm; size: A4; }
        }
      </style>
    </head>
    <body>

      <!-- Header -->
      <div class="header">
        <div>
          <img src="${logoUrl}" alt="Logo" onerror="this.style.display='none'" />
          <p style="font-size:11px; color:#888; margin-top:4px;">Near HBL Bank Railway Road, Dunyapur, Pakistan</p>
        </div>
        <div class="header-right">
          <div class="invoice-id">#${viewInvoice.invoiceId || viewInvoice._id?.slice(-6).toUpperCase() || ""}</div>
          <p>Created : ${viewInvoice.createdAt ? moment(viewInvoice.createdAt).format("MMM DD, YYYY") : "—"}</p>
          <p>Due : ${viewInvoice.dueDate ? moment(viewInvoice.dueDate).format("MMM DD, YYYY") : "—"}</p>
        </div>
      </div>

      <!-- Parties -->
      <div class="parties">
        <div class="party">
          <div class="party-label">Issued By</div>
          <h6>Bluverse Digital Hub</h6>
          <p>Email : bluversedigitalhub@gmail.com</p>
          <p>Phone : 03134339915</p>
          <p>Landline : 0608-304-657</p>
        </div>
        <div class="party">
          <div class="party-label">To</div>
          <h6>${viewInvoice.customerName}</h6>
          ${viewInvoice.customerCity ? `<p>City : ${viewInvoice.customerCity}</p>` : ""}
          <p>Email : ${viewInvoice.customerEmail}</p>
          <p>Phone : ${viewInvoice.customerPhone}</p>
        </div>
        <div class="status-box">
          <div class="party-label">Payment Status</div>
          <span class="status-badge" style="background:${statusColor}">${viewInvoice.paymentStatus}</span>
          <div class="payment-method">${viewInvoice.paymentMethod}</div>
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Cost</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td class="fw-bold">${item.name}</td>
              <td class="text-center">${item.qty}</td>
              <td class="text-right">Rs. ${item.price > 0 ? item.price.toLocaleString() : "—"}</td>
              <td class="text-right">Rs. ${item.total > 0 ? item.total.toLocaleString() : "—"}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals-wrapper">
        <div class="totals">
          <div class="row">
            <span>Sub Total</span>
            <span>Rs. ${subtotal.toLocaleString()}</span>
          </div>
          ${
            discountAmount > 0
              ? `<div class="row">
                  <span>Discount ${discountPercent ? discountPercent + "%" : ""}</span>
                  <span>- Rs. ${discountAmount.toLocaleString()}</span>
                </div>`
              : ""
          }
          <div class="row border-top">
            <span>Total Amount</span>
            <span>Rs. ${typeof viewInvoice.totalAmount === "number" ? viewInvoice.totalAmount.toLocaleString() : "—"}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer-section">
        <div>
          ${
            viewInvoice.notes
              ? `<div class="notes" style="margin-bottom:10px;">
                  <h6>Notes</h6>
                  <p>${viewInvoice.notes}</p>
                </div>`
              : ""
          }
          <div class="terms">
            <h6>Terms & Conditions – Bluverse Digital Hub</h6>
            <p>
                - All fees are non-refundable under any circumstances.
                <br />
                - Course access is granted as per your selected Lifetime
                plan.
                <br />
                - Account sharing is strictly prohibited and may result in
                permanent suspension.
                <br />
                - Content misuse, reselling, or piracy will lead to legal
                action.
                <br />
                - Students are responsible for submitting accurate
                enrollment information.
              </p>
          </div>
        </div>
        <div class="signature">
          <img src="${stampUrl}" alt="Stamp" onerror="this.style.display='none'" />
          <h6>${user?.name || user?.userName || "Admin"}</h6>
          <p>Authorized Signatory</p>
        </div>
      </div>

    </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for images to load before printing
    const images = printWindow.document.querySelectorAll("img");
    let loaded = 0;
    const totalImages = images.length;

    const tryPrint = () => {
      loaded++;
      if (loaded >= totalImages) {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 200);
      }
    };

    if (totalImages === 0) {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 200);
    } else {
      images.forEach((img) => {
        if (img.complete) {
          tryPrint();
        } else {
          img.onload = tryPrint;
          img.onerror = tryPrint;
        }
      });
    }
  };

  // ─── Get items with details for a given invoice ───
  const getInvoiceItemsWithDetails = (inv: Invoice) => {
    if (!inv.items) return [];
    return inv.items.map((item) => {
      const cat = findCatalogItem(item.itemId);
      return {
        ...item,
        name: cat?.name || item.itemId,
        price: cat ? getItemPrice(cat) : 0,
        total: cat ? getItemPrice(cat) * item.qty : 0,
      };
    });
  };

  // ─── Status badge helper ───
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return (
          <span className="badge badge-sm fs-10 bg-success rounded-pill d-inline-flex align-items-center">
            <i className="fa-solid fa-circle fs-5 me-1" />
            Completed
          </span>
        );
      case "Pending":
        return (
          <span className="badge badge-sm bg-skyblue rounded-pill d-inline-flex align-items-center">
            <i className="fa-solid fa-circle fs-5 me-1" />
            Pending
          </span>
        );
      case "Cancelled":
        return (
          <span className="badge badge-sm fs-10 bg-danger rounded-pill d-inline-flex align-items-center">
            <i className="fa-solid fa-circle fs-5 me-1" />
            Cancelled
          </span>
        );
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getModalContainer = () => {
    const modalElement = document.getElementById("create_invoice_modal");
    return modalElement ? modalElement : document.body;
  };

  return (
    <>
      <Breadcrumb title="Settings" />

      <div className="content">
        <div className="container">
          <ProfileCard />
          <div className="row">
            <InstructorSidebar />
            <div className="col-lg-9">
              <div className="mb-3">
                <h5>Settings</h5>
              </div>
              <InstructorSettingsLink />

              {/* ═══════ INVOICE SECTION ═══════ */}
              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                <h5 className="fs-18">Invoices</h5>
                <div className="d-flex gap-2">
                  {/* Status Filter */}
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="dropdown-toggle text-gray-6 btn rounded border d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {statusFilter || "All Status"}
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1"
                          onClick={() => setStatusFilter("")}
                        >
                          All
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1"
                          onClick={() => setStatusFilter("Completed")}
                        >
                          Completed
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1"
                          onClick={() => setStatusFilter("Pending")}
                        >
                          Pending
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className="dropdown-item rounded-1"
                          onClick={() => setStatusFilter("Cancelled")}
                        >
                          Cancelled
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Create Invoice Button */}
                  <button
                    className="btn btn-secondary d-flex align-items-center"
                    data-bs-toggle="modal"
                    data-bs-target="#create_invoice_modal"
                    onClick={() => {
                      resetForm();
                      if (!catalog.length) dispatch(fetchCatalog());
                    }}
                  >
                    <i className="isax isax-add-circle me-1" />
                    Create Invoice
                  </button>
                </div>
              </div>

              {/* Invoice Table */}
              {loading && !invoices.length ? (
                <div className="text-center my-4">
                  <span className="spinner-border" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center text-muted my-4">
                  <p>No invoices found. Create your first invoice!</p>
                </div>
              ) : (
                <div className="table-responsive custom-table">
                  <table className="table">
                    <thead className="thead-light">
                      <tr>
                        <th>#</th>
                        <th>Customer</th>
                        <th>Payment Method</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv: any) => (
                        <tr key={inv._id}>
                          <td>
                            <span className="text-primary fw-medium">
                              #{inv.invoiceId}
                            </span>
                          </td>
                          <td>
                            <div>
                              <span className="fw-medium d-block">
                                {inv.customerName}
                              </span>
                              <small className="text-muted">
                                {inv.customerEmail}
                              </small>
                            </div>
                          </td>
                          <td>{inv.paymentMethod}</td>
                          <td>
                            {inv.dueDate
                              ? moment(inv.dueDate).format("DD MMM YYYY")
                              : "—"}
                          </td>
                          <td className="fw-medium">
                            Rs.{" "}
                            {typeof inv.totalAmount === "number"
                              ? inv.totalAmount.toLocaleString()
                              : "—"}
                          </td>
                          <td>{getStatusBadge(inv.paymentStatus)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {/* View Invoice */}
                              <Link
                                to="#"
                                className="d-inline-flex fs-14 action-icon"
                                title="View Invoice"
                                data-bs-toggle="modal"
                                data-bs-target="#view_invoice_modal"
                                onClick={() => handleViewInvoice(inv)}
                              >
                                <i className="isax isax-eye" />
                              </Link>
                              {/* Download PDF */}
                              {inv.pdfUrl && (
                                <a
                                  href={inv.pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="d-inline-flex fs-14 action-icon"
                                  title="Download PDF"
                                >
                                  <i className="isax isax-import" />
                                </a>
                              )}
                              {/* Delete */}
                              <Link
                                to="#"
                                className="d-inline-flex fs-14 action-icon text-danger"
                                title="Delete"
                                data-bs-toggle="modal"
                                data-bs-target="#delete_invoice_modal"
                                onClick={() => setDeleteId(inv._id || "")}
                              >
                                <i className="isax isax-trash" />
                              </Link>
                            </div>
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

      {/* ═══════ CREATE INVOICE MODAL ═══════ */}
      <div className="modal fade" id="create_invoice_modal">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5>Create Invoice</h5>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="isax isax-close-circle5" />
              </button>
            </div>
            <div className="modal-body pb-0">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Customer Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="customerName"
                      value={form.customerName}
                      onChange={handleInputChange}
                      placeholder="Enter Full Name"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Customer Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="customerEmail"
                      value={form.customerEmail}
                      onChange={handleInputChange}
                      placeholder="e.g. your@example.com"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Phone Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleInputChange}
                      placeholder="e.g. 03001234567"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="customerCity"
                      value={form.customerCity}
                      onChange={handleInputChange}
                      placeholder="e.g. Lahore"
                    />
                  </div>
                </div>

                {/* ─── Fixed: Payment Method with controlled value ─── */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Payment Method <span className="text-danger">*</span>
                    </label>
                    <CustomSelect
                      options={paymentMethodOptions}
                      value={selectedPaymentMethod}
                      className="select"
                      placeholder="Select Method"
                      modal={true}
                      onChange={(val: OptionType) => {
                        setSelectedPaymentMethod(val);
                        setForm({
                          ...form,
                          paymentMethod: val.value as string,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* ─── Fixed: Payment Status with controlled value ─── */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Payment Status</label>
                    <CustomSelect
                      options={paymentStatusOptions}
                      value={selectedPaymentStatus}
                      className="select"
                      placeholder="Select Status"
                      modal={true}
                      onChange={(val: OptionType) => {
                        setSelectedPaymentStatus(val);
                        setForm({
                          ...form,
                          paymentStatus: val.value as string,
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Due Date <span className="text-danger">*</span>
                    </label>
                    <div className="input-icon position-relative calender-input">
                      <span className="input-icon-addon">
                        <i className="isax isax-calendar z-1" />
                      </span>
                      <DatePicker
                        className="form-control datetimepicker"
                        getPopupContainer={getModalContainer}
                        placeholder="Select due date"
                        onChange={(_date, dateString) =>
                          setForm({ ...form, dueDate: dateString as string })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">
                      Discount <small className="text-muted">(optional)</small>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="discount"
                      value={form.discount}
                      onChange={handleInputChange}
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      name="notes"
                      rows={2}
                      value={form.notes}
                      onChange={handleInputChange}
                      placeholder="e.g. First enrollment payment"
                    />
                  </div>
                </div>

                {/* ─── Item Catalog Selection (Fixed NaN) ─── */}
                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">
                      Select Items <span className="text-danger">*</span>
                    </label>
                    {catalogLoading ? (
                      <div className="text-center py-3">
                        <span className="spinner-border spinner-border-sm" />
                        <span className="ms-2">Loading catalog...</span>
                      </div>
                    ) : catalog.length === 0 ? (
                      <p className="text-muted">No catalog items available.</p>
                    ) : (
                      <div
                        className="border rounded p-3"
                        style={{ maxHeight: 250, overflowY: "auto" }}
                      >
                        {catalog.map((item: CatalogItem) => {
                          const itemKey = item.itemId || item._id;
                          const isSelected = selectedItems.some(
                            (s) => s.itemId === itemKey,
                          );

                          const price = getItemPrice(item);

                          return (
                            <div
                              key={item._id || item.itemId}
                              className={`d-flex align-items-center justify-content-between p-2 mb-2 rounded border ${
                                isSelected
                                  ? "border-primary bg-primary text-primary bg-opacity-10"
                                  : ""
                              }`}
                              style={{
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              <div
                                className="d-flex align-items-center flex-grow-1"
                                onClick={() => toggleItem(itemKey)}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input me-2"
                                  checked={isSelected}
                                  readOnly
                                />
                                <div>
                                  <span className="fw-medium">{item.name}</span>
                                  {item.description && (
                                    <small className="text-muted d-block">
                                      {item.description}
                                    </small>
                                  )}
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-semibold text-nowrap">
                                  Rs.{" "}
                                  {price > 0 ? price.toLocaleString() : "N/A"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Total Preview (Fixed NaN) ─── */}
                {selectedItems.length > 0 && (
                  <div className="col-md-12">
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-muted">
                            {selectedItems.length} item(s) selected
                          </span>
                          {form.discount && (
                            <span className="ms-2 badge bg-warning text-dark">
                              Discount: {form.discount.replace("%", "").trim()}%
                            </span>
                          )}
                        </div>
                        <h5 className="mb-0">
                          Total: Rs. {calculateTotal().toLocaleString()}
                        </h5>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn bg-gray-100 rounded-pill me-2"
                type="button"
                data-bs-dismiss="modal"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                className="btn btn-secondary rounded-pill"
                type="button"
                disabled={loading}
                data-bs-dismiss={!loading ? "modal" : undefined}
                onClick={handleCreateInvoice}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="isax isax-tick-circle me-1" />
                    Create Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ VIEW INVOICE MODAL ═══════ */}
      <div className="modal fade" id="view_invoice_modal">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5>PAYMENT RECEIPT</h5>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                  onClick={handlePrint}
                  title="Print Invoice"
                >
                  <i className="fa-solid fa-print" />
                  Print
                </button>
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
            <div className="modal-body">
              {viewInvoice && (
                <div ref={printRef}>
                  {/* ─── Header: Logo + Invoice Number ─── */}
                  <div className="border-bottom mb-3">
                    <div className="row justify-content-between align-items-center flex-wrap row-gap-4">
                      <div className="col-md-6">
                        <div className="mb-2 invoice-logo-white">
                          <ImageWithBasePath
                            src="assets/img/blu_light.PNG"
                            width={100}
                          />
                        </div>
                        <p className="mb-2">
                          Near HBL Bank Railway Road, Dunyapur, Pakistan
                        </p>
                      </div>
                      <div className="col-md-6">
                        <div className="text-end mb-3">
                          <h6 className="text-default mb-1 text-secondary fs-16">
                            #{viewInvoice.invoiceId}
                          </h6>
                          <p className="mb-1">
                            Created Date :{" "}
                            <span className="text-gray-9">
                              {viewInvoice.createdAt
                                ? moment(viewInvoice.createdAt).format(
                                    "MMM DD, YYYY",
                                  )
                                : "—"}
                            </span>
                          </p>
                          <p>
                            Due Date :{" "}
                            <span className="text-gray-9">
                              {viewInvoice.dueDate
                                ? moment(viewInvoice.dueDate).format(
                                    "MMM DD, YYYY",
                                  )
                                : "—"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── From / To / Status ─── */}
                  <div className="border-bottom mb-3">
                    <div className="row g-4">
                      <div className="col-lg-5">
                        <span className="mb-3 d-flex">Issued By</span>
                        <div>
                          <h6 className="mb-2">Bluverse Digital Hub</h6>
                          <p className="fs-14 mb-1">
                            Email :{" "}
                            <Link to="#">bluversedigitalhub@gmail.com</Link>
                          </p>
                          <p className="fs-14 mb-1">
                            Phone : <Link to="#">03134339915</Link>
                          </p>
                          <p className="fs-14 mb-1">
                            Landline : <Link to="#">0608-304-657</Link>
                          </p>
                        </div>
                      </div>
                      <div className="col-lg-5">
                        <span className="mb-3 d-flex">To</span>
                        <div>
                          <h6 className="mb-2">{viewInvoice.customerName}</h6>
                          {viewInvoice.customerCity && (
                            <p className="fs-14 mb-1">
                              City : {viewInvoice.customerCity}
                            </p>
                          )}
                          <p className="fs-14 mb-1">
                            Email :{" "}
                            <Link to="#">{viewInvoice.customerEmail}</Link>
                          </p>
                          <p className="fs-14">
                            Phone :{" "}
                            <Link to="#">{viewInvoice.customerPhone}</Link>
                          </p>
                        </div>
                      </div>
                      <div className="col-lg-2">
                        <div className="mb-3 text-end">
                          <span className="mb-1 d-block">Payment Status</span>
                          <span
                            className={`badge badge-md d-inline-flex align-items-center fs-10 fw-normal mb-4 ${
                              viewInvoice.paymentStatus === "Completed"
                                ? "bg-success"
                                : viewInvoice.paymentStatus === "Pending"
                                  ? "bg-info"
                                  : "bg-danger"
                            }`}
                          >
                            <i className="fa-solid fa-circle fs-5 me-1" />
                            {viewInvoice.paymentStatus}
                          </span>
                          <div>
                            <p className="fs-14 mb-0 text-muted">
                              {viewInvoice.paymentMethod}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Items Table ─── */}
                  <div>
                    <div className="table-responsive">
                      <table className="table invoice-table">
                        <thead className="thead-light">
                          <tr>
                            <th className="bg-light-400">#</th>
                            <th className="w-50 bg-light-400">Description</th>
                            <th className="text-center bg-light-400">Qty</th>
                            <th className="text-end bg-light-400">Cost</th>
                            <th className="text-end bg-light-400">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getInvoiceItemsWithDetails(viewInvoice).map(
                            (item, idx) => (
                              <tr key={idx}>
                                <td className="text-gray">{idx + 1}</td>
                                <td>
                                  <p className="text-gray-9 fw-semibold mb-0">
                                    {item.name}
                                  </p>
                                </td>
                                <td className="text-gray text-center">
                                  {item.qty}
                                </td>
                                <td className="text-gray text-end">
                                  Rs.{" "}
                                  {item.price > 0
                                    ? item.price.toLocaleString()
                                    : "—"}
                                </td>
                                <td className="text-gray text-end">
                                  Rs.{" "}
                                  {item.total > 0
                                    ? item.total.toLocaleString()
                                    : "—"}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ─── Totals Section ─── */}
                  <div className="border-bottom mb-3 pb-3">
                    <div className="row">
                      <div className="col-md-6" />
                      <div className="col-md-6">
                        {/* Subtotal */}
                        <div className="d-flex justify-content-between align-items-center border-bottom my-2 pb-2 pe-3">
                          <p className="text-gray mb-0">Sub Total</p>
                          <p className="text-gray-9 fw-medium mb-0">
                            Rs.{" "}
                            {getInvoiceItemsWithDetails(viewInvoice)
                              .reduce((sum, i) => sum + i.total, 0)
                              .toLocaleString()}
                          </p>
                        </div>
                        {/* Discount */}
                        <div className="d-flex justify-content-between align-items-center border-bottom my-2 pb-2 pe-3">
                          <p className="mb-0">
                            Discount{" "}
                            <span className="text-bold">
                              {viewInvoice?.discount || "0"}%
                            </span>
                          </p>
                          <p className="text-gray-9 fs-14 fw-medium mb-0">
                            - Rs.{" "}
                            {viewInvoice?.discountAmount?.toLocaleString() ||
                              "0"}
                          </p>
                        </div>
                        {/* Total Amount */}
                        <div className="d-flex justify-content-between align-items-center mb-2 pe-3 mt-2">
                          <h6 className="fs-16">Total Amount</h6>
                          <h6 className="fs-16">
                            Rs.{" "}
                            {typeof viewInvoice.totalAmount === "number"
                              ? viewInvoice.totalAmount.toLocaleString()
                              : "—"}
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Notes + Signature ─── */}
                  <div className="row align-items-center gy-3">
                    <div className="col-lg-9">
                      {viewInvoice.notes && (
                        <div className="mb-3">
                          <h6 className="mb-1 fs-16">Notes</h6>
                          <p>{viewInvoice.notes}</p>
                        </div>
                      )}
                      <div>
                        <h6 className="mb-1 fs-16">
                          Terms & Conditions – Bluverse Digital Hub
                        </h6>
                        <p>
                          - All fees are non-refundable under any circumstances.
                          <br />
                          - Course access is granted as per your selected
                          Lifetime plan.
                          <br />
                          - Account sharing is strictly prohibited and may
                          result in permanent suspension.
                          <br />
                          - Content misuse, reselling, or piracy will lead to
                          legal action.
                          <br />- Students are responsible for submitting
                          accurate enrollment information.
                        </p>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="text-end">
                        <ImageWithBasePath
                          src="assets/img/stamp.PNG"
                          width={100}
                        />
                      </div>
                      <div className="text-end">
                        <h6 className="fs-16 pe-3 mb-2">
                          {user?.name || user?.userName || "Admin"}
                        </h6>
                        <p>Authorized Signatory</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ DELETE INVOICE MODAL ═══════ */}
      <div className="modal fade" id="delete_invoice_modal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center custom-modal-body">
              <span className="avatar avatar-lg bg-secondary-transparent rounded-circle mb-2">
                <i className="isax isax-trash fs-24 text-danger" />
              </span>
              <div>
                <h4 className="mb-2">Delete Invoice</h4>
                <p className="mb-3">
                  Are you sure you want to delete this invoice? This action
                  cannot be undone.
                </p>
                <div className="d-flex align-items-center justify-content-center">
                  <Link
                    to="#"
                    className="btn bg-gray-100 rounded-pill me-2"
                    data-bs-dismiss="modal"
                    onClick={() => setDeleteId(null)}
                  >
                    Cancel
                  </Link>
                  <button
                    className="btn btn-danger rounded-pill"
                    data-bs-dismiss="modal"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorPlanSettings;
