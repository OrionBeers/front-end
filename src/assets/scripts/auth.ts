import type { SignUpSchema } from "@/lib/ signup.schema";
import authAxios from "@/lib/auth.axios";
import type { LoginSchema } from "@/lib/login.schema";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  type User,
} from "firebase/auth";
import { toast } from "sonner";
import { auth } from "./firebase";
import type { UserAuthResponse } from "@/types/user";

const AUTH_STORAGE_KEY = "orion.user.data";

const addUserToDB = async (user: User) => {
  try {
    const { data } = await authAxios.post("/users", {
      email: user.email,
      uid: user.uid,
      name: user.displayName,
    });
    if (data._id) {
      return data as UserAuthResponse;
    }
    return null;
  } catch (e) {
    toast.error("Something went wrong");
    console.log(e);
  }
};

const getUserFromDB = async (email: string) => {
  const { data } = await authAxios.get("/users", {
    params: {
      email,
    },
  });
  if (data._id) return data;
  return null;
};

export const onLoadUser = async () => {
  const storageUser = localStorage.getItem(AUTH_STORAGE_KEY);
  try {
    if (storageUser) {
      const user = JSON.parse(storageUser);
      const dbUser = await getUserFromDB(user.email);
      if (!dbUser) {
        await addUserToDB(user);
      }
      return user;
    } else {
      const { currentUser } = getAuth();
      console.log({ currentUser });

      if (currentUser) {
        const dbUser = getUserFromDB(currentUser.email as string);
        if (!dbUser) {
          await addUserToDB(currentUser);
        }
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
    const dbUser = await getUserFromDB(user.email as string);
    if (!dbUser) {
      await addUserToDB(user);
    }
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
    const dbUser = await getUserFromDB(user.email as string);
    if (!dbUser) {
      await addUserToDB(user);
    }
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

export const createAccount = async ({
  email,
  password,
  name,
}: SignUpSchema) => {
  try {
    const { user } = await createUserWithEmailAndPassword(
      getAuth(),
      email,
      password
    );
    await addUserToDB({ ...user, displayName: name });
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
