import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import AppShell from "./AppShell";

export default function Guard() {
  const { user, profile } = useAuthStore();

  // si no hay sesión → login
  if (!user) return <Navigate to="/login" replace />;

  // normalizamos el rol (solo admin | empleado)
  const role: "admin" | "empleado" =
    profile?.role === "admin" ? "admin" : "empleado";

  return (
    <AppShell role={role}>
      <Outlet />
    </AppShell>
  );
}
