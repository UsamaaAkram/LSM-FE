import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import Slider from "react-slick";
import { all_routes } from "../../router/all_routes";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../../core/redux/authSlice";
import { toast } from "react-toastify";

const hasNumber = (value: string): boolean => /[0-9]/.test(value);
const hasMixed = (value: string): boolean =>
  /[a-z]/.test(value) && /[A-Z]/.test(value);
const hasSpecial = (value: string): boolean => /[!#@$%^&*)(+=._-]/.test(value);
const strengthColor = (count: number): string => {
  if (count < 1) return "poor";
  if (count < 2) return "weak";
  if (count < 3) return "strong";
  if (count < 4) return "heavy";
  return "poor";
};

const Register: React.FC = () => {
  const [eye, setEye] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [validationError, setValidationError] = useState<number>(0);
  const [strength, setStrength] = useState<string>("");
  const [eyeConfirmPassword, setEyeConfirmPassword] = useState<boolean>(true);

  const [userName, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<"student" | "instructor">("student"); // default = student
  const dispatch = useDispatch();
  const route = all_routes;
  const navigate = useNavigate();

  const { loading } = useSelector((state: any) => state.auth);

  const strengthIndicator = (value: string): number => {
    let strengths = 0;
    if (value.length >= 8) strengths = 1;
    if (hasNumber(value) && value.length >= 8) strengths = 2;
    if (hasSpecial(value) && value.length >= 8 && hasNumber(value))
      strengths = 3;
    if (
      hasMixed(value) &&
      hasSpecial(value) &&
      value.length >= 8 &&
      hasNumber(value)
    )
      strengths = 3;
    return strengths;
  };

  useEffect(() => {
    if (password) {
      const strengthValue = strengthIndicator(password);
      const color = strengthColor(strengthValue);
      setStrength(color);
    } else {
      setStrength("");
    }
  }, [password]);

  const validatePassword = (value: string) => {
    if (!value) setValidationError(1);
    else if (value.length < 8) setValidationError(2);
    else if (!/[0-9]/.test(value)) setValidationError(3);
    else if (!/[!@#$%^&*()]/.test(value)) setValidationError(4);
    else setValidationError(5);
  };

  useEffect(() => {
    dispatch({ type: "auth/registerUser/rejected", payload: "" });
  }, []);

  const messages = () => {
    switch (validationError) {
      case 2:
        return (
          <span
            id="poor"
            className="active mt-2"
            style={{ fontSize: 14, color: "#DC3545", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/angry.svg"
              className="me-2"
              alt=""
            />
            Weak. Must contain at least 8 characters
          </span>
        );
      case 3:
        return (
          <span
            id="weak"
            className="active mt-2"
            style={{ fontSize: 14, color: "#FFC107", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/anguish.svg"
              className="me-2"
              alt=""
            />
            Average. Must contain at least 1 letter or number
          </span>
        );
      case 4:
        return (
          <span
            id="strong"
            className="active mt-2"
            style={{ fontSize: 14, color: "#0D6EFD", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/smile.svg"
              className="me-2"
              alt=""
            />
            Almost. Must contain special symbol
          </span>
        );
      case 5:
        return (
          <span
            id="heavy"
            className="active mt-2"
            style={{ fontSize: 14, color: "#4BB543", marginTop: "8px" }}
          >
            <ImageWithBasePath
              src="assets/img/icon/smile.svg"
              className="me-2"
              alt=""
            />
            Awesome! You have a secure password.
          </span>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!userName || !email || !password || !confirmPassword) {
      toast.error("All fields are required.");
      return dispatch({
        type: "auth/registerUser/rejected",
        payload: "All fields are required.",
      });
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return dispatch({
        type: "auth/registerUser/rejected",
        payload: "Passwords do not match.",
      });
    }
    if (validationError < 5) {
      toast.error("Please provide a valid/secure password.");
      return dispatch({
        type: "auth/registerUser/rejected",
        payload: "Please provide a valid/secure password.",
      });
    }

    const res = await dispatch(
      registerUser({ email, password, userName, role }) as any
    );
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Registration successful! Please log in.");
      navigate(route.login); // Redirect after successful registration
    } else if (res.meta.requestStatus === "rejected") {
      toast.error(
        res.payload?.message || "Registration failed. Please try again."
      );
    }
  };
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const loginSlider = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
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
                      src="assets/img/blu_light.PNG"
                      className="logo"
                      alt="Logo"
                      style={{ height: "270px", width: "auto" }}
                    />
                  </div>
                  <div className="text-center px-2">
                    <h3 className="mb-2">
                      Welcome to <br />
                      Bluverse <span className="text-secondary">LMS</span>{" "}
                      Courses.
                    </h3>
                    <p>
                      Platform designed to help organizations, educators, and
                      learners manage, deliver, and track learning and training
                      activities.
                    </p>
                  </div>
                </div>
              </div>
            </Slider>
          </div>
          {/* /Login Banner */}
          <div className="col-md-6 login-wrap-bg">
            {/* Register Form */}
            <div className="login-wrapper">
              <div className="loginbox">
                <div className="w-100">
                  <div className="d-flex align-items-center justify-content-end login-header">
                    <Link to={route.homeone} className="link-1">
                      Back to Home
                    </Link>
                  </div>
                  <h1 className="fs-32 fw-bold topic">Sign up</h1>
                  <form onSubmit={handleSubmit} className="mb-3 pb-3">
                    <div className="mb-3 position-relative">
                      <label className="form-label">
                        User Name<span className="text-danger ms-1">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="form-control form-control-lg"
                          required
                        />
                        <span>
                          <i className="isax isax-user input-icon text-gray-7 fs-14" />
                        </span>
                      </div>
                    </div>
                    <div className="mb-3 position-relative">
                      <label className="form-label">
                        Email<span className="text-danger ms-1">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-control form-control-lg"
                          required
                        />
                        <span>
                          <i className="isax isax-sms input-icon text-gray-7 fs-14" />
                        </span>
                      </div>
                    </div>
                    {/* Role radio buttons */}
                    <div className="mb-3">
                      <label className="form-label mb-2 fw-semibold">
                        Sign up as
                      </label>
                      <div className="d-flex gap-3">
                        <label className="form-check-label d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="role"
                            value="student"
                            checked={role === "student"}
                            onChange={() => setRole("student")}
                          />
                          Student
                        </label>
                        <label className="form-check-label d-flex align-items-center gap-2">
                          <input
                            type="radio"
                            className="form-check-input"
                            name="role"
                            value="instructor"
                            checked={role === "instructor"}
                            onChange={() => setRole("instructor")}
                          />
                          Instructor
                        </label>
                      </div>
                    </div>
                    <div className="mb-3 position-relative">
                      <label className="form-label">
                        New Password <span className="text-danger"> *</span>
                      </label>
                      <div className="position-relative" id="passwordInput">
                        <input
                          className="form-control pass-input"
                          type={eye ? "password" : "text"}
                          value={password}
                          onChange={handlePasswordChange}
                          required
                        />
                        <span
                          onClick={() => setEye((prev) => !prev)}
                          className={`toggle-passwords text-gray-7 fs-14 isax isax-eye-slash ${
                            eye ? "isax-eye-slash" : "isax-eye"
                          }`}
                          style={{
                            cursor: "pointer",
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        />
                      </div>
                      <div
                        id="passwordStrength"
                        style={{ display: "flex" }}
                        className={`password-strength ${
                          strength === "poor"
                            ? "poor-active"
                            : strength === "weak"
                            ? "avg-active"
                            : strength === "strong"
                            ? "strong-active"
                            : strength === "heavy"
                            ? "heavy-active"
                            : ""
                        }`}
                      >
                        <span id="poor" className="active"></span>
                        <span id="weak" className="active"></span>
                        <span id="strong" className="active"></span>
                        <span id="heavy" className="active"></span>
                      </div>
                      <div id="passwordInfo">{messages()}</div>
                    </div>
                    <div className="mb-3 position-relative">
                      <label className="form-label">
                        Confirm Password <span className="text-danger"> *</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={eyeConfirmPassword ? "password" : "text"}
                          className="pass-inputa form-control form-control-lg"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <span
                          className={`isax toggle-passworda ${
                            eyeConfirmPassword ? "isax-eye-slash" : "isax-eye"
                          } text-gray-7 fs-14`}
                          onClick={() => setEyeConfirmPassword((prev) => !prev)}
                          style={{
                            cursor: "pointer",
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        />
                      </div>
                    </div>
                    {/* Error Message */}
                    {/* {error && <div className="text-danger mb-2">{error}</div>} */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="remember-me d-flex align-items-start">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          defaultValue=""
                          id="flexCheckDefault"
                          required
                        />
                        <label
                          className="form-check-label mb-0 d-inline-flex flex-wrap remember-me fs-14"
                          htmlFor="flexCheckDefault"
                        >
                          I agree with{" "}
                          <Link
                            to={route.termsConditions}
                            className="link-2 mx-2"
                          >
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link
                            to={route.privacyPolicy}
                            className="link-2 mx-2"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>
                    <div className="d-grid">
                      <button
                        className="btn btn-secondary btn-lg"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          "Signing up..."
                        ) : (
                          <>
                            Sign Up{" "}
                            <i className="isax isax-arrow-right-3 ms-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                  <div className="d-flex align-items-center justify-content-center or fs-14 mb-3">
                    Or
                  </div>
                  {/* <div className="d-flex align-items-center justify-content-center mb-3">
                    <Link to="#" className="btn btn-light me-2">
                      <ImageWithBasePath src="assets/img/icons/google.svg" alt="img" className="me-2" />
                      Google
                    </Link>
                    <Link to="#" className="btn btn-light">
                      <ImageWithBasePath src="assets/img/icons/facebook.svg" alt="img" className="me-2" />
                      Facebook
                    </Link>
                  </div> */}
                  <div className="fs-14 fw-normal d-flex align-items-center justify-content-center">
                    Already you have an account?
                    <Link to={route.login} className="link-2 ms-1">
                      {" "}
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
