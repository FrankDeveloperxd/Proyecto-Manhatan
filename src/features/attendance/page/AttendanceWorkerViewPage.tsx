import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { getTodayAttendance, listAttendance, getAttendanceStats } from "../api";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

type Today = {
  inAt?: number | null;
  outAt?: number | null;
  totalMinutes?: number;
  breaksMinutes?: number;
  status?: string;      // "late" | "present" | "absent"
  outStatus?: string;   // "early" | "ok"
} | null;

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={`rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm ${className ?? ""}`}>
    {children}
  </div>
);

const Badge: React.FC<{ tone?: "emerald" | "indigo" | "amber" | "rose" | "slate"; children: React.ReactNode }> = ({
  tone = "slate",
  children,
}) => {
  const map: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    indigo: "bg-indigo-50 text-indigo-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[tone]}`}>{children}</span>;
};

function initials(name?: string, email?: string) {
  const base = (name || email || "").trim();
  if (!base) return "👤";
  const parts = base.split(/\s+/).slice(0, 2);
  const text = parts.map(p => p[0]?.toUpperCase() ?? "").join("");
  return text || "👤";
}

export default function AttendanceWorkerViewPage() {
  const { wid } = useParams<{ wid: string }>();
  const [worker, setWorker] = useState<any>(null);
  const [today, setToday] = useState<Today>(null);
  const [hist, setHist] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wid) return;
    (async () => {
      setLoading(true);
      const wSnap = await getDoc(doc(db, "workers", wid));
      setWorker(wSnap.exists() ? ({ id: wSnap.id, ...(wSnap.data() as any) }) : { id: wid });

      const t = await getTodayAttendance(wid);
      setToday(t);

      const [h, s] = await Promise.all([listAttendance(wid, 10), getAttendanceStats(wid)]);
      setHist(h); setStats(s);
      setLoading(false);
    })();
  }, [wid]);

  const fmtTime = (ms?: number | null) => (ms ? dayjs(ms).format("h:mm A") : "—");
  const displayName = worker?.name || worker?.email || wid;
  const subLine = [worker?.email, worker?.area].filter(Boolean).join(" · ");
  const dateStr = dayjs().format("ddd DD MMM YYYY");

  const workedText = useMemo(() => {
    const min =
      today?.totalMinutes ??
      (today?.inAt && today?.outAt
        ? Math.max(0, Math.round(((today.outAt as number) - (today.inAt as number)) / 60000))
        : 0);
    const h = Math.floor((min || 0) / 60);
    const m = (min || 0) % 60;
    return `${h}h ${m}min`;
  }, [today]);

  const statusBadge = today?.status === "late"
    ? <Badge tone="amber">Tardanza</Badge>
    : today?.inAt
      ? <Badge tone="emerald">Presente</Badge>
      : <Badge tone="slate">—</Badge>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {initials(worker?.name, worker?.email)}
            </div>
            <div>
              <div className="text-lg font-semibold">{displayName}</div>
              <div className="text-sm text-slate-500">{subLine}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Día</div>
            <div className="text-sm font-medium">{dateStr}</div>
          </div>
        </div>

        {/* 3 cards arriba */}
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="text-xs text-slate-500 mb-1">Registrar Entrada</div>
            <div className="text-xl font-semibold">
              {today?.inAt ? "Ya registrado" : "—"}
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-slate-500 mb-1">Registrar Salida</div>
            <div className="text-xl font-semibold">
              {today?.outAt ? "Ya registrado" : "—"}
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-xs text-slate-500 mb-1">Estado</div>
            <div className="mt-1">{statusBadge}</div>
          </Card>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Estado del día */}
        <Card className="p-5 md:col-span-2">
          <div className="text-sm font-semibold mb-3">Estado del día</div>

          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-xs text-slate-500">Entrada Hoy</div>
              <div className="font-semibold mt-1">{fmtTime(today?.inAt)}</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-slate-500">Salida Hoy</div>
              <div className="font-semibold mt-1">{fmtTime(today?.outAt)}</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-slate-500">Horas trabajadas</div>
              <div className="font-semibold mt-1">{workedText}</div>
            </Card>

            <Card className="p-4">
              <div className="text-xs text-slate-500">Pausas</div>
              <div className="font-semibold mt-1">
                {today?.breaksMinutes ? `${today.breaksMinutes} min` : "—"}
              </div>
            </Card>
          </div>
        </Card>

        {/* Estadísticas del mes */}
        <Card className="p-5">
          <div className="text-sm font-semibold mb-3">Estadísticas del mes</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="font-bold text-lg">{stats?.daysWorked ?? 0}</div>
              <div className="text-slate-600">días presentes</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <div className="font-bold text-lg">{stats?.lates ?? 0}</div>
              <div className="text-slate-600">tardanzas</div>
            </div>
            <div className="rounded-xl bg-rose-50 p-3">
              <div className="font-bold text-lg">{stats?.absences ?? 0}</div>
              <div className="text-slate-600">ausencias</div>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3">
              <div className="font-bold text-lg">{stats?.totalHours ?? "0.0"}</div>
              <div className="text-slate-600">h totales</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 col-span-2 text-center">
              Asistencia total: <b>{stats?.attendancePct ?? 0}%</b>
            </div>
          </div>
        </Card>
      </div>

      {/* Historial */}
      <Card className="p-5">
        <div className="text-sm font-semibold mb-3">Historial de asistencia</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-2">Día</th>
                <th className="text-left">Fecha</th>
                <th className="text-left">Entrada</th>
                <th className="text-left">Salida</th>
                <th className="text-left">Horas</th>
                <th className="text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td className="py-3 text-slate-400" colSpan={6}>Cargando…</td>
                </tr>
              ) : hist.length ? (
                hist.map((h: any) => {
                  const d = dayjs(h.date);
                  const minutes =
                    h.totalMinutes ||
                    (h.inAt && h.outAt
                      ? Math.max(0, Math.round((h.outAt - h.inAt) / 60000))
                      : 0);
                  const hh = Math.floor(minutes / 60);
                  const mm = minutes % 60;

                  const state =
                    h.status === "late" ? (
                      <Badge tone="amber">Tardanza</Badge>
                    ) : h.status === "absent" ? (
                      <Badge tone="rose">Ausente</Badge>
                    ) : (
                      <Badge tone="emerald">Presente</Badge>
                    );

                  return (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="py-2 capitalize">{d.format("ddd")}</td>
                      <td>{d.format("DD/MM/YYYY")}</td>
                      <td>{fmtTime(h.inAt)}</td>
                      <td>{fmtTime(h.outAt)}</td>
                      <td>{hh}h {mm}min</td>
                      <td>{state}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>
                    Sin registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end">
        <Link
          to="/app/attendance"
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-medium"
        >
          Volver
        </Link>
      </div>
    </div>
  );
}
