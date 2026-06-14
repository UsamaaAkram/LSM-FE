import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";

const Footer = () => {
  return (
    <footer className="footer footer-one">
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
