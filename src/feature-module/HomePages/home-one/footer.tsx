import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";

const Footer = () => {
  return (
    <footer className="footer footer-one">
      <div className="footer-top py-5">
        <div className="container">
          <div className="row row-gap-4">
            <div className="col-lg-4">
              <Link to={all_routes.homeone} className="d-inline-block mb-3">
                <ImageWithBasePath
                  src="assets/img/newLogo.PNG"
                  alt="Bluverse Digital Hub"
                  style={{ height: 48, width: "auto" }}
                />
              </Link>
              <p className="mb-0">
                Pakistan&rsquo;s leading institute of content creation &amp;
                digital skills — helping creators master modern skills, build
                digital careers, and turn their potential into profit.
              </p>
            </div>
            <div className="col-lg-4 col-md-6">
              <h5 className="mb-3">Quick Links</h5>
              <ul className="list-unstyled footer-quick-links">
                <li className="mb-2">
                  <Link to={all_routes.homeone}>Home</Link>
                </li>
                <li className="mb-2">
                  <Link to={all_routes.courseGrid}>Courses</Link>
                </li>
                <li className="mb-2">
                  <Link to={all_routes.services}>Services</Link>
                </li>
                <li className="mb-2">
                  <Link to={all_routes.about_us}>About Us</Link>
                </li>
                <li className="mb-2">
                  <Link to={all_routes.contactUs}>Contact Us</Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-4 col-md-6">
              <h5 className="mb-3">Contact</h5>
              <ul className="list-unstyled footer-quick-links">
                <li className="mb-2">
                  <a href="mailto:bluversedigitalhub@gmail.com">
                    bluversedigitalhub@gmail.com
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="https://wa.me/message/WBFSRFPHA72OI1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +92 313 4339915
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom bg-secondary py-4">
        <div className="container">
          <div className="row row-gap-2">
            <div className="col-lg-5">
              <div className="text-center text-lg-start">
                <p>
                  Copyright 2025 ©{" "}
                  <span className="text-dark">Bluverse Digital Hub</span>. All
                  rights reserved.
                </p>
              </div>
            </div>
            <div className="col-lg-4">
              <ul className="d-flex align-items-center justify-content-center footer-link">
                <li>
                  <Link to={all_routes.termsConditions}>
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link to={all_routes.privacyPolicy}>Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div className="col-lg-3">
              <div className="social-icon">
                <a
                  href="https://www.facebook.com/share/1GMjUSkUdp/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-facebook-f" />
                </a>
                <a
                  href="https://www.instagram.com/bluversedigitalhub/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-instagram" />
                </a>
                <a
                  href="https://www.tiktok.com/@bluversedigitalhub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-tiktok" />
                </a>
                <a
                  href="https://www.youtube.com/@BluverseDigitalHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-youtube" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
