import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { all_routes } from "./router/all_routes";

// Role guard for the instructor/admin route group (Plans, Receipts, invoices,
// instructor dashboards, etc.). Students must never reach these pages — even
// by manually editing the URL (e.g. swapping /student/ for /instructor/).
// Unauthorized users are sent to the main page.
const InstructorAdminRoute = () => {
  const user = useSelector((state: any) => state.auth.user);

  if (!user) {
    return <Navigate to={all_routes.login} replace />;
  }
  // Only instructors and admins may access this group.
  if (user.role !== "instructor" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default InstructorAdminRoute;
