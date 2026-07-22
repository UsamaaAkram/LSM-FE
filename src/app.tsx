import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import { base_path } from "./environment.tsx";
import { store } from "./core/redux/store";
import { logout } from "./core/redux/authSlice";
import ALLRoutes from "./feature-module/router/router";

const App = () => {
  useEffect(() => {
    // Initialise scroll/card animations used across the site via data-aos.
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    // Refresh so freshly-mounted routes/cards animate on navigation.
    AOS.refresh();
  }, []);

  // Global auth-expiry guard: if any API call comes back 401 because the JWT
  // is missing/expired, clear the persisted session and send the user to
  // /login instead of leaving them "logged in" but stuck on a dead error
  // (e.g. the "Invalid or expired token" seen on the video player).
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.error;
        const isAuthExpiry =
          status === 401 &&
          (msg === "Invalid or expired token" ||
            msg === "No token, authorization denied");
        if (isAuthExpiry) {
          store.dispatch(logout());
          const onLogin = window.location.pathname
            .toLowerCase()
            .includes("/login");
          if (!onLogin) {
            window.location.assign(`${base_path}login`.replace(/\/\/+/g, "/"));
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  return (
    <BrowserRouter basename={base_path}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        // closeOnClick
        // rtl={false}
        // pauseOnFocusLoss
        // draggable
        // pauseOnHover
        theme="light"
      />
      <ALLRoutes />
    </BrowserRouter>
  );
};

export default App;
