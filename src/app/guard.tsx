import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import TopBar from "../componets/layout/TopBar";
import BottomNav from "../componets/layout/BottomNav";
import Sidebar from "../componets/layout/Sidebar";

export default function Guard() {
  const { user, profile, ready } = useAuthStore();   // 👈 leemos ready
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 👇 No tomes decisiones hasta que Firebase responda por primera vez
  if (!ready) {
    return null; // o un mini loader si quieres
  }
  if (!user) return <Navigate to="/login" replace />;

  const role = profile?.role === "admin" ? "admin" : "empleado";

  return (
    <div className="flex min-h-dvh bg-neutral-50 text-neutral-900">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        role={role}
      />

      {/* COLUMNA DERECHA */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleMenu={() => setMobileOpen(true)} />
        {/* padding inferior para que el bottom nav nunca tape contenido */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6">
          <Outlet />
        </main>

        <div className="md:hidden">
          <BottomNav role={role} />
        </div>
      </div>
    </div>
  );
}
