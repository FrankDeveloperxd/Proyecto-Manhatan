import { NavLink } from "react-router-dom";

export type Role = "admin" | "empleado";

type Props = { role?: Role };

export default function BottomNav({ role = "empleado" }: Props) {
  const items =
    role === "admin"
      ? [
          { to: "/app", label: "Inicio", icon: "🏠" },
          { to: "/app/sensors", label: "Sensores", icon: "🛰️" },
          { to: "/app/training", label: "Capacitación", icon: "🎓" },
          { to: "/app/attendance", label: "Asistencia", icon: "🕒" },
          { to: "/app/agenda", label: "Agenda", icon: "🗓️" },
        ]
      : [
          { to: "/app", label: "Inicio", icon: "🏠" },
          { to: "/app/sensors", label: "Sensores", icon: "🛰️" },
          { to: "/app/training", label: "Capacitación", icon: "🎓" },
          { to: "/app/attendance", label: "Asistencia", icon: "🕒" },
          { to: "/app/profile", label: "Información", icon: "👤" },
          { to: "/app/agenda", label: "Agenda", icon: "🗓️" },
        ].slice(0, 5);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-neutral-200">
      <ul className="grid grid-cols-5 gap-1 px-2 py-2 text-xs">
        {items.map((i) => (
          <li key={i.to} className="flex">
            <NavLink
              to={i.to}
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 rounded-xl py-1.5
                 ${isActive ? "text-indigo-600" : "text-neutral-600 hover:text-neutral-900"}`
              }
            >
              <span className="text-xl leading-none">{i.icon}</span>
              <span className="leading-none">{i.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
