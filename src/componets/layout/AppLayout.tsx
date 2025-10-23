// src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="pb-20"> {/* deja espacio para el footer */}
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
