import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { loginUser } from "../../../core/redux/authSlice"; // <-- our async thunk
import { all_routes } from "../../router/all_routes";
import { toast } from "react-toastify";

type PasswordField = "password" | "confirmPassword";

const Login = () => {
  const loginSlider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
  };

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const route = all_routes;

  // Redux state
  const { loading } = useSelector((state: any) => state.auth);

  // Populated when login is rejected for hitting the 2-device cap — lets the
  // user pick one of their existing sessions to log out and continue.
  type DeviceSession = {
    id: string;
    device: string;
    browser: string;
    lastActiveTime: string;
  };
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[] | null>(
    null
  );
  const [removingId, setRemovingId] = useState<string | null>(null);

  const goToDashboard = (user: any) => {
    window.location.pathname =
      user?.role === "instructor"
        ? user?.isDisable === true
          ? route.approvalScreen
          : route.instructorDashboard
        : user?.role === "admin"
        ? route.instructorDashboard
        : route.studentDashboard;
  };

  const attemptLogin = async (removeSessionId?: string) => {
    const res = await dispatch(
      loginUser({ email, password, removeSessionId }) as any
    );
    if (res.meta.requestStatus === "fulfilled") {
      setDeviceSessions(null);
      toast.success("Login successful!");
      goToDashboard(res.payload?.user);
      return;
    }
    if (res.meta.requestStatus === "rejected") {
      // Unverified email → send the user to the OTP page to verify
      if (res.payload?.needsVerification) {
        toast.info(
          res.payload?.message || "Please verify your email to continue."
        );
        const verifyEmailAddr = res.payload?.email || email;
        window.location.href = `${route.otp}?email=${encodeURIComponent(
          verifyEmailAddr
        )}`;
        return;
      }
      // Already signed in on 2 devices — show them so the user can free a slot
      if (res.payload?.limitReached) {
        setDeviceSessions(res.payload.sessions || []);
        return;
      }
      setDeviceSessions(null);
      toast.error(
        res.payload?.message || "Login failed. Please check your credentials."
      );
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await attemptLogin();
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error during login.");
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    setRemovingId(sessionId);
    try {
      await attemptLogin(sessionId);
    } catch (error: any) {
      toast.error(error?.message || "Unexpected error during login.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="login-content">
        <div className="row">
          {/* Login Banner */}
          <div className="col-md-6 login-bg d-none d-md-flex">
            <Slider {...loginSlider} className="login-carousel">
              <div>
                <div className="login-carousel-section mb-3">
                  <div className="login-banner">
                    <ImageWithBasePath
                      src="assets/img/newLogo.PNG"
                      className="logo"
                      alt="Logo"
                      style={{ height: "180px", width: "auto" }}
                    />
                  </div>
                  <div className="text-center px-2">
                    <h3 className="mb-2">
                      Welcome To <br />
                      Bluverse <span className="text-secondary">
                        Digital Hub
                      </span>
                    </h3>
                    <p>Learn. Earn. Dominate.</p>
                  </div>
                </div>
              </div>
            </Slider>
          </div>
          {/* /Login Banner */}
          <div className="col-md-6 login-wrap-bg">
            {/* Login */}
            <div className="login-wrapper">
              <div className="loginbox @p-0">
                <div className="w-100">
                  <div className="d-flex align-items-center justify-content-end login-header">
                    <Link to={route.homeone} className="link-1">
                      Back to Home
                    </Link>
                  </div>
                  <h1 className="fs-24 fw-bold topic">
                    Sign into Your Account
                  </h1>
                  <form onSubmit={handleSubmit} className="mb-3 pb-3">
                    <div className="mb-3 position-relative">
                      <label className="form-label">
                        Email<span className="text-danger ms-1">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type="email"
                          className="form-control form-control-lg"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                        <span>
                          <i className="isax isax-sms input-icon text-gray-7 fs-14" />
                        </span>
                      </div>
                    </div>
                    <div className="mb-3 position-relative">
                      <label className="form-label">
                        Password <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="position-relative" id="passwordInput">
                        <input
                          type={
                            passwordVisibility.password ? "text" : "password"
                          }
                          className="form-control form-control-lg pass-input"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <span
                          className={`isax toggle-passwords fs-14 ${
                            passwordVisibility.password
                              ? "isax-eye"
                              : "isax-eye-slash"
                          }`}
                          onClick={() => togglePasswordVisibility("password")}
                          style={{
                            cursor: "pointer",
                            position: "absolute",
                            right: 15,
                            top: "45%",
                          }}
                        />
                      </div>
                    </div>
                    <div className="d-flex align-items-center flex-wrap gap-3 justify-content-between mb-4">
                      <div className="remember-me d-flex align-items-center">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="flexCheckDefault"
                        />
                        <label
                          className="form-check-label ms-2"
                          htmlFor="flexCheckDefault"
                        >
                          Remember Me
                        </label>
                      </div>
                      <div className="">
                        <Link to={route.forgotpassword} className="link-2">
                          Forgot Password ?
                        </Link>
                      </div>
                    </div>
                    {deviceSessions && deviceSessions.length > 0 && (
                      <div className="alert alert-warning mb-3">
                        <p className="mb-2 fw-semibold">
                          You're already signed in on 2 devices. Log out one
                          to continue:
                        </p>
                        {deviceSessions.map((s) => (
                          <div
                            key={s.id}
                            className="d-flex align-items-center justify-content-between mb-2 p-2 bg-white rounded border"
                          >
                            <div>
                              <div className="fw-semibold">
                                {s.device} &middot; {s.browser}
                              </div>
                              <div className="text-muted" style={{ fontSize: 12 }}>
                                Last active{" "}
                                {new Date(s.lastActiveTime).toLocaleString()}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              disabled={loading || removingId === s.id}
                              onClick={() => handleRemoveSession(s.id)}
                            >
                              {removingId === s.id
                                ? "Logging out..."
                                : "Log out & sign in here"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="d-grid">
                      <button
                        className="btn btn-secondary btn-lg"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          "Logging in..."
                        ) : (
                          <>
                            Login <i className="isax isax-arrow-right-3 ms-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  {/* Social login and registration (optional, shown as comment) */}
                  <div className="d-flex align-items-center justify-content-center or fs-14 mb-3 z-10">
                    Or
                  </div>
                  {/* <div className="d-flex align-items-center justify-content-center mb-3">
                    <Link to="#" className="btn btn-light me-2">
                      <ImageWithBasePath
                        src="assets/img/icons/google.svg"
                        alt="img"
                        className="me-2"
                      />
                      Google
                    </Link>
                    <Link to="#" className="btn btn-light">
                      <ImageWithBasePath
                        src="assets/img/icons/facebook.svg"
                        alt="img"
                        className="me-2"
                      />
                      Facebook
                    </Link>
                  </div> */}
                  <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                    Don't you have an account?
                    <Link to={route.register} className="link-2 ms-1">
                      {" "}
                      Sign up
                    </Link>
                  </div>
                  {/* /Login */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
