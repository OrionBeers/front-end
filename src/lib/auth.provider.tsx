import * as auth from "@/assets/scripts/auth";
import { Toaster } from "@/components/ui/sonner";
import type { UserAuthResponse } from "@/types/user";
import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { toast } from "sonner";
import type { SignUpSchema } from "./ signup.schema";
import type { LoginSchema } from "./login.schema";

type LoginParams =
  | { type: "credentials"; credentials: LoginSchema }
  | { type: "google" };

interface AuthContextType {
  isAuthenticated: boolean;
  login: (val: LoginParams) => void;
  logout: () => void;
  signUp: (val: SignUpSchema) => void;
  user: UserAuthResponse;
  setIsAuthenticated: (val: boolean) => void;
}

const authContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({} as UserAuthResponse);
  const navigate = useNavigate();

  useEffect(() => {
    auth.onLoadUser().then((data) => {
        if (!data) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
          setUser(data as UserAuthResponse);
          navigate("/dashboard");
        }
      });
  })

  useEffect(() => {
    if (isAuthenticated) {
      auth.onLoadUser().then((data) => {
        if (!data) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
          setUser(data as UserAuthResponse);
          navigate("/dashboard");
        }
      });
    }
  }, [isAuthenticated]);

  const signUp = async (credentials: SignUpSchema) => {
    const result = await auth.createAccount(credentials);
    if (result) {
      setIsAuthenticated(true);
      navigate("/dashboard");
      return;
    }
  };

  const login = async (params: LoginParams) => {
    const { type } = params;
    if (type === "google") {
      const result = await auth.googleLogin();
      if (result) {
        setIsAuthenticated(true);
        navigate("/dashboard");
        return;
      }
    }
    if (type === "credentials") {
      const { credentials } = params;
      if (!credentials) {
        toast.error("Credentials are required");
        return;
      }

      const result = await auth.passwordLogin(credentials);
      if (result) {
        setIsAuthenticated(true);
        navigate("/dashboard");
        return;
      }
    }
  };

  const logout = async () => {
    const result = await auth.logOut();
    if (result) {
      setIsAuthenticated(false);

      return;
    }
  };

  return (
    <authContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        signUp,
        user,
        setIsAuthenticated,
      }}
    >
      <Outlet />
      <Toaster />
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
