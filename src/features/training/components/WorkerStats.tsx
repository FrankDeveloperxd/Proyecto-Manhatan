import { useEffect, useState } from "react";
import { getWorkerStats } from "../api";
import { WorkerStats } from "../types";

export default function WorkerStatsCards({ wid }: { wid: string }) {
  const [stats, setStats] = useState<WorkerStats | null>(null);
  useEffect(() => { (async () => setStats(await getWorkerStats(wid)))(); }, [wid]);
  if (!stats) return <div className="p-4">Cargando…</div>;

  const Item = ({label, value}:{label:string; value:number}) => (
    <div className="p-4 rounded-xl border">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Item label="En progreso" value={stats.inProgress} />
      <Item label="Certificados" value={stats.certificates} />
      <Item label="Horas completadas" value={stats.hoursCompleted} />
      <Item label="Cursos completos" value={stats.coursesCompleted} />
    </div>
  );
}
