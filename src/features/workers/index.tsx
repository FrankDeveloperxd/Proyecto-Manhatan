import { useEffect, useState } from "react";
import WorkerForm from "./WorkerForm";
import WorkerQRModal from "./WorkerQRModal";
import type { Worker } from "./types";
import {
  createWorker,
  subscribeWorkers,
  updateWorker,
  deleteWorker,
} from "./api";
import { Link } from "react-router-dom";

export default function WorkersPage() {
  const [items, setItems] = useState<Worker[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openQR, setOpenQR] = useState(false);
  const [selected, setSelected] = useState<Worker | undefined>(undefined);

  // modo del form
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Worker | null>(null);

  useEffect(() => {
    const off = subscribeWorkers((arr) => setItems(arr));
    return () => off();
  }, []);

  const handleCreate = async (data: Worker) => {
    setSaving(true); setError(null);
    try {
      const { id, photoUrl } = await createWorker(data);
      const created: Worker = { ...data, id, photoUrl, registered: true, public: true };
      setSelected(created);
      setOpenQR(true);
      alert("Trabajador agregado correctamente.");
    } catch (e:any) {
      const msg = e?.message ?? "No se pudo guardar.";
      setError(msg); alert("Error guardando: " + msg);
    } finally { setSaving(false); }
  };

  const handleUpdate = async (data: Worker) => {
    if (!data.id) return;
    setSaving(true); setError(null);
    try {
      const { id, ...rest } = data;
      await updateWorker(id, rest);
      alert("Trabajador actualizado.");
      setMode("create");
      setEditing(null);
    } catch (e:any) {
      const msg = e?.message ?? "No se pudo actualizar.";
      setError(msg); alert("Error: " + msg);
    } finally { setSaving(false); }
  };

  const startEdit = (w: Worker) => {
    setMode("edit");
    setEditing(w);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setMode("create");
    setEditing(null);
  };

  const doDelete = async (w: Worker) => {
    if (!w.id) return;
    if (!confirm(`¿Borrar al trabajador "${w.fullName}"? Esta acción es permanente.`)) return;
    try {
      await deleteWorker(w.id);
      alert("Eliminado.");
      if (editing?.id === w.id) cancelEdit();
    } catch (e:any) {
      alert("No se pudo borrar: " + (e?.message ?? ""));
    }
  };

  const onSubmit = (data: Worker) =>
    mode === "edit" ? handleUpdate({ ...editing!, ...data, id: editing!.id }) : handleCreate(data);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Registrar trabajador</h1>
        {saving && <span className="text-sm opacity-70">Guardando…</span>}
      </div>

      {/* Formulario: crear/editar */}
      <WorkerForm
        mode={mode}
        initialData={editing ?? undefined}
        onSubmit={onSubmit}
        onClear={cancelEdit}
      />

      {/* Tabla */}
      <section className="mt-8">
        <h3 className="font-semibold mb-2">Trabajadores registrados</h3>

        {!items.length ? (
          <p className="opacity-70">Aún no hay trabajadores registrados.</p>
        ) : (
          <div className="overflow-auto border rounded-xl">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 w-[280px]">ID</th>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Rol / Área / Código</th>
                  <th className="text-right p-3 w-[340px]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((w) => (
                  <tr key={w.id} className="border-t">
                    <td className="p-3 font-mono text-xs">{w.id}</td>
                    <td className="p-3">{w.fullName}</td>
                    <td className="p-3">{w.role} · {w.area} · {w.code}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button className="btn" onClick={() => { setSelected(w); setOpenQR(true); }}>
                          QR
                        </button>
                        <Link to={`/ficha-worker/${w.id}`} className="btn">
                          Ver
                        </Link>
                        <button className="btn" onClick={() => startEdit(w)}>
                          Editar
                        </button>
                        <button className="btn-secondary" onClick={() => doDelete(w)}>
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal QR */}
      <WorkerQRModal open={openQR} worker={selected} onClose={() => setOpenQR(false)} />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
