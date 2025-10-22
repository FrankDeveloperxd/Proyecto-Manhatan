import { useState, type PropsWithChildren } from "react";
import TopBar from "../componets/layout/TopBar";
import BottomNav from "../componets/layout/BottomNav";
import Sidebar from "../componets/layout/Sidebar";

type Role = "admin" | "empleado";

interface AppShellProps extends PropsWithChildren {
  role: Role;
}

export default function AppShell({ role, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false); // sidebar md+
  const [mobileOpen, setMobileOpen] = useState(false); // drawer móvil

  return (
    <div className="flex min-h-dvh bg-neutral-50 text-neutral-900">
      {/* SIDEBAR (desktop) + DRAWER (móvil) */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        role={role}
      />

      {/* OVERLAY para móvil cuando el drawer está abierto */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* COLUMNA DERECHA */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleMenu={() => setMobileOpen(true)} />

        {/* Contenido principal
            - pb-20 en móvil para que el bottom nav NO tape contenido
            - overflow-y-auto para scroll sólo del contenido */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">
          {children}
        </main>

        {/* BottomNav sólo en móvil */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
          <BottomNav role={role} />
        </div>
      </div>
    </div>
  );
}
