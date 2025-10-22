import { useAuthStore } from "../auth/authStore";

export default function Docs() {
  const { profile } = useAuthStore();
  if (profile?.role !== "admin") return <div className="p-4">No autorizado.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">📄 Documentos</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Subida de documentos */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Subir documentos</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Uploader: PDF, imágenes; metadatos (categoría, vigencia)]
          </div>
        </section>

        {/* Repositorio */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Repositorio</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Listado con búsqueda: políticas, manuales, fichas, permisos]
          </div>
        </section>

        {/* Firmas / vencimientos */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="text-sm text-neutral-600">Vencimientos y firmas</div>
          <div className="text-neutral-400 text-sm mt-2">
            [Alertas de documentos por vencer, seguimiento de firmas]
          </div>
        </section>
      </div>
    </div>
  );
}
