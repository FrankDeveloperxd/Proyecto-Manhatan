import { Link } from "react-router-dom";
import { useEmergencyStore } from "../lib/emergencyStore";

export default function EmergencyOverlay() {
  const { active, workerName, sensorId, topicBase, clear } = useEmergencyStore();

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* fondo rojo parpadeante */}
      <div className="absolute inset-0 animate-pulse bg-red-800/90" />
      <div className="relative h-full grid place-content-center text-center text-white px-6">
        <div className="max-w-xl">
          <div className="text-4xl font-extrabold mb-2">⚠️ EMERGENCIA</div>
          <div className="text-lg mb-1">
            {workerName ? <b>{workerName}</b> : <b>Un trabajador</b>} necesita ayuda
          </div>
          {topicBase && (
            <div className="text-sm text-white/80 mb-6">Dispositivo: <code>{topicBase}</code></div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            {sensorId ? (
              <Link
                to={`/app/sensors/${sensorId}`}
                className="px-5 py-2 rounded-lg bg-white text-red-700 font-semibold shadow"
                onClick={clear}
              >
                Localizar trabajador
              </Link>
            ) : (
              <button className="px-5 py-2 rounded-lg bg-white text-red-700 font-semibold shadow" disabled>
                Localizar trabajador
              </button>
            )}
            <button
              onClick={clear}
              className="px-5 py-2 rounded-lg bg-white/10 border border-white/30 hover:bg-white/20"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
