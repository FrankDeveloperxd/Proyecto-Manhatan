import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorkerForm from "./WorkerForm";
import WorkerQRModal from "./WorkerQRModal";
import type { Worker } from "./types";
import {
  createWorker,
  subscribeWorkers,
  updateWorker,
  deleteWorker,
} from "./api";

export default function WorkersQuickPanel({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<Worker[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [tab, setTab] = useState<"form" | "list">("form");
  const [editing, setEditing] = useState<Worker | null>(null);

  const [qrOpen, setQrOpen] = useState(false);
  const [selected, setSelected] = useState<Worker | undefined>(undefined);

  const [q, setQ] = useState("");

  useEffect(() => {
    const off = subscribeWorkers((arr) => setItems(arr));
    return () => off();
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter(
      (w) =>
        w.fullName?.toLowerCase().includes(s) ||
        w.role?.toLowerCase().includes(s) ||
        w.area?.toLowerCase().includes(s) ||
        w.code?.toLowerCase().includes(s) ||
        w.id?.toLowerCase().includes(s)
    );
  }, [items, q]);

  if (!open) return null;

  const doCreate = async (data: Worker) => {
    setSaving(true); setError(null);
    try {
      const { id, photoUrl } = await createWorker(data);
      const created: Worker = { ...data, id, photoUrl, registered: true, public: true };
      setSelected(created);
      setQrOpen(true);
      setTab("list");
    } catch (e:any) {
      const msg = e?.message ?? "No se pudo guardar.";
      setError(msg);
    } finally { setSaving(false); }
  };

  const doUpdate = async (data: Worker) => {
    if (!editing?.id) return;
    setSaving(true); setError(null);
    try {
      const { id, ...rest } = { ...editing, ...data };
      await updateWorker(editing.id, rest);
      setMode("create");
      setEditing(null);
      setTab("list");
    } catch (e:any) {
      setError(e?.message ?? "No se pudo actualizar.");
    } finally { setSaving(false); }
  };

  const startEdit = (w: Worker) => {
    setMode("edit"); setEditing(w); setTab("form");
  };
  const cancelEdit = () => { setMode("create"); setEditing(null); };

  const doDelete = async (w: Worker) => {
    if (!w.id) return;
    if (!confirm(`¿Borrar a "${w.fullName}"?`)) return;
    try {
      await deleteWorker(w.id);
      if (editing?.id === w.id) cancelEdit();
    } catch (e:any) {
      alert("No se pudo borrar: " + (e?.message ?? ""));
    }
  };

  const onSubmit = (data: Worker) =>
    mode === "edit" ? doUpdate(data) : doCreate(data);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="ml-auto h-full w-full max-w-6xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl relative flex flex-col">
        {/* Header con gradiente */}
        <div className="p-4 border-b bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm/none opacity-90">Gestión rápida</div>
              <div className="text-xl font-semibold">
                {mode === "edit" ? "Editar trabajador" : "Registrar trabajador"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saving && <span className="text-xs/none opacity-90">Guardando…</span>}
              <button className="rounded-lg px-3 py-2 bg-white/20 hover:bg-white/25"
                      onClick={onClose}>Cerrar</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setTab("form")}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab==="form" ? "bg-white text-violet-700" : "bg-white/15"}`}
            >
              Formulario
            </button>
            <button
              onClick={() => setTab("list")}
              className={`px-3 py-1.5 rounded-lg text-sm ${tab==="list" ? "bg-white text-violet-700" : "bg-white/15"}`}
            >
              Lista
            </button>

            {/* Search en lista */}
            <div className="ml-auto relative">
              <input
                className="w-64 rounded-lg bg-white/15 placeholder-white/70 px-9 py-1.5 text-sm outline-none border border-white/20 focus:bg-white/20"
                placeholder="Buscar por nombre, rol, ID…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <svg className="absolute left-2 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19zM5 9.5C5 7.02 7.02 5 9.5 5S14 7.02 14 9.5 11.98 14 9.5 14 5 11.98 5 9.5z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-auto flex-1">
          {tab === "form" ? (
            <WorkerForm
              mode={mode}
              initialData={editing ?? undefined}
              onSubmit={onSubmit}
              onClear={cancelEdit}
            />
          ) : (
            <section>
              {!filtered.length ? (
                <p className="opacity-70">No hay trabajadores.</p>
              ) : (
                <div className="overflow-auto rounded-xl border">
                  <table className="min-w-[860px] w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0">
                      <tr>
                        <th className="text-left p-3 w-[280px]">ID</th>
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Rol / Área / Código</th>
                        <th className="text-right p-3 w-[360px]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-mono text-xs">{w.id}</td>
                          <td className="p-3">
                            <div className="font-medium">{w.fullName}</div>
                            <div className="text-xs opacity-70">{w.email || "—"}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">{w.role}</span>
                              {w.area ? <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">{w.area}</span> : null}
                              {w.code ? <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs">#{w.code}</span> : null}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <button
                                className="icon-btn"
                                title="Ver QR"
                                onClick={() => { setSelected(w); setQrOpen(true); }}
                              >
                                {/* QR icon */}
                                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v8H3V3Zm2 2v4h4V5H5Zm6 6h2v2h-2v-2Zm0-8h2v6h-2V3Zm4 0h6v6h-6V3Zm2 2v2h2V5h-2ZM3 13h6v8H3v-8Zm2 2v4h2v-4H5Zm8 0h2v2h-2v-2Zm0 4h2v2h-2v-2Zm4-4h4v2h-2v2h-2v-4Zm0 6h4v2h-4v-2Z"/></svg>
                              </button>

                              <Link to={`/ficha-worker/${w.id}`} className="icon-btn" title="Ver ficha" onClick={onClose}>
                                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5.33 0-8 2.67-8 6v1h16v-1c0-3.33-2.67-6-8-6Z"/></svg>
                              </Link>

                              <button className="icon-btn" title="Editar" onClick={() => startEdit(w)}>
                                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.04c.39-.39.39-1.02 0-1.41l-1.51-1.51a1 1 0 0 0-1.41 0l-1.12 1.12 3.75 3.75 1.29-1.29Z"/></svg>
                              </button>

                              <button className="icon-btn danger" title="Borrar" onClick={() => doDelete(w)}>
                                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 7h12v2H6zm2 3h8l-1 9H9zM9 4h6v2H9z"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex justify-between mt-3">
                <div className="text-xs opacity-70">Mostrando {filtered.length} de {items.length}</div>
                <Link to="/app/workers" className="btn">Ver página completa</Link>
              </div>
              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </section>
          )}
        </div>
      </div>

      {/* Modal QR */}
      <WorkerQRModal open={qrOpen} worker={selected} onClose={() => setQrOpen(false)} />
    </div>
  );
}
