import { useNavigate } from "react-router-dom";

export default function QuickAccess() {
  const nav = useNavigate();

  const go = (path: string) => () => nav(path);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={go("/app/sensors")}
        className="group rounded-2xl border border-neutral-200 bg-white px-3 py-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
      >
        <div className="text-2xl mb-1">📡</div>
        <div className="text-sm text-neutral-800 group-hover:text-indigo-600 font-medium">Ver Sensores</div>
      </button>

      <button
        type="button"
        onClick={go("/app/attendance")}
        className="group rounded-2xl border border-neutral-200 bg-white px-3 py-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
      >
        <div className="text-2xl mb-1">🕒</div>
        <div className="text-sm text-neutral-800 group-hover:text-indigo-600 font-medium">Asistencia</div>
      </button>

      <button
        type="button"
        onClick={go("/app/training")}
        className="group rounded-2xl border border-neutral-200 bg-white px-3 py-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
      >
        <div className="text-2xl mb-1">🎓</div>
        <div className="text-sm text-neutral-800 group-hover:text-indigo-600 font-medium">Capacitación</div>
      </button>

      <button
        type="button"
        onClick={go("/app/agenda")}
        className="group rounded-2xl border border-neutral-200 bg-white px-3 py-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
      >
        <div className="text-2xl mb-1">🗓️</div>
        <div className="text-sm text-neutral-800 group-hover:text-indigo-600 font-medium">Mi Agenda</div>
      </button>
    </div>
  );
}
