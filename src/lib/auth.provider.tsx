import * as auth from "@/assets/scripts/auth";
import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, redirect, useNavigate } from "react-router";
import { toast } from "sonner";
import type { LoginSchema } from "./login.schema";
import { Toaster } from "@/components/ui/sonner";

type LoginParams =
  | { type: "credentials"; credentials: LoginSchema }
  | { type: "google" };

interface AuthContextType {
  isAuthenticated: boolean;
  login: (val: LoginParams) => Promise<Response | undefined>;
  logout: () => void;
  signUp: (val: LoginSchema) => Promise<Response | undefined>;
  user: User;
}

const authContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({} as User);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      navigate("/dashboard")
    }
  }, [isAuthenticated]);

  useEffect(() => {
    auth.onLoadUser().then((data) => {
      if (Object.keys(data).length) {
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      console.log({ data })
    });
  }, []);

  const signUp = async (credentials: LoginSchema) => {
    const result = await auth.createAccount(credentials);
    if (result) {
      setIsAuthenticated(true);
      return redirect(result);
    }
  };

  const login = async (params: LoginParams) => {
    const { type } = params;
    if (type === "google") {
      const result = await auth.googleLogin();
      if (result) {
        setIsAuthenticated(true);
        return redirect(result);
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
        return redirect(result);
      }
    }
  };

  const logout = async () => {
    const result = await auth.logOut();
    if (result) {
      setIsAuthenticated(false);
      navigate("/");
      return;
    }
  };

  return (
    <authContext.Provider
      value={{ isAuthenticated, login, logout, signUp, user }}
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
