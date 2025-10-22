import { create } from "zustand";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type Role = "admin" | "empleado" | "supervisor";
export interface Profile {
  role: Role;
  displayName: string;
  code: string;
  area?: string;
  createdAt?: number;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  profile: null,
}));

let started = false;
export function ensureAuthListener() {
  if (started) return;
  started = true;

  onAuthStateChanged(auth, async (u) => {
    if (!u) {
      useAuthStore.setState({ user: null, profile: null });
      return;
    }
    try {
      const ref = doc(db, "users", u.uid);
      let snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          role: "empleado",
          displayName: u.email?.split("@")[0] || "Usuario",
          code: "EMP-AUTO",
          createdAt: Date.now(),
        } as Profile);
        snap = await getDoc(ref);
      }
      useAuthStore.setState({ user: u, profile: snap.data() as Profile });
    } catch {
      useAuthStore.setState({ user: u, profile: null });
    }
  });
}
