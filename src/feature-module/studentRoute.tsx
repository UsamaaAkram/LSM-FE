import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { AppDispatch } from "../core/redux/store";
import { getStudentById } from "../core/redux/studentSlice";
import TeacherApprovalScreen from "./Instructor/approval-screen/approval-screen";
import { all_routes } from "./router/all_routes";

const StudentRoute: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const user: any = useSelector((state: any) => state.auth.user);
  const studentProfile = useSelector((state: any) => state.student.profile);
  // const isLoadingProfile = useSelector((state: any) => state.student.loading); // ← if you have a loading flag in your slice

  useEffect(() => {
    if (user?.role === "student" && user?._id) {
      dispatch(getStudentById(user._id)); // fetch latest student profile
    }
    // eslint-disable-next-line
  }, [user?._id, location.pathname, user?.role, dispatch]);

  // Not logged in ⇒ login
  if (!user) {
    return <Navigate to={all_routes?.login} state={{ from: location }} replace />;
  }

  // Wait for studentProfile.student to be loaded (avoid premature redirect/render)
  // if (
  //   user.role === "student" &&
  //   (
  //     isLoadingProfile ||
  //     !studentProfile ||
  //     typeof studentProfile !== "object" ||
  //     !studentProfile.student
  //   )
  // ) {
  //   // Show spinner until we've loaded the latest student profile from API
  //   return (
  //     <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
  //       <span className="spinner-border" />
  //     </div>
  //   );
  // }

  // Check if student is disabled ⇒ go to approval screen
  if (
    user?.role === "student" &&
    studentProfile?.student?.isDisable === true
  ) {
    if (location.pathname !== all_routes?.studentApprovalScreen) {
      return <Navigate to={all_routes.studentApprovalScreen} replace />;
    }
    return (
      <div className="main-wrapper">
        <TeacherApprovalScreen />
        <div className="sidebar-overlay"></div>
      </div>
    );
  }

  // If account now enabled but still on approval screen, redirect to dashboard
  if (
    user?.role === "student" &&
    studentProfile?.student?.isDisable === false &&
    location.pathname === all_routes?.studentApprovalScreen
  ) {
    return <Navigate to={all_routes?.studentDashboard} replace />;
  }

  // All good ⇒ show rest of student route
  return <Outlet />;
};

export default StudentRoute;