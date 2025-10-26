import { NavLink, Outlet } from "react-router-dom";

function Tab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-4 py-2 text-sm font-semibold rounded-xl transition ${
          isActive
            ? "bg-indigo-600 text-white shadow"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function TrainingLayout() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">Capacitación</div>
          <div className="flex gap-2">
            <Tab to="/app/training">Capacitaciones</Tab>
            <Tab to="/app/training/usuarios">Usuarios</Tab>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
