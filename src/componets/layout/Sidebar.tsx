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
      {items.map(i => (
        <NavLink
          key={i.to}
          to={i.to}
          end
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg transition
             ${isActive ? "bg-indigo-50 text-indigo-600 font-medium"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"}`
          }
        >
          <span className="shrink-0">{i.icon}</span>
          <span className={`whitespace-nowrap transition-all duration-300 ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}`}>
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
        className={`hidden md:flex flex-col h-screen bg-sky-100 border-r border-neutral-200 transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex items-center justify-between h-14 px-3 border-b border-neutral-200">
          <span className={`font-semibold text-lg transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}>
            Panel SAFETRACK
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-neutral-100"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
        {List}
        <div className="p-3 border-t border-neutral-200 text-xs text-neutral-500">
          {!collapsed && <>Versión 1.0 · © 2025 - PatoDevTechnology</>}
        </div>
      </aside>

      {/* Móvil: drawer + overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-200
        ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sky-100 border-r border-neutral-200 md:hidden
        transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-14 px-3 border-b border-neutral-200">
          <span className="font-semibold text-lg">Menú</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-neutral-100"
            aria-label="Cerrar menú"
          >
            «
          </button>
        </div>
        {List}
      </aside>
    </>
  );
}
