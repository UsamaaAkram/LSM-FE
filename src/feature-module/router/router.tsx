import React from "react";
import { Route, Routes } from "react-router";
import { authRoutes, protectedRoutes, publicRoutes } from "./router.link";
import Feature from "../feature";
import AuthFeature from "../authFeature";
import ProtectedRoutes from "../privateRoute";
import StudentRoute from "../studentRoute";
import InstructorAdminRoute from "../instructorAdminRoute";
import Error404 from "../auth/error/error-404/error400";
import { all_routes as routes } from "./all_routes";

const ALLRoutes: React.FC = () => {
  // Which protected routes belong to students. Anything NOT listed here is
  // treated as instructor/admin-only, so a missing entry silently locks
  // students out of their own page.
  //
  // Derived from all_routes rather than hardcoded path strings: the literal
  // list drifted every time a route was added or a path renamed. Referencing
  // the constants means renaming a path can never desync the two again.
  const studentProtectedPaths = [
    routes.studentDashboard,
    routes.studentProfile,
    routes.studentOrderHistory,
    routes.studentMyProducts,
    routes.studentMessage,
    routes.studentCourses,
    routes.studentCourseResume,
    routes.studentCertificates,
    routes.studentReviews,
    routes.studentWishlist,
    routes.studentQuiz,
    routes.studentQuizQuestion,
    routes.studentReferral,
    routes.studentTickets,
    routes.studentSettings,
    routes.studentChangePassword,
    routes.studentSocialProfile,
    routes.studentLinkedAccounts,
    routes.studentNotification,
    routes.studentBillingAddress,
    routes.studentApprovalScreen,
    routes.myEnrollments,
    routes.courseWatch,
  ];
  return (
    <>
      <Routes>
        <Route element={<Feature />}>
          {publicRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>

        <Route element={<ProtectedRoutes />}>
          {/* Instructor/admin group — students are blocked (sent to main page)
              even via manual URL manipulation. */}
          <Route element={<InstructorAdminRoute />}>
            {protectedRoutes
              .filter((route) => !studentProtectedPaths.includes(route.path)) // All except student
              .map((route, idx) => (
                <Route path={route.path} element={route.element} key={idx} />
              ))}
          </Route>

          <Route element={<StudentRoute />}>
            {protectedRoutes
              .filter((route) => studentProtectedPaths.includes(route.path))
              .map((route, idx) => (
                <Route
                  path={route.path}
                  element={route.element}
                  key={"student-" + idx}
                />
              ))}
          </Route>
        </Route>

        <Route element={<AuthFeature />}>
          {authRoutes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
        {/* 404 Not Found - catch all unmatched routes */}
        <Route path="*" element={<Error404 />} />
      </Routes>
    </>
  );
};

export default ALLRoutes;
