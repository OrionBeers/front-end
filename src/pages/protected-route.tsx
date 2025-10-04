import { useAuth } from "@/lib/auth.provider";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    navigate("/")
  }
  return <>{children}</>;
};

export default ProtectedRoute;
