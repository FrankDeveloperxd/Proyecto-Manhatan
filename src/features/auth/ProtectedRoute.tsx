import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../lib/firebase";

type Props = { children: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (user === undefined) return null;          // spinner opcional
  if (user && !user.isAnonymous) return <>{children}</>; // bloquear anónimo

  const redirect = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/login?redirect=${redirect}`} replace />;
}
