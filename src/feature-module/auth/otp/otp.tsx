import { Input } from "antd";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { all_routes } from "../../router/all_routes";
import {
  resendVerification,
  verifyEmail,
} from "../../../core/redux/authSlice";
// type OTPProps = GetProps<typeof Input.OTP>;

const Otp = () => {
  const loginSLider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    // autoplay: true, // Uncomment if needed
  };

  const route = all_routes;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const search = new URLSearchParams(useLocation().search);
  const email = search.get("email") || "";

  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      toast.error("Missing email. Please sign up again.");
      return;
    }
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setSubmitting(true);
    const res: any = await dispatch(verifyEmail({ email, otp }) as any);
    setSubmitting(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Email verified! You can now log in.");
      navigate(route.login);
    } else {
      toast.error(res.payload || "Verification failed.");
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Missing email. Please sign up again.");
      return;
    }
    const res: any = await dispatch(resendVerification({ email }) as any);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("A new code has been sent to your email.");
      setSeconds(60);
    } else {
      toast.error(res.payload || "Could not resend code.");
    }
  };

  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [seconds]);

  const formatTime = (time: number) => {
    // Add leading zero for single-digit numbers
    return time < 10 ? `0${time}` : time;
  };

  return (
    <>
      {/* Main Wrapper */}
      <div className="main-wrapper">
        <div className="login-content">
          <div className="row">
            {/* Login Banner */}
            <div className="col-md-6 login-bg d-none d-lg-flex">
              <Slider {...loginSLider} className="login-carousel">
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
                    <div className="mentor-course text-center">
                      <h3 className="mb-2">
                        Welcome To <br />
                        Bluverse{" "}
                        <span className="text-secondary">Digital Hub</span>
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
                <div className="loginbox">
                  <div className="w-100">
                    <div className="d-flex align-items-center justify-content-between login-header">
                      <ImageWithBasePath
                        src="assets/img/newLogo.PNG"
                        className="img-fluid"
                        alt="Logo"
                        style={{ height: "60px", width: "auto" }}
                      />
                      <Link to={route.homeone} className="link-1">
                        Back to Home
                      </Link>
                    </div>
                    <div className="topic">
                      <h1 className="fs-32 fw-bold mb-3">Email OTP</h1>
                      <p className="fs-14 fw-normal mb-0">
                        A 6-digit verification code was sent to
                        {email ? ` ${email}` : " your email address"}
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="mb-3 pb-3">
                      <div className="d-flex align-items-center mb-3">
                        {/* <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        />
                        <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        />
                        <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        />
                        <input
                          type="text"
                          className="form-control otp"
                          maxLength={1}
                        /> */}
                        <Input.OTP
                          length={6}
                          value={otp}
                          onChange={(val) => setOtp(val)}
                        />
                      </div>
                      <div className="timer-cover d-flex align-items-center justify-content-center">
                        <div className="badge badge-soft-danger rounded-pill d-flex align-items-center">
                          <i className="isax isax-clock me-1" />
                          <span id="otp_timer">09:{formatTime(seconds)}</span>{" "}
                          <span className="ms-1">s</span>
                        </div>
                      </div>
                      <div className="d-grid">
                        <button
                          className="btn btn-secondary btn-lg"
                          type="submit"
                          disabled={submitting}
                        >
                          {submitting ? "Verifying..." : "Verify & Proceed"}
                          <i className="isax isax-arrow-right-3 ms-1" />
                        </button>
                      </div>
                    </form>
                    <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                      Didn’t get the OTP?
                      <button
                        type="button"
                        className="btn btn-link link-2 ms-1 p-0"
                        onClick={handleResend}
                      >
                        Resend OTP
                      </button>
                    </div>
                    {/* /Login */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default Otp;
