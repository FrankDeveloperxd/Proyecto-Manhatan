import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";
import TopBar from "../componets/layout/TopBar";
import BottomNav from "../componets/layout/BottomNav";
import { auth } from "../lib/firebase"; // 👈

export default function Guard() {
  const { user } = useAuthStore();
  const u = user ?? auth.currentUser; // 👈 evita que te pida “dos veces”

  if (!u) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <TopBar />
      <div className="max-w-7xl mx-auto">
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
