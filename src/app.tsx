import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { base_path } from "./environment.tsx";
import ALLRoutes from "./feature-module/router/router";

const App = () => {
  useEffect(() => {
    // Initialise scroll/card animations used across the site via data-aos.
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
    // Refresh so freshly-mounted routes/cards animate on navigation.
    AOS.refresh();
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
