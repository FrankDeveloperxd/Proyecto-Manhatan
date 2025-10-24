import { useAuthStore } from "../auth/authStore";

export default function Analytics() {
  const { profile } = useAuthStore();
  if (profile?.role !== "admin") return <div className="p-4">No autorizado.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">📈 Reportes</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {/* KPIs */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">KPIs</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Tarjetas: % capacitaciones cumplidas, incidentes, asistencia]
          </div>
        </section>

        {/* Gráficos */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Gráficos</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Barras / líneas por mes, por área; comparativas]
          </div>
        </section>

        {/* Exportaciones */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Exportaciones</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Exportar a CSV/PDF reportes de asistencia, sensores, alertas]
          </div>
        </section>
      </div>
    </div>
  );
}
