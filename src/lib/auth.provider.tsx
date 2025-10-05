import * as auth from "@/assets/scripts/auth";
import { Toaster } from "@/components/ui/sonner";
import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { Outlet, redirect, useNavigate } from "react-router";
import { toast } from "sonner";
import type { SignUpSchema } from "./ signup.schema";

type LoginParams =
  | { type: "credentials"; credentials: SignUpSchema }
  | { type: "google" };

interface AuthContextType {
  isAuthenticated: boolean;
  login: (val: LoginParams) => Promise<Response | undefined>;
  logout: () => void;
  signUp: (val: SignUpSchema) => Promise<Response | undefined>;
  user: User;
  setIsAuthenticated: (val: boolean) => void;
}

const authContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState({} as User);
  const navigate = useNavigate();

  useEffect(() => {
    auth.onLoadUser().then((data) => {
      if (!data) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        setUser(data);
        navigate('/dashboard')
      }
    });
  }, []);

  const signUp = async (credentials: SignUpSchema) => {
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
