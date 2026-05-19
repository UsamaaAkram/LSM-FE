import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import BackToTop from "../core/common/backtotop/backToTop";
import Header from "../core/common/header/header";
import { getInstructorById } from "../core/redux/instructor";
import TeacherApprovalScreen from "./Instructor/approval-screen/approval-screen";
import { all_routes } from "./router/all_routes";

const ProtectedRoutes = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const instructorDetails = useSelector((state: any) => state.instructor.profile);

  useEffect(() => {
    if (user?.role === "instructor" && user?._id) {
      dispatch(getInstructorById(user._id) as any);
    }
  }, [user?._id, location.pathname, dispatch, user?.role]);

  if (!user) {
    return <Navigate to={all_routes.login} state={{ from: location }} replace />;
  }

  // Only use instructorDetails.isDisable after API call!
  if (
    user.role === "instructor" &&
    instructorDetails &&
    instructorDetails.isDisable === true
  ) {
    // If not on approval screen already, redirect to approval:
    if (location.pathname !== all_routes.approvalScreen) {
      return <Navigate to={all_routes.approvalScreen} replace />;
    }
    // If already on approval screen, show it:
    return (
      <div className="main-wrapper">
        <Header />
        <TeacherApprovalScreen />
        <div className="sidebar-overlay"></div>
      </div>
    );
  }

  // If account is enabled and user tries to access approval screen, redirect to dashboard
  if (
    user.role === "instructor" &&
    instructorDetails &&
    instructorDetails.isDisable === false &&
    location.pathname === all_routes.approvalScreen
  ) {
    return <Navigate to={all_routes.instructorDashboard} replace />;
  }

  // All other cases, normal routing
  return (
    <div className="main-wrapper">
      <Header />
      <Outlet />
      <BackToTop />
      <div className="sidebar-overlay"></div>
    </div>
  );
};

export default ProtectedRoutes;