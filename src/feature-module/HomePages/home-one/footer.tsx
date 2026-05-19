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
                  <span className="text-dark">BluverseLMS</span>. All right
                  reserved.
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
                <Link to="#">
                  <i className="fa-brands fa-facebook-f" />
                </Link>
                <Link to="#">
                  <i className="fa-brands fa-instagram" />
                </Link>
                <Link to="#">
                  <i className="fa-brands fa-x-twitter" />
                </Link>
                <Link to="#">
                  <i className="fa-brands fa-youtube" />
                </Link>
                <Link to="#">
                  <i className="fa-brands fa-linkedin" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
