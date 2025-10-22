import { useAuthStore } from "../auth/authStore";

export default function Settings() {
  const { profile } = useAuthStore();
  if (profile?.role !== "admin") return <div className="p-4">No autorizado.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">⚙️ Ajustes</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {/* General */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">General</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Nombre compañía, logo, tema claro/oscuro]
          </div>
        </section>

        {/* Seguridad */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Seguridad</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Políticas de contraseña, 2FA (si aplica), reglas de acceso]
          </div>
        </section>

        {/* Integraciones */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Integraciones</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Claves / endpoints: mapas, correo, webhooks, etc.]
          </div>
        </section>
      </div>
    </div>
  );
}
