import { FC, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../useAuth/api/AuthContext";

export const ProtectedRoute: FC<{ children: JSX.Element }> = ({ children }) => {
  const { token, status } = useAuth();

  useEffect(() => {}, [token, status]);

  if (status == "1") {
    return <Navigate to="/login/change-password" replace />;
  } else if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
