// src/routes/PrivateRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Props = { children: React.ReactNode };

export default function PrivateRoute({ children }: Props) {
  const { isAuthenticated, checking } = useAuth();
  const location = useLocation();

  if (checking) return <div className="p-6 text-center">Cargando…</div>;

  return isAuthenticated
    ? <>{children}</>
    : <Navigate to="/login" replace state={{ from: location }} />;
}
