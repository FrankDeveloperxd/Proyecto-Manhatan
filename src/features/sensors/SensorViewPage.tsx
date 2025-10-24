// src/features/sensors/SensorViewPage.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { subscribeSensor } from "./api";
import type { Sensor } from "./types";
import MapTrack from "./MapTrack"; // 👈 usamos el mapa con pulso/recorrido

type StatusKey = "no-data" | "connected" | "unstable" | "disconnected" | "gps-lost" | "emergency";

function computeStatus(s?: Sensor): StatusKey {
  if (!s) return "no-data";
  if (s.emergency) return "emergency";
  if (!s.lastSeenAt?.seconds) return "no-data";
  const age = Date.now() - s.lastSeenAt.seconds * 1000;
  if (!s.location) return age < 5 * 60_000 ? "gps-lost" : "disconnected";
  if (age < 60_000) return "connected";
  if (age < 5 * 60_000) return "unstable";
  return "disconnected";
}

function StatusBadge({ status }: { status: StatusKey }) {
  const map = {
    "no-data":     { text: "Sin datos",     cls: "bg-slate-100 text-slate-700 border" },
    "connected":   { text: "Conectado",     cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    "unstable":    { text: "Intermitente",  cls: "bg-amber-100 text-amber-800 border border-amber-200" },
    "disconnected":{ text: "Desconectado",  cls: "bg-slate-200 text-slate-700 border" },
    "gps-lost":    { text: "Sin señal GPS", cls: "bg-sky-100 text-sky-800 border border-sky-200" },
    "emergency":   { text: "¡Emergencia!",  cls: "bg-red-100 text-red-700 border border-red-200" },
  } as const;
  const m = map[status];
  return <span className={`px-2 py-1 rounded-full text-xs ${m.cls}`}>{m.text}</span>;
}

function SignalState({ status }: { status: StatusKey }) {
  const msg = {
    "no-data": "Aún no hay datos del dispositivo.",
    "gps-lost": "Señal GPS débil o perdida (esperando fix).",
    "unstable": "Fuente intermitente, esperando nueva lectura.",
    "disconnected": "El dispositivo no se reporta hace varios minutos.",
    "connected": "Conectado.",
    "emergency": "Emergencia activa.",
  }[status];
  return (
    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 text-slate-700">
      {msg}
    </div>
  );
}

export default function SensorViewPage() {
  const { sid } = useParams();
  const [sensor, setSensor] = useState<Sensor | undefined>(undefined);

  useEffect(() => {
    if (!sid) return;
    const off = subscribeSensor(sid, setSensor);
    return () => off && off();
  }, [sid]);

  const status = useMemo(() => computeStatus(sensor), [sensor]);

  // 👇 calcula valores para MapTrack ANTES del return
  const lastSeen = sensor?.lastSeenAt?.seconds
    ? sensor.lastSeenAt.seconds
    : undefined;

  const track = (sensor as any)?.track as { lat: number; lng: number; ts?: number }[] | undefined;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="rounded-3xl overflow-hidden shadow-[0_20px_30px_-20px_rgba(0,0,0,.25)] ring-1 ring-slate-200/70">
        <div className="px-6 py-5 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                Sensor • {sensor?.workerName || "—"}
              </div>
              <div className="text-sm text-white/85">
                Topic: <strong>{sensor?.topic || "—"}</strong> / {sensor?.subscription || "—"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={status} />
              <Link to="/app/sensors" className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1 text-sm">Volver</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Estado + lectura */}
        <section className="rounded-2xl ring-1 ring-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Estado</h3>
            <StatusBadge status={status} />
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Último visto:{" "}
            <span className="font-medium">
              {sensor?.lastSeenAt?.seconds
                ? new Date(sensor.lastSeenAt.seconds * 1000).toLocaleString()
                : "—"}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-sm text-slate-600 mb-1">Última lectura</div>
            <pre className="p-3 rounded-xl bg-slate-50 text-sm overflow-auto">
{JSON.stringify(sensor?.lastReading ?? { msg: "—" }, null, 2)}
            </pre>
          </div>

          {/* Métricas simuladas */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">Temperatura Corporal</div>
              <div className="text-xl font-semibold">36.9°C</div>
              <span className="mt-1 inline-block rounded-full bg-amber-100 text-amber-800 text-xs px-2 py-0.5">Moderado</span>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">Humedad Ambiente</div>
              <div className="text-xl font-semibold">57%</div>
              <span className="mt-1 inline-block rounded-full bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">Normal</span>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">Actividad Física</div>
              <div className="text-xl font-semibold">Moderado</div>
              <span className="mt-1 inline-block rounded-full bg-amber-100 text-amber-800 text-xs px-2 py-0.5">Moderado</span>
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs text-slate-500">Nivel de Luz</div>
              <div className="text-xl font-semibold">442 lux</div>
              <span className="mt-1 inline-block rounded-full bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">Normal</span>
            </div>
          </div>
        </section>

        {/* Ubicación / Mapa con pulso y trayectoria */}
        <section className="rounded-2xl ring-1 ring-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Ubicación en tiempo real</h3>
            {sensor?.location && (
              <a className="text-sm text-sky-700 hover:underline"
                 target="_blank"
                 href={`https://maps.google.com/?q=${sensor.location.lat},${sensor.location.lng}`}>
                Abrir en Maps
              </a>
            )}
          </div>

          <div className="mt-3">
            <MapTrack
              lat={sensor?.location?.lat}
              lng={sensor?.location?.lng}
              lastSeenAt={lastSeen}
              track={track || []}
              accuracy={12}
            />
          </div>

          {(!sensor?.location || !sensor?.lastSeenAt) && (
            <div className="rounded-xl border bg-slate-50 text-slate-700 text-sm p-3 mt-3">
              {!sensor?.lastSeenAt
                ? "Aún no hay datos del dispositivo."
                : "Sin señal. Mostrando última ubicación conocida."}
            </div>
          )}

          <p className="text-xs text-slate-500 mt-3">
            * Mapa real (OpenStreetMap). El punto rojo parpadea cuando hay señal.
          </p>
        </section>
      </div>
    </div>
  );
}
