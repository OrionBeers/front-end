import type { SignUpSchema } from "@/lib/ signup.schema";
import api from "@/lib/api.axios";
import type { LoginSchema } from "@/lib/login.schema";
import type { UserAuthResponse } from "@/types/user";
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

const AUTH_STORAGE_KEY = "orion.user.data";

const addUserToDB = async (user: User) => {
  try {
    const { data } = await api.post("/users", {
      email: user.email,
      uid: user.uid,
      name: user.displayName,
    });
    if (data.status === "created") {
      return getUserFromDB(data.email as string);
    }
    return null;
  } catch (e) {
    toast.error("Something went wrong");
    console.log(e);
  }
};

const getUserFromDB = async (email: string) => {
  try {
    const { data } = await api.get("/users", {
      params: {
        email,
      },
      validateStatus: (status) => {
        return (status >= 200 && status < 300) || status === 404;
      },
    });
    if (data._id) return data as UserAuthResponse;
    return null;
  } catch (e) {
    console.log(e);
  }
};

export const saveUserToLocalStorage = (dbUser: UserAuthResponse) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(dbUser));
};

export const onLoadUser = async () => {
  const storageUser = localStorage.getItem(AUTH_STORAGE_KEY);
  try {
    if (storageUser) {
      const user = JSON.parse(storageUser);
      const dbUser = await getUserFromDB(user.email);
      if (!dbUser) {
        const newUser = await addUserToDB(user);
        saveUserToLocalStorage(newUser!);
        return newUser;
      }
      return dbUser;
    } else {
      const { currentUser } = getAuth();

      if (currentUser) {
        const dbUser = getUserFromDB(currentUser.email as string);
        if (!dbUser) {
          const newDbUser = await addUserToDB(currentUser);
          saveUserToLocalStorage(newDbUser!);
        }
        return currentUser;
      }
    }

    return null;
  } catch (e) {
    console.log(e);
    return null;
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
      const newDbUser = await addUserToDB(user);
      
      saveUserToLocalStorage(newDbUser!);
    } else {
      saveUserToLocalStorage(dbUser);
    }
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
      const newDbUser = await addUserToDB(user);
      
      saveUserToLocalStorage(newDbUser!);
    }else {
      saveUserToLocalStorage(dbUser);
    }
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
    const newDbUser = await addUserToDB({ ...user, displayName: name });
    
    saveUserToLocalStorage(newDbUser!);
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
