// src/features/sensors/SensorList.tsx
import { Link } from "react-router-dom";
import type { Sensor } from "./types";
import { deleteSensor } from "./api";

export default function SensorList({
  items,
  onShow,
  onEdit,
  onDelete,
}: {
  items: Sensor[];
  onShow?: (s: Sensor)=>void;
  onEdit?: (s: Sensor)=>void;
  onDelete?: (s: Sensor)=>void;
}) {
  return (
    <div className="table-surface p-3">
      <table className="w-full text-sm">
        <thead className="th-soft">
          <tr>
            <th className="p-3 text-left">ID</th>
            <th className="p-3 text-left">Trabajador</th>
            <th className="p-3 text-left">Tipo / Topic</th>
            <th className="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map(s => (
            <tr key={s.id} className="row-hover">
              <td className="p-3 id-mono">{s.id}</td>
              <td className="p-3">
                <div className="font-medium">{s.workerName}</div>
                <div className="text-xs text-slate-500">{s.workerId}</div>
              </td>
              <td className="p-3">
                <div className="flex gap-2 items-center">
                  <span className="chip">{s.type}</span>
                  <span className="chip">{s.topic}</span>
                  <span className="chip">/{s.subscription}</span>
                </div>
              </td>
            <td className="p-3">
            <div className="flex justify-end gap-2">
                <Link to={`/app/sensors/${s.id}`} className="btn" title="Ver">Ver</Link>
                <button className="icon-btn" title="Editar" onClick={()=>onEdit?.(s)}>✏️</button>
                <button className="icon-btn danger" title="Eliminar" onClick={async ()=>{ if(confirm("Eliminar sensor?")){ await deleteSensor(s.id!); onDelete?.(s); }}}>🗑</button>
            </div>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
