import { NavLink } from "react-router-dom";

type Props = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  role?: "admin" | "supervisor" | "empleado";
};

const baseItems = [
  { to: "/app",            label: "Inicio",        icon: "🏠" },
  { to: "/app/sensors",    label: "Sensores",      icon: "🛰️" },
  { to: "/app/training",   label: "Capacitación",  icon: "🎓" },
  { to: "/app/attendance", label: "Asistencia",    icon: "🕒" },
  { to: "/app/workers",    label: "Trabajadores",  icon: "🧑‍🏭" },
  { to: "/app/agenda",     label: "Agenda",        icon: "🗓️" },
];

const adminItems = [
  { to: "/app/users",      label: "Usuarios (CRUD)", icon: "👥" },
  { to: "/app/assets",     label: "Activos (CRUD)",  icon: "🏢" },
  { to: "/app/docs",       label: "Documentos",      icon: "📄" },
  { to: "/app/analytics",  label: "Reportes",        icon: "📈" },
  { to: "/app/settings",   label: "Ajustes",         icon: "⚙️" },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  role = "empleado",
}: Props) {
  const items = role === "admin" ? [...baseItems, ...adminItems] : baseItems;

  const List = (
    <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition
             ${isActive
               ? "bg-white/20 text-white font-medium"
               : "text-gray-200 hover:bg-white/10 hover:text-white"}`
          }
        >
          <span className="shrink-0">{i.icon}</span>
          <span
            className={`whitespace-nowrap transition-all duration-300 ${
              collapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"
            }`}
          >
            {i.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: colapsable */}
      <aside
        className={`hidden md:flex flex-col h-screen border-r border-white/30 transition-all duration-300
        ${collapsed ? "w-20" : "w-64"} bg-[#4FAEDD] dark:!bg-neutral-900 text-white`}
      >
        <div className="flex items-center h-14 px-3 border-b border-white/30">
          {/* Título: no ocupa ancho al colapsar */}
          <span
            className={`font-semibold text-lg transition-all duration-300
            ${collapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"}`}
          >
            Panel SAFETRACK
          </span>

          {/* Botón SIEMPRE visible */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg ml-auto hover:bg-white/20"
            title={collapsed ? "Expandir" : "Colapsar"}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {List}

        <div className="p-3 border-t border-white/30 text-xs text-gray-200">
          {!collapsed && <>Versión 1.0 · © 2025 - PatoDevTechnology</>}
        </div>
      </aside>

      {/* Móvil: overlay + drawer (solo si está abierto) */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-200 opacity-100 pointer-events-auto"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed top-0 left-0 z-50 h-full w-64 border-r border-white/30 md:hidden transition-transform duration-300 translate-x-0 bg-[#4FAEDD] dark:!bg-neutral-900 text-white"
          >
            <div className="flex items-center justify-between h-14 px-3 border-b border-white/30">
              <span className="font-semibold text-lg">Menú</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20"
                aria-label="Cerrar menú"
              >
                «
              </button>
            </div>
            {List}
          </aside>
        </>
      )}
    </>
  );
}
