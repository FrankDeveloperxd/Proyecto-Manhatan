import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeWorkers, deleteWorker } from "./api";
import WorkerQRModal from "./WorkerQRModal";
import type { Worker } from "./types";

export default function WorkersInlineList() {
  const [items, setItems] = useState<Worker[]>([]);
  const [q, setQ] = useState("");
  const [openQR, setOpenQR] = useState(false);
  const [sel, setSel] = useState<Worker | undefined>(undefined);

  useEffect(() => subscribeWorkers(setItems), []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(w =>
      w.fullName?.toLowerCase().includes(s) ||
      w.role?.toLowerCase().includes(s) ||
      w.area?.toLowerCase().includes(s) ||
      w.code?.toLowerCase().includes(s) ||
      w.id?.toLowerCase().includes(s)
    );
  }, [items, q]);

  const onDelete = async (w: Worker)=>{
    if(!w.id) return;
    if(!confirm(`¿Eliminar a "${w.fullName}"?`)) return;
    try{ await deleteWorker(w.id); }catch(e:any){ alert(e?.message ?? "No se pudo eliminar"); }
  };

  return (
    <>
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Trabajadores</h3>
          <input
            className="input h-9 w-72"
            placeholder="Buscar por nombre, rol, ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Desktop: tabla moderna */}
        {filtered.length ? (
          <div className="hidden md:block table-surface overflow-auto">
            <table className="min-w-[940px] w-full text-sm">
              <thead className="th-soft">
                <tr>
                  <th className="text-left p-3 w-[300px]">ID</th>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Rol / Área / Código</th>
                  <th className="text-right p-3 w-[280px]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((w) => (
                  <tr key={w.id} className="row-hover">
                    <td className="p-3 id-mono">{w.id}</td>
                    <td className="p-3">
                      <div className="font-medium">{w.fullName}</div>
                      <div className="text-xs text-slate-500">{w.email || "—"}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {w.role && <span className="chip">{w.role}</span>}
                        {w.area && <span className="chip">{w.area}</span>}
                        {w.code && <span className="chip">#{w.code}</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="btn-group">
                        <button className="icon-btn" title="QR"
                          onClick={()=>{ setSel(w); setOpenQR(true); }}>
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v8H3zM5 5v4h4V5zm6 6h2v2h-2zm0-8h2v6h-2zm4 0h6v6h-6zm2 2v2h2V5zM3 13h6v8H3zm2 2v4h2v-4zm8 0h2v2h-2zm0 4h2v2h-2zm4-4h4v2h-2v2h-2zm0 6h4v2h-4z"/></svg>
                        </button>
                        <Link to={`/ficha-worker/${w.id}`} className="icon-btn" title="Ver ficha">
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-5.33 0-8 2.67-8 6v1h16v-1c0-3.33-2.67-6-8-6"/></svg>
                        </Link>
                        <Link to="/app/workers" className="icon-btn" title="Editar">
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.04c.39-.39.39-1.02 0-1.41l-1.51-1.51a1 1 0 0 0-1.41 0l-1.12 1.12 3.75 3.75 1.29-1.29Z"/></svg>
                        </Link>
                        <button className="icon-btn danger" title="Eliminar" onClick={()=>onDelete(w)}>
                          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 7h12v2H6zm2 3h8l-1 9H9zM9 4h6v2H9z"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="opacity-70">Aún no hay trabajadores registrados.</p>
        )}

        {/* Mobile: cards */}
        <div className="md:hidden grid gap-3">
          {filtered.map((w)=>(
            <article key={w.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm id-mono">{w.id}</div>
                  <div className="font-medium mt-1">{w.fullName}</div>
                  <div className="text-xs text-slate-500">{w.email || "—"}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {w.role && <span className="chip">{w.role}</span>}
                    {w.area && <span className="chip">{w.area}</span>}
                    {w.code && <span className="chip">#{w.code}</span>}
                  </div>
                </div>
                <div className="btn-group">
                  <button className="icon-btn" title="QR" onClick={()=>{ setSel(w); setOpenQR(true); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v8H3zM5 5v4h4V5zm6 6h2v2h-2zm0-8h2v6h-2zm4 0h6v6h-6zm2 2v2h2V5zM3 13h6v8H3zm2 2v4h2v-4zm8 0h2v2h-2zm0 4h2v2h-2zm4-4h4v2h-2v2h-2zm0 6h4v2h-4z"/></svg>
                  </button>
                  <Link to={`/ficha-worker/${w.id}`} className="icon-btn" title="Ver ficha">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-5.33 0-8 2.67-8 6v1h16v-1c0-3.33-2.67-6-8-6"/></svg>
                  </Link>
                  <Link to="/app/workers" className="icon-btn" title="Editar">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm14.71-9.04c.39-.39.39-1.02 0-1.41l-1.51-1.51a1 1 0 0 0-1.41 0l-1.12 1.12 3.75 3.75 1.29-1.29Z"/></svg>
                  </Link>
                  <button className="icon-btn danger" title="Eliminar" onClick={()=>onDelete(w)}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 7h12v2H6zm2 3h8l-1 9H9zM9 4h6v2H9z"/></svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-xs opacity-70 mt-2">Mostrando {filtered.length} de {items.length}</div>
      </section>

      <WorkerQRModal open={openQR} worker={sel} onClose={() => setOpenQR(false)} />
    </>
  );
}
