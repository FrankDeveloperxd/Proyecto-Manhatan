import { useAuthStore } from "../auth/authStore";

export default function Users() {
  const { profile } = useAuthStore();
  if (profile?.role !== "admin") {
    return <div className="p-4">No autorizado.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">👥 Usuarios (CRUD)</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Crear usuario</div>
          <div className="text-neutral-400 text-sm mt-2">[Formulario aquí]</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Listado</div>
          <div className="text-neutral-400 text-sm mt-2">[Tabla / búsqueda]</div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Permisos / rol</div>
          <div className="text-neutral-400 text-sm mt-2">[Rol admin / empleado]</div>
        </div>
      </div>
    </div>
  );
}
