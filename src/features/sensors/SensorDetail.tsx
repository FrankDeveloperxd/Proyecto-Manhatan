// src/features/sensors/SensorDetail.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { client as mqtt } from "../../lib/mqttClient"; // ajusta ruta si tu proyecto la tiene distinta
import { subscribeSensor } from "./api";
import type { Sensor } from "./types";

const nowTs = () => ({ seconds: Math.floor(Date.now() / 1000) });

export default function SensorDetail({
  sensor,
  onClose,
}: {
  sensor: Sensor;
  onClose: () => void;
}) {
  const [live, setLive] = useState<Sensor | undefined>(sensor);
  const tdRef = useRef(new TextDecoder()); // decodificador para payloads MQTT (Uint8Array)
  const navigate = useNavigate();
  const location = useLocation();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Mantén espejo con Firestore (si usas docs)
  useEffect(() => {
    if (!sensor?.id) return;
    const off = subscribeSensor(sensor.id, (s) => {
      if (!mounted.current) return;
      setLive(s);
    });
    return () => off && off();
  }, [sensor?.id]);

  // Suscripción directa a MQTT (flespi)
  useEffect(() => {
    const base = live?.topic || sensor.topic; // ej "topic1"
    if (!base) return;

    const topics = [`${base}/#`];
    // subscribe con callback para ver granted
    mqtt.subscribe(topics, (err, granted) => {
      console.log("[MQTT] subscribed", { base, err, granted });
    });

    const onMsg = (topic: string, payload: any) => {
      const text =
        typeof payload === "string" ? payload : tdRef.current.decode(payload);
      console.log("[MQTT] msg", topic, text);

      if (topic.endsWith("/status")) {
        // status: texto online/offline
        setLive((prev) => (prev ? { ...prev, lastSeenAt: nowTs() } : prev));
        return;
      }

      // Intenta parsear JSON
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch (e) {
        // no JSON -> ignorar (salvo que quieras tratarlo)
        console.warn("[MQTT] payload no-JSON", e);
      }

      // GPS
      if (topic.endsWith("/gps") && json) {
        const hasFix =
          json && json.fix && json.lat != null && json.lng != null;
        setLive((prev) =>
          prev
            ? {
                ...prev,
                lastReading: json,
                lastSeenAt: nowTs(),
                location: hasFix
                  ? { lat: Number(json.lat), lng: Number(json.lng) }
                  : prev.location,
              }
            : prev
        );
      }

      // EMERGENCY
      if (topic.endsWith("/emergency")) {
        // Si payload JSON viene como { pressed: true, ts: ... }
        const pressed = json ? !!json.pressed : false;
        console.log("[MQTT] emergency pressed:", pressed);

        setLive((prev) =>
          prev
            ? { ...prev, emergency: pressed, lastSeenAt: nowTs() }
            : prev
        );

        // Si hay emergencia activa: llevar a página de sensores / detalle
        if (pressed) {
          // Si no estamos ya en la página del sensor, navegamos
          const desiredPath = `/app/sensors/${sensor.id}`;
          if (!location.pathname.startsWith(desiredPath)) {
            // navegamos para que el usuario vea la ficha completa
            navigate(desiredPath, { replace: false });
          }
        }
      }

      // TRACK u otros
      if (topic.endsWith("/track") && json) {
        // si quieres guardar historial en live.track, hazlo aquí
        setLive((prev) => (prev ? { ...prev, lastSeenAt: nowTs() } : prev));
      }
    };

    mqtt.on("message", onMsg);
    return () => {
      mqtt.off("message", onMsg);
      mqtt.unsubscribe(topics);
    };
  }, [sensor.topic, live?.topic, sensor.id, navigate, location.pathname]);

  const status = useMemo(() => computeStatus(live), [live]);
  const coord = live?.location;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="bg-white rounded-2xl p-0 w-[min(1100px,95%)] max-h-[90vh] overflow-auto shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">
                Sensor • {live?.workerName || sensor.workerName}
              </div>
              <button className="text-white/90 hover:text-white" onClick={onClose}>
                Cerrar
              </button>
            </div>
            <div className="text-sm text-white/85">
              Topic: <strong>{live?.topic || sensor.topic}</strong> / {live?.subscription || sensor.subscription}
            </div>
          </div>

          <div className="p-6 grid lg:grid-cols-2 gap-5">
            {/* Estado + última lectura */}
            <section className="rounded-2xl border bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Estado</h4>
                <StatusBadge status={status} />
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Último visto:{" "}
                <span className="font-medium">
                  {live?.lastSeenAt?.seconds
                    ? new Date(live.lastSeenAt.seconds * 1000).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-sm text-slate-600 mb-1">Última lectura</div>
                <pre className="p-3 rounded-xl bg-slate-50 text-sm overflow-auto">
                  {JSON.stringify(live?.lastReading ?? { msg: "—" }, null, 2)}
                </pre>
              </div>
            </section>

            {/* Mapa / señal */}
            <section className="rounded-2xl border bg-white/80 p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Ubicación</h4>
                {coord ? (
                  <a className="text-sm text-sky-700 hover:underline"
                     href={`https://maps.google.com/?q=${coord.lat},${coord.lng}`} target="_blank" rel="noreferrer">
                    Abrir en Maps
                  </a>
                ) : null}
              </div>

              <div className="mt-3">
                {coord ? (
                  <div className="rounded-xl overflow-hidden border">
                    <MapFallback lat={coord.lat} lng={coord.lng} />
                  </div>
                ) : (
                  <SignalState status={status} />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Overlay de EMERGENCIA a pantalla completa */}
      {live?.emergency ? (
        <div className="fixed inset-0 z-50 grid place-content-center bg-red-900/95 text-white p-6">
          <div className="max-w-3xl text-center rounded-lg bg-white/10 p-6">
            <div className="text-4xl font-extrabold mb-3">¡EMERGENCIA!</div>
            <div className="text-xl mb-2">{live.workerName} • {live.workerId}</div>
            {live.location ? (
              <div className="mb-4">
                Ubicación: {live.location.lat.toFixed(6)}, {live.location.lng.toFixed(6)}
              </div>
            ) : (
              <div className="mb-4">Sin ubicación válida (esperando fix)</div>
            )}

            <div className="flex gap-3 justify-center">
              {live.location && (
                <a className="rounded-lg px-4 py-2 bg-white text-red-800 font-semibold"
                   target="_blank"
                   rel="noreferrer"
                   href={`https://maps.google.com/?q=${live.location.lat},${live.location.lng}`}>
                  Abrir en Maps
                </a>
              )}
              <button
                className="rounded-lg px-4 py-2 bg-white/20"
                onClick={() => alert("Notificar contactos (implementar)")}
              >
                Notificar contactos
              </button>
              <button
                className="rounded-lg px-4 py-2 bg-white/30"
                onClick={() => {
                  // cerrar overlay: aquí removemos flag emergency localmente (no borramos en backend)
                  setLive((prev) => (prev ? { ...prev, emergency: false } : prev));
                  onClose();
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* ---------- lógica de estados ---------- */
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
    "no-data":     { text: "Sin datos",        cls: "bg-slate-100 text-slate-700 border" },
    "connected":   { text: "Conectado",        cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    "unstable":    { text: "Intermitente",     cls: "bg-amber-100 text-amber-800 border border-amber-200" },
    "disconnected":{ text: "Desconectado",     cls: "bg-slate-200 text-slate-700 border" },
    "gps-lost":    { text: "Sin señal GPS",    cls: "bg-sky-100 text-sky-800 border border-sky-200" },
    "emergency":   { text: "¡Emergencia!",     cls: "bg-red-100 text-red-700 border border-red-200" },
  } as const;
  const m = map[status];
  return <span className={`px-2 py-1 rounded-full text-xs ${m.cls}`}>{m.text}</span>;
}

/* Fallback de mapa */
function MapFallback({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div style={{height: 260}} className="grid place-content-center text-sm text-slate-600 bg-slate-50">
      Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
    </div>
  );
}

/* Texto cuando NO hay ubicación */
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
