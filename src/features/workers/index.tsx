// src/features/workers/index.tsx  (o WorkersPage.tsx)
import { useEffect, useState } from "react";
import WorkerForm from "./WorkerForm";
import WorkerQRModal from "./WorkerQRModal";
import type { Worker } from "./types";

// 👇 usa tu API centralizada
import { createWorker, subscribeWorkers } from "./api";

export default function WorkersPage() {
  const [items, setItems] = useState<Worker[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openQR, setOpenQR] = useState(false);
  const [lastWorker, setLastWorker] = useState<Worker | undefined>(undefined);

  // Suscripción en tiempo real a /workers (ordenado por createdAt desc)
  useEffect(() => {
    const off = subscribeWorkers((arr) => setItems(arr));
    return () => off();
  }, []);

  // 🔑 Recibe data + file opcional desde el formulario
  const onSubmit = async (data: Worker, photoFile?: File) => {
    try {
      setSaving(true);
      setError(null);

      // Sube foto si hay, guarda el doc, y devuelve { id, photoUrl }
      const { id, photoUrl } = await createWorker(data, photoFile);

      const created: Worker = { ...data, id, photoUrl, registered: true, public: true };
      setLastWorker(created);
      setOpenQR(true);

      alert("Trabajador agregado correctamente.");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? "No se pudo guardar.";
      setError(msg);
      alert("Error guardando: " + msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Registrar trabajador</h1>
        {saving && <span className="text-sm opacity-70">Guardando…</span>}
      </div>

      {/* Formulario: envía (data, photoFile) */}
      <WorkerForm onSubmit={onSubmit} onClear={() => {}} />

      {/* Lista simple */}
      <div className="mt-6 space-y-2">
        <h3 className="font-semibold">Trabajadores registrados</h3>
        {items.length === 0 ? (
          <p className="opacity-70">Aún no hay trabajadores registrados.</p>
        ) : (
          <div className="grid gap-2">
            {items.map((w) => (
              <div key={w.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 border">
                    {w.photoUrl ? (
                      <img src={w.photoUrl} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <div className="font-medium">{w.fullName}</div>
                    <div className="text-xs opacity-70">
                      {w.role} · {w.code} · {w.area}
                    </div>
                  </div>
                </div>
                <button
                  className="btn"
                  onClick={() => {
                    setLastWorker(w);
                    setOpenQR(true);
                  }}
                >
                  Ver QR
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal con el QR del último creado/seleccionado */}
      <WorkerQRModal open={openQR} worker={lastWorker} onClose={() => setOpenQR(false)} />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
