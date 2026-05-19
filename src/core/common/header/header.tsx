import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { all_routes } from "../../../feature-module/router/all_routes";
import { logout } from "../../redux/authSlice"; // Correct path for your new slice!
// import { setDataTheme } from "../../redux/themeSettingSlice";
import ImageWithBasePath from "../imageWithBasePath";
import ImageGlobal from "../ImageGlobal/ImageGlobal";
// If you want to call a logout endpoint, import axios and call your API in handleLogout

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const dataTheme = useSelector((state: any) => state.themeSetting.dataTheme);
  const user = useSelector((state: any) => state.auth.user);

  // const handleDataThemeChange = (theme: string) => {
  //   dispatch(setDataTheme(theme));
  // };

  // Logout handler for backend auth
  const handleLogout = async () => {
    dispatch(logout());
    navigate(all_routes.homeone);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("class", dataTheme);
  }, [dataTheme]);

  const onhandleCloseMenu = () => {
    document.getElementsByTagName("html")[0].classList.remove("menu-opened");
  };

  // const DarkButton = () => (
  //   <div
  //     className={`icon-btn  ${location.pathname === "/index" ? "" : "me-2"}`}
  //   >
  //     <Link
  //       to="#"
  //       id="dark-mode-toggle"
  //       className={`theme-toggle ${dataTheme === "light" && "activate"}`}
  //       onClick={() => handleDataThemeChange("dark-mode")}
  //     >
  //       <i className="isax isax-sun-15" />
  //     </Link>
  //     <Link
  //       to="#"
  //       id="light-mode-toggle"
  //       className={`theme-toggle ${dataTheme === "dark-mode" && "activate"}`}
  //       onClick={() => handleDataThemeChange("light")}
  //     >
  //       <i className="isax isax-moon" />
  //     </Link>
  //   </div>
  // );

  const guestButtons = (
    <div className="header-btn d-flex align-items-center gap-2">
      <Link
        to={all_routes.login}
        className="btn btn-secondary d-flex align-items-center me-2"
      >
        <i className="isax isax-lock-circle me-2" />
        Sign In
      </Link>
    </div>
  );

  const userButtons = (
    <div className="header-btn d-flex align-items-center gap-3">
      <div className="dropdown profile-dropdown">
        <Link
          to="#"
          className="d-flex align-items-center"
          data-bs-toggle="dropdown"
        >
          <span className="avatar">
            <ImageGlobal
              src={
                user?.role === "instructor" || user?.role === "admin"
                  ? `${user.photo}?id=${new Date().getTime()}`
                  : user?.role === "student"
                  ? `${user.student.photo}?id=${new Date().getTime()}`
                  : ""
              }
              alt="img"
              className="img-fluid rounded-circle"
            />
          </span>
        </Link>
        <div className="dropdown-menu dropdown-menu-end">
          <div className="profile-header d-flex align-items-center">
            <div className="avatar">
              <ImageGlobal
                src={
                  user?.role === "instructor" || user?.role === "admin"
                    ? `${user.photo}?id=${new Date().getTime()}`
                    : user?.role === "student"
                    ? `${user.student.photo}?id=${new Date().getTime()}`
                    : ""
                }
                alt="img"
                className="img-fluid rounded-circle"
              />
            </div>
            <div>
              <h6>
                {user?.role === "instructor" || user?.role === "admin"
                  ? user?.userName ?? user?.name
                  : user?.role === "student"
                  ? user?.student.userName ?? "Student"
                  : "User"}
              </h6>
              <p>
                {user?.role === "instructor" || user?.role === "admin"
                  ? user?.email
                  : user?.role === "student"
                  ? user?.student.email ?? ""
                  : ""}
              </p>
            </div>
          </div>
          {user?.isDisable === true ? (
            <Link to={all_routes.approvalScreen}>
              <div className="text-center mt-2">
                <span className="badge bg-warning text-white">
                  Account Pending Approval
                </span>
              </div>
            </Link>
          ) : (
            <ul className="profile-body">
              <li>
                <Link
                  className="dropdown-item d-inline-flex align-items-center rounded fw-medium"
                  to={
                    user?.role === "instructor" || user?.role === "admin"
                      ? all_routes.instructorDashboard
                      : all_routes.studentDashboard
                  }
                >
                  <i className="isax isax-grid-35 me-2" />
                  Dashboard
                </Link>
              </li>
              {/* <li>
                <Link
                  className="dropdown-item d-inline-flex align-items-center rounded fw-medium"
                  to={
                    user?.role === "instructor" || user?.role === "admin"
                      ? all_routes.instructorProfile
                      : all_routes.studentProfile
                  }
                >
                  <i className="isax isax-security-user me-2" />
                  My Profile
                </Link>
              </li> */}
              {/* <li>
                <Link
                  className="dropdown-item d-inline-flex align-items-center rounded fw-medium"
                  to={
                    user?.role === "instructor" || user?.role === "admin"
                      ? all_routes.instructorCourse
                      : all_routes.studentCourses
                  }
                >
                  <i className="isax isax-teacher me-2" />
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  className="dropdown-item d-inline-flex align-items-center rounded fw-medium"
                  to={
                    user?.role === "instructor" || user?.role === "admin"
                      ? all_routes.instructorMessage
                      : all_routes.studentMessage
                  }
                >
                  <i className="isax isax-messages-3 me-2" />
                  Messages<span className="message-count">2</span>
                </Link>
              </li> */}
            </ul>
          )}
          <div className="profile-footer">
            <Link
              to={all_routes.homeone}
              className="btn btn-secondary d-inline-flex align-items-center justify-content-center w-100"
              onClick={handleLogout}
            >
              <i className="isax isax-logout me-2" />
              Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className={`${scrolled ? "fixed" : ""}`}>
        <div className="px-3 px-lg-4">
          <div className="header-nav">
            <div className="navbar-header">
              <Link
                id="mobile_btn"
                to="#"
                onClick={() =>
                  document
                    .getElementsByTagName("html")[0]
                    .classList.add("menu-opened")
                }
              >
                <span className="bar-icon">
                  <i className="isax isax-menu"></i>
                </span>
              </Link>
              <div className="navbar-logo">
                <Link
                  className="logo-white header-logo"
                  to={all_routes.homeone}
                >
                  <ImageWithBasePath
                    src="assets/img/blu_light.PNG"
                    className="logo"
                    alt="Logo"
                    style={{ height: "70px", width: "auto" }}
                  />
                </Link>
                <Link className="logo-dark header-logo" to={all_routes.homeone}>
                  <ImageWithBasePath
                    src="assets/img/blu_dark.PNG"
                    className="logo"
                    alt="Logo"
                    style={{ height: "70px", width: "auto" }}
                  />
                </Link>
              </div>
            </div>
            <div className={`main-menu-wrapper`}>
              <div className="menu-header">
                <Link
                  className="logo-white header-logo"
                  to={all_routes.homeone}
                >
                  <ImageWithBasePath
                    src="assets/img/blu_light.PNG"
                    className="logo"
                    alt="Logo"
                    style={{ height: "50px", width: "auto" }}
                  />
                </Link>
                <Link className="logo-dark header-logo" to={all_routes.homeone}>
                  <ImageWithBasePath
                    src="assets/img/blu_dark.PNG"
                    className="logo"
                    alt="Logo"
                    style={{ height: "50px", width: "auto" }}
                  />
                </Link>
                <Link
                  id="menu_close"
                  className="menu-close"
                  to="#"
                  onClick={() => onhandleCloseMenu()}
                >
                  <i className="fas fa-times" />
                </Link>
              </div>
              <ul className={`main-nav`}>
                <li
                  className={`has-submenu ${
                    location.pathname === all_routes.homeone ? "active" : ""
                  }`}
                >
                  <Link to={all_routes.homeone}>Home</Link>
                </li>
                
                <li
                  className={`has-submenu ${
                    location.pathname === all_routes.about_us ? "active" : ""
                  }`}
                >
                  <Link to={all_routes.about_us}>About Us</Link>
                </li>
                <li
                  className={`has-submenu ${
                    location.pathname === all_routes.contactUs ? "active" : ""
                  }`}
                >
                  <Link to={all_routes.contactUs}>Contact Us</Link>
                </li>
                <li
                  className={`has-submenu ${
                    location.pathname === all_routes.privacyPolicy
                      ? "active"
                      : ""
                  }`}
                >
                  <Link to={all_routes.privacyPolicy}>Privacy Policy</Link>
                </li>
              </ul>
            </div>
            {user ? userButtons : guestButtons}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
