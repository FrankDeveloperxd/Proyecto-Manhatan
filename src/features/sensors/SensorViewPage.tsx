// src/features/sensors/SensorViewPage.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { subscribeSensor } from "./api";
import type { Sensor } from "./types";
import MapTrack from "./MapTrack";
import { client as mqtt, DEFAULT_TOPIC } from "../../lib/mqttClient";

type StatusKey =
  | "no-data"
  | "connected"
  | "unstable"
  | "disconnected"
  | "gps-lost"
  | "emergency";

type HistoryItem = {
  id: number;
  ts: number;
  payload: string;
};

const TEC_SUP = {
  lat: -16.409047, // Tecsup Arequipa aprox
  lng: -71.537451,
};

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
    "no-data": {
      text: "Sin datos",
      cls: "bg-slate-100 text-slate-700 border",
    },
    connected: {
      text: "Conectado",
      cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
    unstable: {
      text: "Intermitente",
      cls: "bg-amber-100 text-amber-800 border border-amber-200",
    },
    disconnected: {
      text: "Desconectado",
      cls: "bg-slate-200 text-slate-700 border",
    },
    "gps-lost": {
      text: "Sin señal GPS",
      cls: "bg-sky-100 text-sky-800 border border-sky-200",
    },
    emergency: {
      text: "¡Emergencia!",
      cls: "bg-red-100 text-red-700 border border-red-200",
    },
  } as const;
  const m = map[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${m.cls}`}>{m.text}</span>
  );
}

function SignalState({ status }: { status: StatusKey }) {
  const msg = {
    "no-data": "Aún no hay datos del dispositivo.",
    "gps-lost": "Señal GPS débil o perdida (esperando fix).",
    unstable: "Fuente intermitente, esperando nueva lectura.",
    disconnected: "El dispositivo no se reporta hace varios minutos.",
    connected: "Conectado.",
    emergency: "Emergencia activa.",
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

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const tdRef = useRef(new TextDecoder());

  // 1) Traer datos base del sensor desde Firestore (nombre trabajador, etc.)
  useEffect(() => {
    if (!sid) return;
    const off = subscribeSensor(sid, setSensor);
    return () => off && off();
  }, [sid]);

  // 2) Suscribirse a MQTT (esp32/test) y actualizar:
  //    - lastReading
  //    - lastSeenAt
  //    - location (si viene lat/lng)
  //    - historial
  useEffect(() => {
    const topic = DEFAULT_TOPIC; // "esp32/test"

    console.log("[MQTT] Suscribiendo desde SensorViewPage a", topic);
    mqtt.subscribe(topic, (err, granted) => {
      if (err) {
        console.error("[MQTT] Error al suscribirse:", err);
      } else {
        console.log("[MQTT] Suscripción OK:", granted);
      }
    });

    const onMsg = (msgTopic: string, payload: any) => {
      if (msgTopic !== topic) return; // solo escuchamos esp32/test

      const now = Date.now();
      const text =
        typeof payload === "string" ? payload : tdRef.current.decode(payload);

      console.log("[MQTT] Mensaje recibido en", msgTopic, ":", text);

      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        // si no es JSON, igual lo guardamos como texto
      }

      // Actualizar estado del sensor en memoria
      setSensor((prev) => {
        if (!prev) return prev; // si aún no cargó desde Firestore, no tocamos

        const next: Sensor = { ...prev };

        next.lastSeenAt = { seconds: Math.floor(now / 1000) };

        if (json && typeof json === "object") {
          next.lastReading = json;

          if (
            json.lat != null &&
            json.lng != null &&
            !Number.isNaN(Number(json.lat)) &&
            !Number.isNaN(Number(json.lng))
          ) {
            next.location = {
              lat: Number(json.lat),
              lng: Number(json.lng),
            };
          }
        } else {
          // no es JSON, guardamos texto plano
          next.lastReading = { raw: text };
        }

        return next;
      });

      // Guardar en historial
      const pretty =
        json && typeof json === "object"
          ? JSON.stringify(json, null, 2)
          : text;

      setHistory((prev) => {
        const item: HistoryItem = {
          id: now,
          ts: now,
          payload: pretty,
        };
        const next = [item, ...prev];
        return next.slice(0, 50); // últimos 50
      });
    };

    mqtt.on("message", onMsg);

    return () => {
      mqtt.off("message", onMsg);
      mqtt.unsubscribe(topic);
      console.log("[MQTT] Desuscrito de", topic);
    };
  }, []);

  const status = useMemo(() => computeStatus(sensor), [sensor]);

  const lastSeen = sensor?.lastSeenAt?.seconds
    ? sensor.lastSeenAt.seconds
    : undefined;

  const track =
    (sensor as any)?.track as { lat: number; lng: number; ts?: number }[] |
    undefined;

  const hasCoord = !!sensor?.location;
  const mapLat = sensor?.location?.lat ?? TEC_SUP.lat;
  const mapLng = sensor?.location?.lng ?? TEC_SUP.lng;

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
                Topic: <strong>{DEFAULT_TOPIC}</strong> /{" "}
                {sensor?.subscription || "—"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={status} />
              <Link
                to="/app/sensors"
                className="rounded-lg bg-white/15 hover:bg-white/25 px-3 py-1 text-sm"
              >
                Volver
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Estado + lectura + historial */}
        <section className="rounded-2xl ring-1 ring-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Estado</h3>
            <StatusBadge status={status} />
          </div>

          <div className="mt-3 text-sm text-slate-600">
            Último visto:{" "}
            <span className="font-medium">
              {sensor?.lastSeenAt?.seconds
                ? new Date(
                    sensor.lastSeenAt.seconds * 1000
                  ).toLocaleString()
                : "—"}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-sm text-slate-600 mb-1">Última lectura</div>
            <pre className="p-3 rounded-xl bg-slate-50 text-sm overflow-auto">
              {JSON.stringify(sensor?.lastReading ?? { msg: "—" }, null, 2)}
            </pre>
          </div>

          {/* Historial de mensajes */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-slate-700">
                Historial de mensajes (esp32/test)
              </h4>
              <span className="text-xs text-slate-500">
                {history.length} mensajes
              </span>
            </div>
            <div className="max-h-56 overflow-y-auto rounded-xl border bg-slate-50 text-xs font-mono text-slate-700">
              {history.length === 0 ? (
                <div className="p-3 text-slate-500">
                  Aún no hay mensajes. Publica en{" "}
                  <code>esp32/test</code> desde Flespi o desde el ESP32.
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    className="border-b last:border-b-0 px-3 py-2"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">
                      {new Date(h.ts).toLocaleString()}
                    </div>
                    <pre className="whitespace-pre-wrap text-[11px]">
                      {h.payload}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Ubicación / mapa */}
        <section className="rounded-2xl ring-1 ring-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Ubicación en tiempo real</h3>
            {hasCoord && (
              <a
                className="text-sm text-sky-700 hover:underline"
                target="_blank"
                rel="noreferrer"
                href={`https://maps.google.com/?q=${mapLat},${mapLng}`}
              >
                Abrir en Maps
              </a>
            )}
          </div>

          <div className="mt-3">
            <MapTrack
              lat={mapLat}
              lng={mapLng}
              lastSeenAt={lastSeen}
              track={track || []}
              accuracy={12}
            />
          </div>

          {!hasCoord && (
            <div className="rounded-xl border bg-slate-50 text-slate-700 text-sm p-3 mt-3">
              Mostrando ubicación por defecto (Tecsup Arequipa). El mapa se
              actualizará automáticamente cuando llegue un JSON con{" "}
              <code>lat</code> y <code>lng</code>.
            </div>
          )}

          <p className="text-xs text-slate-500 mt-3">
            * Manda JSON desde Flespi/ESP32 así:
            <br />
            <code>
              {"{"}"lat": -16.409047, "lng": -71.537451, "hello": "He"{"}"}
            </code>
          </p>
        </section>
      </div>

      {/* Mensaje de estado general */}
      <SignalState status={status} />
    </div>
  );
}
