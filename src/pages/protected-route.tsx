import { useAuth } from "@/lib/auth.provider";
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default ProtectedRoute;
