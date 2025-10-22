import { NavLink } from "react-router-dom";

const items = [
  { to:"/app",            label:"Inicio",      icon:"🏠" },
  { to:"/app/sensors",    label:"Sensores",    icon:"🛰️" },
  { to:"/app/training",   label:"Capacitación",icon:"🎓" },
  { to:"/app/attendance", label:"Asistencia",  icon:"🕒" },
  { to:"/app/profile",    label:"Info",        icon:"👤" },
  { to:"/app/agenda",     label:"Agenda",      icon:"🗓️" },
];

export default function BottomNav(){
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-neutral-200">
      <ul className="flex justify-around py-2 text-xs">
        {items.map(i=>(
          <li key={i.to}>
            <NavLink
              to={i.to}
              className={({isActive}) =>
                `flex flex-col items-center ${isActive ? "text-indigo-600" : "text-neutral-600"}`
              }
            >
              <span className="text-lg leading-none">{i.icon}</span>
              <span>{i.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
