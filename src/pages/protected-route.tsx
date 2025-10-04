import type { ReactNode } from "react";
import { useNavigate } from "react-router";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const isAuthenticated = false; // Replace with actual authentication logic

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  return <div>{children}</div>;
};

export default ProtectedRoute;
