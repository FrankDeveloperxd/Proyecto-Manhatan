import { useAuthStore } from "../auth/authStore";

export default function Assets() {
  const { profile } = useAuthStore();
  if (profile?.role !== "admin") return <div className="p-4">No autorizado.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">🏢 Activos (CRUD)</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Crear / editar activo */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Crear / editar activo</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Formulario: nombre, tipo, ubicación, responsable, estado...]
          </div>
        </section>

        {/* Inventario */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Inventario</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Tabla con filtros: código, categoría, zona, estado]
          </div>
        </section>

        {/* Mantenimientos */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Mantenimientos</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Calendario / checklist de mantenimientos programados]
          </div>
        </section>
      </div>
    </div>
  );
}
