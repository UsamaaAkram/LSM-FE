import React from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { all_routes } from "../../router/all_routes";

// Client-supplied Terms & Conditions, 10 Sep 2026.
//
// This page previously carried the purchased template's generic text ("Welcome
// to BluverseLMS", "must be at least 18 years old", 6 sections). Every section
// below is the client's own wording, verbatim, in their order.
//
// Two deliberate choices:
//  - Section 11's watermark instruction is a student safety measure, so the
//    exact phrase students should write is emphasised rather than buried.
//  - Section 13 asks for a clickable Contact Us link; it routes internally via
//    all_routes rather than a hardcoded path that would break on a rename.
//    Section 10's Privacy Policy mention is linked for the same reason.

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Introduction",
    body: (
      <>
        Welcome to <strong>Bluverse Digital Hub</strong>. By accessing or using
        our website, LMS, courses, services, or related facilities, you agree to
        comply with these Terms &amp; Conditions. Please read them carefully
        before using our platform.
      </>
    ),
  },
  {
    title: "2. Acceptance of Terms",
    body: (
      <>
        By registering, enrolling in a course, making a payment, or using any
        service provided by Bluverse Digital Hub, you confirm that you have
        read, understood, and agreed to these Terms &amp; Conditions. If you do
        not agree, please do not use our services.
      </>
    ),
  },
  {
    title: "3. Eligibility & Enrollment",
    body: (
      <>
        Users must provide accurate and complete information during registration
        and enrollment. Bluverse Digital Hub reserves the right to verify
        submitted information and reject or cancel an enrollment where
        necessary.
      </>
    ),
  },
  {
    title: "4. Account Responsibility",
    body: (
      <>
        Students are responsible for keeping their login credentials secure and
        must not share their account with others. Any activity carried out
        through a student&apos;s account may be considered the responsibility of
        that student.
      </>
    ),
  },
  {
    title: "5. Course Access & Learning Material",
    body: (
      <>
        Course access, lessons, resources, assignments, and other learning
        materials are provided for the enrolled student only. Copying,
        reselling, redistributing, recording, or sharing our paid course content
        without written permission is strictly prohibited.
      </>
    ),
  },
  {
    title: "6. Payments & Fees",
    body: (
      <>
        Course fees must be paid through the official payment methods provided
        by Bluverse Digital Hub. Students are responsible for ensuring that
        payment information is accurate. Any applicable taxes, transaction
        charges, or third-party fees may be the responsibility of the student.
      </>
    ),
  },
  {
    title: "7. Refunds & Cancellations",
    body: (
      <>
        Refund eligibility, if applicable, will be subject to the refund policy
        of the relevant course or service. Once course access or certain digital
        services have been provided, refunds may not be available.
      </>
    ),
  },
  {
    title: "8. Student Conduct",
    body: (
      <>
        Students are expected to maintain respectful and professional behavior
        toward instructors, staff, and other students. Misuse of the platform,
        harassment, fraud, unauthorized access, or disruptive behavior may
        result in suspension or termination of access.
      </>
    ),
  },
  {
    title: "9. Intellectual Property",
    body: (
      <>
        All course materials, videos, documents, graphics, branding, logos,
        website content, and other resources provided by Bluverse Digital Hub
        are protected by applicable intellectual-property rights. They may not
        be reproduced, modified, distributed, or commercially used without
        authorization.
      </>
    ),
  },
  {
    title: "10. Privacy & Personal Information",
    body: (
      <>
        Bluverse Digital Hub may collect information necessary for registration,
        enrollment, verification, payments, communication, and academic records.
        Personal information will be handled in accordance with our{" "}
        <Link to={all_routes.privacyPolicy}>Privacy Policy</Link> and accessed
        only for legitimate business or administrative purposes.
      </>
    ),
  },
  {
    title: "11. ID Card / CNIC Verification",
    body: (
      <>
        An ID Card/CNIC may be requested solely for{" "}
        <strong>identity verification and enrollment purposes</strong>. For your
        security, you may add a watermark stating{" "}
        <strong>&ldquo;For Bluverse Digital Hub Enrollment Only&rdquo;</strong>{" "}
        before submitting it. Please do not alter or obscure information required
        for verification.
      </>
    ),
  },
  {
    title: "12. Changes to Terms",
    body: (
      <>
        Bluverse Digital Hub may update these Terms &amp; Conditions from time
        to time. Any significant changes may be communicated through the
        website, LMS, or other official communication channels. Continued use of
        our services after an update constitutes acceptance of the revised
        Terms.
      </>
    ),
  },
  {
    title: "13. Contact & Support",
    body: (
      <>
        For questions regarding these Terms &amp; Conditions, enrollment,
        courses, payments, or other services, please{" "}
        <Link to={all_routes.contactUs}>
          contact Bluverse Digital Hub through our official communication
          channels
        </Link>
        .
      </>
    ),
  },
];

const TermsCondition = () => {
  return (
    <>
      <Breadcrumb title="Terms and Conditions" />

      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 mx-auto">
              {SECTIONS.map((s, i) => (
                <div
                  key={s.title}
                  className={i === SECTIONS.length - 1 ? "mb-0" : "mb-4"}
                >
                  <h5 className="mb-3">{s.title}</h5>
                  <p className="mb-0">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsCondition;
