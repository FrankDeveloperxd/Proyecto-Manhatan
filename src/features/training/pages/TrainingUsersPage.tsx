import { useEffect, useMemo, useState } from "react";
import { enrollWorker, listTrainings, listWorkers, unenrollWorker } from "../api";
import { Training, Worker, TrainingEnrollment } from "../types";
import { Link } from "react-router-dom";

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm ${className ?? ""}`}>{children}</div>
);

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">{children}</span>;
}

export default function TrainingUsersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string>("");
  const [msg, setMsg] = useState<string>("");

  const [selectedByWorker, setSelectedByWorker] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      setWorkers(await listWorkers());
      setTrainings(await listTrainings());
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return workers;
    return workers.filter(
      (w) =>
        (w.name || "").toLowerCase().includes(s) ||
        (w.area || "").toLowerCase().includes(s) ||
        (w.id || "").toLowerCase().includes(s)
    );
  }, [workers, q]);

  function setSelected(wid: string, tid: string) {
    setSelectedByWorker((prev) => ({ ...prev, [wid]: tid }));
  }

  async function doEnroll(wid: string) {
    const tid = selectedByWorker[wid];
    if (!tid) return;
    try {
      setBusy(wid);
      await enrollWorker(wid, tid);
      setMsg("Inscripción guardada ✅");
      setWorkers((ws) =>
        ws.map((w) =>
          w.id !== wid
            ? w
            : {
                ...w,
                trainingIds: Array.from(new Set([...(w.trainingIds || []), tid])),
                trainingEnrollments: [
                  ...(w.trainingEnrollments || []),
                  { trainingId: tid, status: "enrolled", progress: 0, hoursDone: 0, certified: false, lastUpdate: Date.now() },
                ],
              }
        )
      );
    } catch (e: any) {
      setMsg(e?.message || "No se pudo inscribir");
    } finally {
      setBusy("");
      setTimeout(() => setMsg(""), 2000);
    }
  }

  async function doRemove(wid: string, tid: string) {
    if (!confirm("¿Quitar de esta capacitación?")) return;
    try {
      setBusy(wid);
      await unenrollWorker(wid, tid);
      setMsg("Eliminado de la capacitación ✅");
      setWorkers((ws) =>
        ws.map((w) =>
          w.id !== wid
            ? w
            : {
                ...w,
                trainingIds: (w.trainingIds || []).filter((x) => x !== tid),
                trainingEnrollments: (w.trainingEnrollments || []).filter((x) => x.trainingId !== tid),
              }
        )
      );
    } catch (e: any) {
      setMsg(e?.message || "No se pudo quitar");
    } finally {
      setBusy("");
      setTimeout(() => setMsg(""), 2000);
    }
  }

  const input = "rounded-xl border border-slate-200 px-3 py-2";

  return (
    <div className="space-y-4">
      <Card>
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Usuarios</h2>
          <div className="flex items-center gap-3">
            <input className={`${input} w-72`} placeholder="Buscar nombre, área o ID…" value={q} onChange={(e) => setQ(e.target.value)} />
            {msg && <span className="text-sm text-emerald-600">{msg}</span>}
          </div>
        </div>
      </Card>

      <Card>
        {!filtered.length ? (
          <div className="p-5 text-sm text-slate-500">Sin registros.</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((w) => {
              const sel = selectedByWorker[w.id] || "";
              const history = [...(w.trainingEnrollments || [])].sort(
                (a: TrainingEnrollment, b: TrainingEnrollment) => (b.lastUpdate || 0) - (a.lastUpdate || 0)
              );
              const titleBy = (id: string) => trainings.find((t) => t.id === id)?.title || id;

              return (
                <li key={w.id} className="p-5">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    {/* Col 1: información */}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{w.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {w.area ?? "-"} · {w.email ?? ""}
                      </div>
                    </div>

                    {/* Col 2: historial */}
                    <div className="min-w-0">
                      {history.length ? (
                        <div className="flex flex-wrap gap-2">
                          {history.map((e) => (
                            <span key={e.trainingId} className="flex items-center gap-2">
                              <Chip>
                                <span className="font-medium">{titleBy(e.trainingId)}</span> · {e.status} · {e.progress}%
                                {e.certified ? " · Certificado" : ""}
                              </Chip>
                              <button
                                className="text-xs px-2 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
                                onClick={() => doRemove(w.id, e.trainingId)}
                              >
                                Quitar
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">Sin historial.</div>
                      )}
                    </div>

                    {/* Col 3: acciones */}
                    <div className="flex items-center justify-end gap-2">
                    <select
                        className="rounded-xl border border-slate-200 px-3 py-2"
                        value={sel}
                        onChange={(e) => setSelected(w.id, e.target.value)}
                    >
                        <option value="">Agregar a capacitación…</option>
                        {trainings.map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                    </select>

                    <button
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm disabled:opacity-60"
                        disabled={!sel || busy === w.id}
                        onClick={() => doEnroll(w.id)}
                    >
                        {busy === w.id ? "Guardando…" : "Inscribir"}
                    </button>

                    {/* 👇 AQUI va el botón Ver */}
                    <Link
                        to={`/app/training/ver/${w.id}`}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold"
                    >
                        Ver
                    </Link>
                    </div>

                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
