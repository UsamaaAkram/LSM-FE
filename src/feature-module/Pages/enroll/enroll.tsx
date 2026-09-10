import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import ImageGlobal from "../../../core/common/ImageGlobal/ImageGlobal";
import { whatsappInquiry } from "../../../core/common/bluverseLinks";
import { formatPrice, hasPrice } from "../../../core/common/coursePrice";
import { fetchCourseById, fetchCourses } from "../../../core/redux/courses";
import { submitEnrollment } from "../../../core/redux/enrollmentSlice";
import { all_routes } from "../../router/all_routes";

// #47 — the whole enrollment flow lives on one route (/enroll) with the three
// steps as internal state, per the doc's routing requirement. A course can be
// deep-linked with ?course=<id>; without one, step 0 asks the student to pick.
//
// Payment methods are configurable here rather than scattered through the JSX.
const PAYMENT_METHODS = [
  "Bank Transfer",
  "JazzCash",
  "Easypaisa",
  "Cash",
  "Other",
];

const STEPS = ["Details", "Payment", "Review"];

type Errors = Record<string, string>;

const Enroll: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const route = all_routes;

  const courseId = params.get("course") || "";
  const { currentCourse, courses } = useSelector(
    (s: any) => s.courses || {}
  );
  const auth = useSelector((s: any) => s.auth?.user);
  const { submitting } = useSelector((s: any) => s.enrollment || {});

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Errors>({});

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [planName, setPlanName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Step 2
  const [paymentMethod, setPaymentMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");

  useEffect(() => {
    if (courseId) dispatch(fetchCourseById(courseId) as any);
    else dispatch(fetchCourses({ status: "published" }) as any);
  }, [dispatch, courseId]);

  // Prefill from the signed-in account so a logged-in student isn't retyping.
  useEffect(() => {
    if (!auth) return;
    const s = auth.student ?? auth;
    setFirstName((v) => v || s.firstName || "");
    setLastName((v) => v || s.lastName || "");
    setEmail((v) => v || s.email || "");
    setWhatsapp((v) => v || s.phoneNumber || "");
  }, [auth]);

  const course = courseId ? currentCourse : null;
  const isFree = !!course?.freeAccess;

  // Only plans an admin has left active are offered.
  const activePlans = useMemo(
    () => (course?.plans || []).filter((p: any) => p.isActive !== false),
    [course]
  );

  // Revoke the object URL when the chosen file changes, or the browser leaks it.
  useEffect(() => {
    if (!screenshot) {
      setScreenshotPreview("");
      return;
    }
    const url = URL.createObjectURL(screenshot);
    setScreenshotPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  // Free courses have no payment step, so Review is step 2 for them.
  const visibleSteps = isFree ? ["Details", "Review"] : STEPS;
  const reviewStep = isFree ? 2 : 3;

  const validate = (s: number): boolean => {
    const e: Errors = {};
    if (s === 1) {
      if (!firstName.trim()) e.firstName = "Please enter your first name.";
      if (!email.trim()) e.email = "Please enter your email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        e.email = "That email address doesn't look right.";
      if (!whatsapp.trim())
        e.whatsapp = "Please enter a WhatsApp number so we can reach you.";
      if (activePlans.length > 0 && !planName)
        e.planName = "Please choose an access plan.";
    }
    if (s === 2 && !isFree) {
      if (!paymentMethod) e.paymentMethod = "Please select how you paid.";
      if (!transactionId.trim())
        e.transactionId = "Please enter the transaction or reference number.";
      if (!screenshot)
        e.screenshot = "Please attach a screenshot of your payment.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep(isFree && step === 1 ? reviewStep : step + 1);
  };
  const prev = () => setStep(isFree && step === reviewStep ? 1 : step - 1);

  const onScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      toast.error("Please choose an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("That image is larger than 5MB. Please choose a smaller one.");
      return;
    }
    setErrors((p) => ({ ...p, screenshot: "" }));
    setScreenshot(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course?._id) {
      toast.error("Please select a course first.");
      return;
    }
    // Re-validate every step, not just the visible one — a student could reach
    // Review and then clear a field by going back.
    if (!validate(1)) {
      setStep(1);
      return;
    }
    if (!isFree && !validate(2)) {
      setStep(2);
      return;
    }

    const action: any = await dispatch(
      submitEnrollment({
        studentId: auth?._id || "",
        firstName,
        lastName,
        email,
        whatsapp,
        courseId: course._id,
        planName,
        invoiceNumber,
        ...(isFree
          ? {}
          : { paymentMethod, transactionId, paymentNote, paymentScreenshot: screenshot }),
      }) as any
    );

    if (submitEnrollment.fulfilled.match(action)) {
      toast.success(
        isFree
          ? "You're enrolled. Enjoy the course!"
          : "Enrollment request submitted."
      );
      navigate(`${route.enrollStatus}?ref=${action.payload.requestId}`);
    } else {
      toast.error((action.payload as string) || "Could not submit your request.");
    }
  };

  const waHref = () => whatsappInquiry(course?.courseTitle);

  const err = (k: string) =>
    errors[k] ? <div className="text-danger mt-1 fs-13">{errors[k]}</div> : null;

  // ---- No course chosen yet: pick one first, rather than erroring (#48.5) ----
  if (!courseId) {
    return (
      <>
        <Breadcrumb title="Enroll" />
        <div className="content">
          <div className="container">
            <div className="text-center mb-4">
              <h4 className="mb-1">Which course would you like to join?</h4>
              <p className="text-muted mb-0">
                Pick a course to start your enrollment.
              </p>
            </div>
            <div className="row row-gap-3">
              {(courses || []).map((c: any) => (
                <div className="col-lg-4 col-md-6" key={c._id}>
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body">
                      <h6 className="mb-1">{c.courseTitle}</h6>
                      {hasPrice(c.price) && (
                        <p className="text-secondary fw-semibold mb-2">
                          {formatPrice(c.price)}
                        </p>
                      )}
                      <Link
                        to={`${route.enroll}?course=${c._id}`}
                        className="btn btn-primary btn-sm w-100"
                      >
                        Enroll in this course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              {!courses?.length && (
                <p className="text-center text-muted">
                  No courses are open for enrollment yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Enroll" />
      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {/* Step indicator */}
              <ul className="form-wizard-steps mb-4" id="enrollSteps">
                {visibleSteps.map((label, i) => {
                  const n = i + 1;
                  const actual = isFree && n === 2 ? reviewStep : n;
                  return (
                    <li
                      key={label}
                      className={
                        step === actual
                          ? "progress-active"
                          : step > actual
                          ? "progress-activated"
                          : ""
                      }
                    >
                      <div className="profile-step">
                        <span className="dot-active mb-2">
                          <span className="number">0{n}</span>
                          <span className="tickmark">
                            <i className="fa-solid fa-check" />
                          </span>
                        </span>
                        <div className="step-section">
                          <p>{label}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Course summary */}
              {course && (
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body d-flex align-items-center gap-3">
                    <div style={{ width: 96, flex: "0 0 auto" }}>
                      <ImageGlobal
                        src={course.courseThumbnailUrl}
                        alt={course.courseTitle}
                        height={64}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{course.courseTitle}</h6>
                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        {course.courseLevel && (
                          <span className="text-muted fs-13">
                            {course.courseLevel}
                          </span>
                        )}
                        {isFree ? (
                          <span className="badge bg-success-transparent text-success">
                            Free Access
                          </span>
                        ) : (
                          hasPrice(course.price) && (
                            <span className="fw-semibold text-secondary">
                              {formatPrice(course.price)}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <a
                      href={waHref()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-success btn-sm text-nowrap"
                    >
                      <i className="isax isax-message-text me-1" />
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {isFree && (
                <div className="alert alert-success">
                  This is a free course — no payment needed. Confirm your details
                  and you'll get access straight away.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* ---------------- STEP 1 ---------------- */}
                {step === 1 && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-3">Your details</h5>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              First Name
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                            />
                            {err("firstName")}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">Last Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              Email<span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            {err("email")}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              WhatsApp Number
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="03XX-XXXXXXX"
                              value={whatsapp}
                              onChange={(e) => setWhatsapp(e.target.value)}
                            />
                            {err("whatsapp")}
                          </div>
                        </div>

                        {activePlans.length > 0 && (
                          <div className="col-12">
                            <label className="form-label">
                              Choose your plan
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <div className="row row-gap-2">
                              {activePlans.map((p: any) => (
                                <div className="col-md-6" key={p.name}>
                                  <button
                                    type="button"
                                    onClick={() => setPlanName(p.name)}
                                    className={`w-100 text-start border rounded p-3 plan-option ${
                                      planName === p.name
                                        ? "border-primary bg-primary-transparent"
                                        : ""
                                    }`}
                                  >
                                    <div className="d-flex justify-content-between align-items-start">
                                      <span className="fw-semibold">
                                        {p.name}
                                      </span>
                                      {hasPrice(p.price) && (
                                        <span className="fw-semibold text-secondary">
                                          {formatPrice(p.price)}
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className="text-muted"
                                      style={{ fontSize: 12.5 }}
                                    >
                                      {p.accessDays
                                        ? `${p.accessDays} days of access`
                                        : "Lifetime access"}
                                      {p.description ? ` · ${p.description}` : ""}
                                    </div>
                                  </button>
                                </div>
                              ))}
                            </div>
                            {err("planName")}
                          </div>
                        )}

                        <div className="col-md-6 mt-3">
                          <div className="input-block mb-0">
                            <label className="form-label">
                              Invoice Number{" "}
                              <small className="text-muted">(if you have one)</small>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={invoiceNumber}
                              onChange={(e) => setInvoiceNumber(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end mt-4">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={next}
                        >
                          Continue
                          <i className="isax isax-arrow-right-3 ms-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- STEP 2 (paid only) ---------------- */}
                {step === 2 && !isFree && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-1">Payment details</h5>
                      <p className="text-muted fs-13">
                        Send the payment first, then share the proof here. Our
                        team verifies it and unlocks your course.
                      </p>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              How did you pay?
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <select
                              className="form-select"
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                              <option value="">Select a method</option>
                              {PAYMENT_METHODS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            {err("paymentMethod")}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-block">
                            <label className="form-label">
                              Transaction / Reference Number
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                            />
                            {err("transactionId")}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="input-block">
                            <label className="form-label">
                              Payment Screenshot
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control"
                              onChange={onScreenshot}
                            />
                            <small className="text-muted">
                              Images up to 5MB. Make sure the amount and
                              reference number are readable.
                            </small>
                            {err("screenshot")}
                            {screenshotPreview && (
                              <div className="mt-2 d-flex align-items-center gap-2">
                                <img
                                  src={screenshotPreview}
                                  alt="Payment screenshot preview"
                                  style={{
                                    height: 110,
                                    borderRadius: 6,
                                    border: "1px solid #dee2e6",
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light"
                                  onClick={() => setScreenshot(null)}
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="input-block mb-0">
                            <label className="form-label">
                              Note{" "}
                              <small className="text-muted">(optional)</small>
                            </label>
                            <textarea
                              className="form-control"
                              rows={2}
                              placeholder="e.g. Paid through JazzCash from my personal account."
                              value={paymentNote}
                              onChange={(e) => setPaymentNote(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={prev}
                        >
                          <i className="isax isax-arrow-left-2 me-1" />
                          Back
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={next}
                        >
                          Continue
                          <i className="isax isax-arrow-right-3 ms-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- REVIEW ---------------- */}
                {step === reviewStep && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-3">Review &amp; submit</h5>

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Your details</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-light"
                          onClick={() => setStep(1)}
                        >
                          Edit
                        </button>
                      </div>
                      <ul className="list-unstyled border rounded p-3 mb-4">
                        <li>
                          <strong>Name:</strong> {firstName} {lastName}
                        </li>
                        <li>
                          <strong>Email:</strong> {email}
                        </li>
                        <li>
                          <strong>WhatsApp:</strong> {whatsapp}
                        </li>
                        <li>
                          <strong>Course:</strong> {course?.courseTitle}
                        </li>
                        {planName && (
                          <li>
                            <strong>Plan:</strong> {planName}
                          </li>
                        )}
                        {invoiceNumber && (
                          <li>
                            <strong>Invoice:</strong> {invoiceNumber}
                          </li>
                        )}
                      </ul>

                      {!isFree && (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Payment</h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-light"
                              onClick={() => setStep(2)}
                            >
                              Edit
                            </button>
                          </div>
                          <ul className="list-unstyled border rounded p-3 mb-4">
                            <li>
                              <strong>Method:</strong> {paymentMethod}
                            </li>
                            <li>
                              <strong>Reference:</strong> {transactionId}
                            </li>
                            <li>
                              <strong>Screenshot:</strong>{" "}
                              {screenshot?.name ?? "—"}
                            </li>
                            {paymentNote && (
                              <li>
                                <strong>Note:</strong> {paymentNote}
                              </li>
                            )}
                          </ul>

                          <div className="alert alert-light border fs-13">
                            Your course unlocks once our team verifies this
                            payment — submitting this form on its own doesn't
                            grant access.
                          </div>
                        </>
                      )}

                      <div className="d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={prev}
                        >
                          <i className="isax isax-arrow-left-2 me-1" />
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={submitting}
                        >
                          {submitting
                            ? "Submitting..."
                            : isFree
                            ? "Get Access"
                            : "Submit Enrollment Request"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Enroll;
