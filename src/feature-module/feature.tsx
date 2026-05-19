import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import BackToTop from "../core/common/backtotop/backToTop";
import Header from "../core/common/header/header";

const Feature = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <div className="main-wrapper">
        <div
        >
          <Header />
          <Outlet />
          <BackToTop />
        </div>

        <div className="sidebar-overlay"></div>
      </div>
    </>
  );
};

export default Feature;
