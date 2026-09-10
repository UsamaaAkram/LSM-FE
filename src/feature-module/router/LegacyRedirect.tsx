import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// #48 — redirects an old path to its clean equivalent, carrying the query
// string and hash across.
//
// A plain <Navigate to="/courses" /> would DROP "?id=abc123", so an old
// /course/course-details?id=abc123 link would land on the details page with no
// course selected. Preserving search + hash keeps those links working.
const LegacyRedirect: React.FC<{ to: string }> = ({ to }) => {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
};

export default LegacyRedirect;
