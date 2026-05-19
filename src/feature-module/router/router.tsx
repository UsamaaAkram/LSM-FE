import React from "react";
import { Route, Routes } from "react-router";
import { authRoutes, protectedRoutes, publicRoutes } from "./router.link";
import Feature from "../feature";
import AuthFeature from "../authFeature";
import ProtectedRoutes from "../privateRoute";
import StudentRoute from "../studentRoute";
import Error404 from "../auth/error/error-404/error400";

const ALLRoutes: React.FC = () => {
  const studentProtectedPaths = [
    "/student/student-dashboard",
    "/student/student-profile",
    "/student/student-order-history",
    "/student/student-messages",
    "/student/student-courses",
    "/student/student-course-resume",
    "/student/student-certificates",
    "/student/student-reviews",
    "/student/student-wishlist",
    "/student/student-quiz",
    "/student/student-quiz-questions",
    "/student/student-referral",
    "/student/student-tickets",
    "/student/student-settings",
    "/student/student-change-password",
    "/student/student-social-profile",
    "/student/student-linked-accounts",
    "/student/student-notifications",
    "/student/student-billing-address",
    "/student/approval-screen",
    "/course/course-watch",
    // ...add all student routes here!
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
          {protectedRoutes
            .filter((route) => !studentProtectedPaths.includes(route.path)) // All except student
            .map((route, idx) => (
              <Route path={route.path} element={route.element} key={idx} />
            ))}

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
