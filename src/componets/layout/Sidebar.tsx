import { NavLink } from "react-router-dom";

const items = [
  { to:"/app",            label:"Inicio",        icon:"🏠" },
  { to:"/app/sensors",    label:"Sensores",      icon:"🛰️" },
  { to:"/app/training",   label:"Capacitación",  icon:"🎓" },
  { to:"/app/attendance", label:"Asistencia",    icon:"🕒" },
  { to:"/app/profile",    label:"Información",   icon:"👤" },
  { to:"/app/agenda",     label:"Agenda",        icon:"🗓️" },
];

export default function Sidebar(){
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r border-neutral-200 bg-white">
      <nav className="p-3">
        <ul className="space-y-1">
          {items.map(i=>(
            <li key={i.to}>
              <NavLink
                to={i.to}
                className={({isActive}) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg 
                   ${isActive ? "bg-neutral-100 text-indigo-600" : "hover:bg-neutral-50"}`
                }
              >
                <span>{i.icon}</span>
                <span className="text-sm font-medium">{i.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
