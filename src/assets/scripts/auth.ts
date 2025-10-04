import type { LoginSchema } from "@/lib/login.schema";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
} from "firebase/auth";
import { toast } from "sonner";
import { auth } from "./firebase";

const AUTH_STORAGE_KEY = "orion.user.data";

export const onLoadUser = async () => {
  const storageUser = localStorage.getItem(AUTH_STORAGE_KEY);
  try {
    if (storageUser) {
      const user = JSON.parse(storageUser);
      return user;
    } else {
      const { currentUser } = getAuth();
      console.log({ currentUser });

      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
        return currentUser;
      }
    }

    return {};
  } catch (e) {
    console.log(e);
    return {};
  }
};

export const googleLogin = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  try {
    const data = await signInWithPopup(auth, provider);
    const user = data.user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    toast.success("Login successful");
    return `/dashboard`;
  } catch (error) {
    console.error(error);
    const user = auth.currentUser;
    user?.delete();
    toast.error("Something went wrong");
  }
};

export const passwordLogin = async ({ email, password }: LoginSchema) => {
  try {
    const data = await signInWithEmailAndPassword(getAuth(), email, password);
    const user = data.user;
    // const response = await fetch(`/api/user?email=${user.email}`);
    // const foundUser = await response.json();
    // if (!foundUser) {
    //   toast.error("Email not registered or credentials invalid");
    //   return;
    // }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    toast.success("Login successful");
    return `/dashboard`;
  } catch (e) {
    console.log(e);
    if (e instanceof Error && e.message.includes("(auth/invalid-credential)")) {
      toast.error("Email or password is wrong");
    } else toast.error("Something went wrong");
  }
};

export const createAccount = async ({ email, password }: LoginSchema) => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      getAuth(),
      email,
      password
    );
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    toast.success("Account created successfully");
    return `/dashboard`;
  } catch (e) {
    console.log(e);
    if (
      e instanceof Error &&
      e.message.includes("(auth/email-already-in-use)")
    ) {
      toast.error("Email already in use");
    } else {
      toast.error("Something went wrong");
      const user = auth.currentUser;
      user?.delete();
    }
  }
};

export const logOut = async () => {
  try {
    await signOut(getAuth());
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return "/";
  } catch (e) {
    console.log(e);
  }
};

export const updateUserPassword = async (
  newPassword: LoginSchema["password"]
) => {
  const auth = getAuth();

  const user = auth.currentUser;

  try {
    if (!user) throw new Error("No user is currently signed in.");
    await updatePassword(user, newPassword);
    return true;
  } catch (error) {
    toast.error("Error updating password", {
      description: (error as { message: string }).message,
    });
    return false;
  }
};
