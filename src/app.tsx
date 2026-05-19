import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { base_path } from "./environment.tsx";
import ALLRoutes from "./feature-module/router/router";

const App = () => {
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
