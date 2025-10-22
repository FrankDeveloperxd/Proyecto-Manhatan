export default function Attendance(){
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Asistencia Laboral</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <button className="p-6 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-left">
          <div className="text-2xl">➡️</div>
          <div className="font-semibold">Registrar Entrada</div>
          <div className="text-sm text-neutral-300">Ya registrado / pendiente</div>
        </button>
        <button className="p-6 rounded-2xl bg-green-700 hover:bg-green-600 text-left">
          <div className="text-2xl">⬅️</div>
          <div className="font-semibold">Registrar Salida</div>
          <div className="text-sm text-neutral-100">No registrado</div>
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-800">
          <div className="text-sm text-neutral-300">Entrada Hoy</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-800">
          <div className="text-sm text-neutral-300">Salida Hoy</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-800">
          <div className="text-sm text-neutral-300">Horas Trabajadas</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-800">
          <div className="text-sm text-neutral-300">Pausas</div>
          <div className="text-2xl font-semibold">—</div>
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <h3 className="font-semibold mb-2">Historial de Asistencia</h3>
        <div className="text-sm text-neutral-300">Aquí listaremos los días con horas y tardanzas.</div>
      </div>
    </div>
  );
}
