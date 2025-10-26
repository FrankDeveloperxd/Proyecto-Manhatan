import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getWorker, getWorkerStats, listTrainings } from "../api";
import { Training, TrainingEnrollment, Worker } from "../types";

/* ---------- UI helpers ---------- */
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm ${className ?? ""}`}>{children}</div>
);

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl ring-1 ring-slate-200 bg-white p-4 shadow-sm">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, Math.round(value || 0)));
  return (
    <div className="h-2 w-full rounded-full bg-slate-200">
      <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${v}%` }} />
    </div>
  );
}

function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: "slate" | "indigo" | "emerald" | "rose" | "sky";
}) {
  const map: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${map[tone]}`}>
      {children}
    </span>
  );
}

/* ---------- Página ---------- */
export default function TrainingWorkerViewPage() {
  const { wid } = useParams<{ wid: string }>();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [stats, setStats] = useState<{ coursesCompleted: number; inProgress: number; certificates: number; hoursCompleted: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!wid) return;
      setLoading(true);
      const [w, t, s] = await Promise.all([getWorker(wid), listTrainings(), getWorkerStats(wid)]);
      if (!alive) return;
      setWorker(w);
      setTrainings(t);
      setStats(s);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [wid]);

  const titleBy = (id: string) => trainings.find(t => t.id === id)?.title || id;
  const metaBy  = (id: string) => trainings.find(t => t.id === id);

  const enrolls = worker?.trainingEnrollments ?? [];
  const inProgress = useMemo(
    () => enrolls.filter(e => e.status !== "completed"),
    [enrolls]
  );
  const certificates = useMemo(
    () => enrolls.filter(e => e.certified || e.status === "completed"),
    [enrolls]
  );

  if (!wid) {
    return <div className="p-6">Falta el parámetro del trabajador.</div>;
  }

  if (loading) {
    return <div className="p-6">Cargando…</div>;
  }

  if (!worker) {
    return <div className="p-6">Trabajador no encontrado.</div>;
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-2xl font-bold">{worker.name}</div>
            <div className="text-sm text-slate-600">{worker.email ?? ""}</div>
            <div className="mt-1">
              <Badge tone="sky">{worker.area ?? "Sin área"}</Badge>
            </div>
          </div>
          <Link to="/app/training/usuarios" className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-semibold">Volver</Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Cursos Completados" value={stats?.coursesCompleted ?? 0} />
          <Stat label="En Progreso" value={stats?.inProgress ?? 0} />
          <Stat label="Certificados" value={stats?.certificates ?? 0} />
          <Stat label="Horas Capacitación" value={stats?.hoursCompleted ?? 0} />
        </div>

        {/* En Progreso */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-lg font-semibold">En Progreso</div>
            <div className="text-sm text-slate-500">Cursos que está llevando ahora</div>
          </div>
          <div className="p-5">
            {!inProgress.length ? (
              <div className="text-sm text-slate-500">No hay cursos en progreso.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {inProgress.map((e) => {
                  const t = metaBy(e.trainingId);
                  return (
                    <div key={e.trainingId} className="rounded-2xl ring-1 ring-slate-200 p-4 bg-white shadow-sm">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center">🎯</div>
                        <div className="flex-1">
                          <div className="font-semibold">{titleBy(e.trainingId)}</div>
                          {t?.description && <div className="text-sm text-slate-600 line-clamp-2">{t.description}</div>}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Progreso</span>
                              <span>{Math.round(e.progress)}%</span>
                            </div>
                            <ProgressBar value={e.progress} />
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                            {t?.startDate && <span>Inicio: {new Date(t.startDate).toLocaleDateString()}</span>}
                            {t?.endDate && <span>Fin estimado: {new Date(t.endDate).toLocaleDateString()}</span>}
                            {t?.hours != null && <Badge>Horas: {t.hours}</Badge>}
                            {t?.certifies && <Badge tone="emerald">Certifica</Badge>}
                            {t?.modality && <Badge tone="sky">{t.modality}</Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Certificaciones Obtenidas */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-lg font-semibold">Certificaciones Obtenidas</div>
          </div>
          <div className="p-5">
            {!certificates.length ? (
              <div className="text-sm text-slate-500">Sin certificaciones por ahora.</div>
            ) : (
              <ul className="space-y-2">
                {certificates.map((e) => {
                  const t = metaBy(e.trainingId);
                  return (
                    <li key={e.trainingId} className="flex items-center justify-between rounded-xl ring-1 ring-slate-200 p-3 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-yellow-400/20 grid place-items-center">🏅</div>
                        <div>
                          <div className="font-medium">{titleBy(e.trainingId)}</div>
                          <div className="text-xs text-slate-500">
                            Completado: {new Date(e.lastUpdate || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge tone="emerald">{e.certified ? "Certificado" : "Completado"}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        {/* Historial completo */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-lg font-semibold">Historial</div>
            <div className="text-sm text-slate-500">Todas las inscripciones</div>
          </div>
          <div className="p-5 overflow-auto">
            {!enrolls.length ? (
              <div className="text-sm text-slate-500">No hay registros.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-2">Curso</th>
                    <th className="py-2">Estado</th>
                    <th className="py-2">Progreso</th>
                    <th className="py-2">Horas</th>
                    <th className="py-2">Certificación</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolls.map((e) => (
                    <tr key={e.trainingId} className="border-t">
                      <td className="py-2">{titleBy(e.trainingId)}</td>
                      <td className="py-2 capitalize">{e.status.replace("_", " ")}</td>
                      <td className="py-2">{Math.round(e.progress)}%</td>
                      <td className="py-2">{e.hoursDone ?? 0} h</td>
                      <td className="py-2">{e.certified ? "Sí" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
