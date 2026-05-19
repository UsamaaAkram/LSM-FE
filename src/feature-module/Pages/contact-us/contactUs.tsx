import { useState } from "react";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error on type
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!form.message.trim()) {
      newErrors.message = "Message is required";
    } else if (form.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Build mailto link
    const to = "bluversedigitalhub@gmail.com";
    const subject = encodeURIComponent(form.subject);
    const body = encodeURIComponent(
      `Name: ${form.name}\n` +
        `Email: ${form.email}\n` +
        `Phone: ${form.phone || "N/A"}\n\n` +
        `Message:\n${form.message}`,
    );

    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    toast.success("Redirecting to your email client...");

    // Reset form
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setErrors({});
  };

  return (
    <>
      <Breadcrumb title="Contact Us" />

      <section className="contact-sec">
        <div className="container">
          {/* ═══════ Info Cards ═══════ */}
          <div className="contact-info">
            <div className="row row-gap-3">
              {/* Email */}
              <div className="col-lg-4 col-md-6">
                <div className="card card-body border p-sm-4">
                  <div className="d-flex align-items-center">
                    <div className="contact-icon">
                      <span className="bg-primary fs-24 rounded-3 d-flex justify-content-center align-items-center">
                        <i className="isax isax-message5 text-white" />
                      </span>
                    </div>
                    <div className="ps-3">
                      <h5 className="mb-1">Email Support</h5>
                      <p className="mb-0">
                        <Link
                          to="mailto:bluversedigitalhub@gmail.com"
                          className="text-gray-5 text-primary-hover text-decoration-underline mb-0"
                        >
                          bluversedigitalhub@gmail.com
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="col-lg-4 col-md-6">
                <div className="card card-body border p-sm-4">
                  <div className="d-flex align-items-center">
                    <div className="contact-icon">
                      <span
                        className="fs-24 rounded-3 d-flex justify-content-center align-items-center"
                        style={{ background: "#25D366" }}
                      >
                        <i className="fa-brands fa-whatsapp text-white" />
                      </span>
                    </div>
                    <div className="ps-3">
                      <h5 className="mb-1">WhatsApp</h5>
                      <p className="mb-0">
                        <a
                          href="https://wa.me/message/WBFSRFPHA72OI1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-5 text-primary-hover text-decoration-underline mb-0"
                        >
                          +92 313 4339915
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="col-lg-4 col-md-6">
                <div className="card card-body border p-sm-4">
                  <div className="d-flex align-items-center">
                    <div className="contact-icon">
                      <span className="bg-primary fs-24 rounded-3 d-flex justify-content-center align-items-center">
                        <i className="isax isax-global5 text-white" />
                      </span>
                    </div>
                    <div className="ps-3">
                      <h5 className="mb-1">Follow Us</h5>
                      <div className="d-flex gap-3 mt-1">
                        <a
                          href="https://www.instagram.com/bluversedigitalhub"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Instagram"
                          style={{ fontSize: 20 }}
                        >
                          <i
                            className="fa-brands fa-instagram"
                            style={{ color: "#E4405F" }}
                          />
                        </a>
                        <a
                          href="https://www.tiktok.com/@bluversedigitalhub"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="TikTok"
                          style={{ fontSize: 20 }}
                        >
                          <i
                            className="fa-brands fa-tiktok"
                            style={{ color: "#000000" }}
                          />
                        </a>
                        <a
                          href="https://www.facebook.com/bluversedigitalhub"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Facebook"
                          style={{ fontSize: 20 }}
                        >
                          <i
                            className="fa-brands fa-facebook"
                            style={{ color: "#1877F2" }}
                          />
                        </a>
                        <a
                          href="https://www.youtube.com/@bluversedigitalhubofficial"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="YouTube"
                          style={{ fontSize: 20 }}
                        >
                          <i
                            className="fa-brands fa-youtube"
                            style={{ color: "#FF0000" }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ Contact Form Section ═══════ */}
          <div className="bg-light border rounded-4 p-4 p-sm-5 p-md-6">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="contact-details">
                  <div className="section-header">
                    <span className="section-badge">Contact Us</span>
                    <h2>Get in Touch With Us</h2>
                    <p>
                      We're here to help you with enrollment, technical support,
                      or general inquiries. Fill out the form and we'll get back
                      to you as soon as possible.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="card mb-0">
                  <div className="card-body p-4 p-sm-5 p-md-6">
                    <h4 className="mb-3">Send Us a Message</h4>
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="row">
                        {/* Name */}
                        <div className="col-sm-6">
                          <div className="mb-4">
                            <label className="form-label">
                              Name <span className="ms-1 text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              className={`form-control form-control-lg ${
                                errors.name ? "is-invalid" : ""
                              }`}
                              placeholder="Your full name"
                            />
                            {errors.name && (
                              <div className="invalid-feedback">
                                {errors.name}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Email */}
                        <div className="col-sm-6">
                          <div className="mb-4">
                            <label className="form-label">
                              Email Address{" "}
                              <span className="ms-1 text-danger">*</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className={`form-control form-control-lg ${
                                errors.email ? "is-invalid" : ""
                              }`}
                              placeholder="you@example.com"
                            />
                            {errors.email && (
                              <div className="invalid-feedback">
                                {errors.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        {/* Phone */}
                        <div className="col-sm-6">
                          <div className="mb-4">
                            <label className="form-label">Phone Number</label>
                            <input
                              type="text"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              className={`form-control form-control-lg ${
                                errors.phone ? "is-invalid" : ""
                              }`}
                              placeholder="e.g. 03001234567"
                            />
                            {errors.phone && (
                              <div className="invalid-feedback">
                                {errors.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Subject */}
                        <div className="col-sm-6">
                          <div className="mb-4">
                            <label className="form-label">
                              Subject{" "}
                              <span className="ms-1 text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              name="subject"
                              value={form.subject}
                              onChange={handleChange}
                              className={`form-control form-control-lg ${
                                errors.subject ? "is-invalid" : ""
                              }`}
                              placeholder="e.g. Enrollment Query"
                            />
                            {errors.subject && (
                              <div className="invalid-feedback">
                                {errors.subject}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Message */}
                      <div className="mb-4">
                        <label className="form-label">
                          Your Message{" "}
                          <span className="ms-1 text-danger">*</span>
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          className={`form-control form-control-lg ${
                            errors.message ? "is-invalid" : ""
                          }`}
                          rows={4}
                          placeholder="Write your message here..."
                        />
                        {errors.message && (
                          <div className="invalid-feedback">
                            {errors.message}
                          </div>
                        )}
                      </div>
                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-secondary btn-lg"
                        >
                          <i className="isax isax-send-2 me-1" />
                          Send Enquiry
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ Map ═══════ */}
          <div className="contact-map rounded-4 overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d71.7185!3d29.7867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sDunyapur%2C%20Pakistan!5e0!3m2!1sen!2s!4v1738829223631!5m2!1sen!2s"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bluverse Digital Hub Location"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactUs;
