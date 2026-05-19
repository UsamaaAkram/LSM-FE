import Breadcrumb from "../../../core/common/Breadcrumb/breadcrumb";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <>
      <Breadcrumb title="Privacy Policy" />

      <div className="content">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 mx-auto">
              <h4 className="mb-3">Privacy Policy – Bluverse Digital Hub</h4>
              <p className="mb-4">
                Bluverse Digital Hub values your privacy and is committed to
                protecting your personal information. This policy explains how
                we collect, use, and protect your data when you use our LMS,
                website, or services.
              </p>

              {/* 1. Information We Collect */}
              <div className="mb-4">
                <h6 className="mb-2">1. Information We Collect</h6>
                <p className="mb-2">
                  We may collect the following information:
                </p>
                <ul className="mb-0">
                  <li>Name, email, and phone number</li>
                  <li>Account login details</li>
                  <li>Payment information (for purchases)</li>
                  <li>Course activity (progress and access history)</li>
                  <li>
                    Device and browser information (IP address and usage data)
                  </li>
                </ul>
              </div>

              {/* 2. How We Use Your Information */}
              <div className="mb-4">
                <h6 className="mb-2">2. How We Use Your Information</h6>
                <p className="mb-2">We use your information to:</p>
                <ul className="mb-0">
                  <li>Provide access to courses</li>
                  <li>Track your progress and performance</li>
                  <li>Process payments securely</li>
                  <li>Send important updates and support messages</li>
                  <li>Improve our platform and overall user experience</li>
                </ul>
              </div>

              {/* 3. Course Content & Usage */}
              <div className="mb-4">
                <h6 className="mb-2">3. Course Content &amp; Usage</h6>
                <p className="mb-0">
                  All content on Bluverse Digital Hub — including videos,
                  modules, templates, assignments, and scripts — is strictly
                  protected under copyright laws. Any form of downloading,
                  recording, copying, sharing, or redistribution is strictly
                  prohibited. Unauthorized use, resale, or distribution will
                  result in immediate account termination and legal action
                  without prior notice.
                </p>
              </div>

              {/* 4. Data Protection */}
              <div className="mb-4">
                <h6 className="mb-2">4. Data Protection</h6>
                <p className="mb-0">
                  We implement standard security measures to keep your data
                  safe. Your personal information is never sold or shared with
                  unauthorized parties.
                </p>
              </div>

              {/* 5. Third-Party Services */}
              <div className="mb-4">
                <h6 className="mb-2">5. Third-Party Services</h6>
                <p className="mb-0">
                  We may use trusted third-party tools — such as payment
                  gateways or analytics services — to operate our platform.
                  These services are only granted access to data that is
                  strictly necessary.
                </p>
              </div>

              {/* 6. Cookies */}
              <div className="mb-4">
                <h6 className="mb-2">6. Cookies</h6>
                <p className="mb-0">
                  We may use cookies to enhance your experience and better
                  understand user behavior. You can disable cookies at any time
                  through your browser settings.
                </p>
              </div>

              {/* 7. Your Rights */}
              <div className="mb-4">
                <h6 className="mb-2">7. Your Rights</h6>
                <p className="mb-2">You have the right to:</p>
                <ul className="mb-0">
                  <li>Request access to your personal data</li>
                  <li>Ask for corrections to your information</li>
                  <li>Request account deletion</li>
                  <li>Unsubscribe from emails at any time</li>
                </ul>
              </div>

              {/* 8. Contact Us */}
              <div className="mb-0">
                <h6 className="mb-2">8. Contact Us</h6>
                <p className="mb-0">
                  For any questions or concerns, please reach out to us:
                  <br />
                  <Link to="mailto:bluversedigitalhub@gmail.com">
                    bluversedigitalhub@gmail.com
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;