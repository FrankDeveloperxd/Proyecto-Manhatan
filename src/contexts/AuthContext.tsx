import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, User as FbUser } from "firebase/auth";
import { auth } from "../lib/firebase";

type User = Pick<FbUser, "uid" | "email" | "displayName">;
type Ctx = { user: User | null; isAuthenticated: boolean; checking: boolean; };

const AuthContext = createContext<Ctx | null>(null);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fb) => {
      setUser(fb ? { uid: fb.uid, email: fb.email || "", displayName: fb.displayName || "" } : null);
      setChecking(false);
    });
    const onStorage = (e: StorageEvent) => { if (e.key === "pm_auth_event") {/* noop: dispara listeners */} };
    window.addEventListener("storage", onStorage);
    return () => { unsub(); window.removeEventListener("storage", onStorage); };
  }, []);

  const value = useMemo(() => ({ user, isAuthenticated: !!user, checking }), [user, checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
