import React from "react";
import { useUser } from "../hooks/useUser";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useUser();

  if (loading) {
    return null;
  }

  if (!isLoggedIn) {
    window.location.replace("/");
    return null;
  }

  return children;
};

export default ProtectedRoute;
