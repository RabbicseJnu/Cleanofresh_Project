import React from "react";
import { Navigate } from "react-router-dom";

// role = "Admin" for admin pages
const ProtectedRoute = ({ user, role, children }) => {
  if (!user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    // Logged in but wrong role
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
