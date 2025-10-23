import { create } from "zustand";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc /*, enableIndexedDbPersistence*/ } from "firebase/firestore";

export type Role = "admin" | "empleado";
export interface Profile {
  role: Role;
  displayName: string;
  code: string;
  area?: string;
  createdAt?: number;
  photoURL?: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  ready: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  profile: null,
  ready: false,
}));

// (Opcional): activa caché offline de Firestore para lecturas ultra rápidas
// enableIndexedDbPersistence(db).catch(() => { /* ignore in dev */ });

const cacheKey = (uid: string) => `profile:${uid}`;

let started = false;
export function ensureAuthListener() {
  if (started) return;
  started = true;

  onAuthStateChanged(auth, async (u) => {
    if (!u) {
      useAuthStore.setState({ user: null, profile: null, ready: true });
      return;
    }

    // 1) Pinta inmediato con caché si existe
    let cached: Profile | null = null;
    try {
      const raw = localStorage.getItem(cacheKey(u.uid));
      if (raw) cached = JSON.parse(raw);
    } catch {}

    useAuthStore.setState({
      user: u,
      profile: cached,    // puede ser null si no hay caché
      ready: true,        // 👈 listo para navegar ya mismo
    });

    // 2) Refresca en segundo plano desde Firestore (sin bloquear la UI)
    try {
      const ref = doc(db, "users", u.uid);
      let snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          role: "empleado",
          displayName: u.email?.split("@")[0] || "Usuario",
          code: "EMP-AUTO",
          createdAt: Date.now(),
          photoURL: u.photoURL ?? null,
        } as Profile);
        snap = await getDoc(ref);
      }
      const fresh = snap.data() as Profile;
      useAuthStore.setState({ profile: fresh });
      try { localStorage.setItem(cacheKey(u.uid), JSON.stringify(fresh)); } catch {}
    } catch {
      // si falla, mantenemos lo cacheado
    }
  });
}
