import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTopicRegistry } from "../../lib/topicRegistry";
import { bindAllSensorsOnce } from "../../lib/mqttBindAll";
import { getSensors, deleteSensor } from "./api";

type UiSensor = {
  id: string;
  workerName: string;
  workerId?: string;
  topic: string;
  type?: string;
  subscription?: string;
};

export default function SensorList() {
  const setAll = useTopicRegistry((s) => s.setAll);
  const removeBySensorId = useTopicRegistry((s) => s.removeBySensorId);

  const [items, setItems] = useState<UiSensor[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sensors: UiSensor[] = await getSensors();
      setItems(sensors);

      setAll(
        sensors.map((s) => ({
          topic: s.topic,
          sensorId: s.id,
          workerName: s.workerName,
          workerId: s.workerId,
        }))
      );

      bindAllSensorsOnce();
    })();
  }, [setAll]);

  const handleDelete = async (s: UiSensor) => {
    if (!confirm(`¿Eliminar el sensor de ${s.workerName}?`)) return;
    try {
      setBusyId(s.id);
      await deleteSensor(s.id);
      // Quitar de UI
      setItems((prev) => prev.filter((x) => x.id !== s.id));
      // Quitar del registro para que el overlay deje de mapear ese topic
      removeBySensorId(s.id);
    } catch (e) {
      alert("No se pudo eliminar. Revisa permisos/reglas.");
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

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
          {items.map((s) => (
            <tr key={s.id} className="row-hover">
              <td className="p-3 id-mono">{s.id}</td>
              <td className="p-3">
                <div className="font-medium">{s.workerName}</div>
                {s.workerId && (
                  <div className="text-xs text-slate-500">{s.workerId}</div>
                )}
              </td>
              <td className="p-3">
                <div className="flex gap-2 items-center">
                  {s.type && <span className="chip">{s.type}</span>}
                  <span className="chip">{s.topic}</span>
                  {s.subscription && (
                    <span className="chip">/{s.subscription}</span>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="flex justify-end gap-2">
                  <Link to={`/app/sensors/${s.id}`} className="btn" title="Ver">
                    Ver
                  </Link>
                  <button
                    className="btn danger"
                    title="Eliminar"
                    disabled={busyId === s.id}
                    onClick={() => handleDelete(s)}
                  >
                    {busyId === s.id ? "Eliminando…" : "Eliminar"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td className="p-6 text-center text-slate-500" colSpan={4}>
                No hay sensores cargados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
