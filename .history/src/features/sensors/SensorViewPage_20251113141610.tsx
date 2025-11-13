// src/features/sensors/SensorViewPage.tsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import { subscribeSensor } from "./api";
import type { Sensor } from "./types";
import MapTrack from "./MapTrack";
import { client as mqtt } from "../../lib/mqttClient";

type StatusKey =
  | "no-data"
  | "connected"
  | "unstable"
  | "disconnected"
  | "gps-lost"
  | "emergency";

type HistoryItem = {
  ts: number;
  payload: string;
};

const MAX_HISTORY = 50;

function computeStatus(s?: Sensor): StatusKey {
  if (!s) return "no-data";
  if ((s as any).emergency) return "emergency";
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

  // 1) Escuchar cambios del sensor en Firestore
  useEffect(() => {
    if (!sid) return;
    const off = subscribeSensor(sid, (s) => setSensor(s));
    return () => off && off();
  }, [sid]);

  // 2) Suscripción MQTT directa (Flespi)
  useEffect(() => {
    // topic principal: el del sensor, y si no hay, usamos el .env o esp32/test
    const topicFromSensor = sensor?.topic;
    const envTopic =
      (import.meta as any).env.VITE_MQTT_TOPIC || "esp32/test";
    const topic = topicFromSensor || envTopic;

    if (!topic) return;

    const topics = [topic];

    console.log("[MQTT][SensorView] Subscribiendo a", topics);
    mqtt.subscribe(topics, (err, granted) => {
      if (err) {
        console.error("[MQTT][SensorView] Error al suscribirse:", err);
      } else {
        console.log("[MQTT][SensorView] Subscrito:", granted);
      }
    });

    const onMsg = (msgTopic: string, payload: any) => {
      if (msgTopic !== topic) return;

      const text =
        typeof payload === "string"
          ? payload
          : tdRef.current.decode(payload as Uint8Array);

      const now = Date.now();

      // Historial (últimos MAX_HISTORY)
      setHistory((prev) => {
        const next: HistoryItem[] = [
          { ts: now, payload: text },
          ...prev,
        ];
        return next.slice(0, MAX_HISTORY);
      });

      // Intentar parsear JSON para actualizar lectura + ubicación
      try {
        const json = JSON.parse(text);
        const hasLat =
          typeof json.lat === "number" || typeof json.lat === "string";
        const hasLng =
          typeof json.lng === "number" || typeof json.lng === "string";

        const latNum = hasLat ? Number(json.lat) : undefined;
        const lngNum = hasLng ? Number(json.lng) : undefined;

        setSensor((prev) => {
          if (!prev) return prev;

          const base: any = {
            ...prev,
            lastReading: json,
            lastSeenAt: { seconds: Math.floor(now / 1000) },
          };

          // Actualizar ubicación + track cuando vienen lat/lng
          if (latNum != null && !Number.isNaN(latNum) &&
              lngNum != null && !Number.isNaN(lngNum)) {
            base.location = { lat: latNum, lng: lngNum };

            const oldTrack =
              ((prev as any).track as { lat: number; lng: number; ts?: number }[] | undefined) ||
              [];

            base.track = [
              ...oldTrack,
              { lat: latNum, lng: lngNum, ts: now },
            ].slice(-MAX_HISTORY);
          }

          return base as Sensor;
        });
      } catch (e) {
        console.warn("[MQTT][SensorView] Payload no JSON, guardando como texto", e);
        setSensor((prev) => {
          if (!prev) return prev;
          return {
            ...(prev as any),
            lastReading: text,
            lastSeenAt: { seconds: Math.floor(now / 1000) },
          } as Sensor;
        });
      }
    };

    mqtt.on("message", onMsg);

    return () => {
      mqtt.off("message", onMsg);
      mqtt.unsubscribe(topics);
    };
  }, [sensor?.topic]);

  const status = useMemo(() => computeStatus(sensor), [sensor]);

  const lastSeenSeconds = sensor?.lastSeenAt?.seconds;
  const track =
    ((sensor as any)?.track as { lat: number; lng: number; ts?: number }[]) ||
    [];
  const topicLabel =
    sensor?.topic || (import.meta as any).env.VITE_MQTT_TOPIC || "esp32/test";

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
                Topic: <strong>{topicLabel}</strong>{" "}
                / {sensor?.subscription || "—"}
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
        <section className="rounded-2xl ring-1 ring-slate-200/70 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Estado</h3>
            <StatusBadge status={status} />
          </div>

          <div className="text-sm text-slate-600">
            Último visto:{" "}
            <span className="font-medium">
              {sensor?.lastSeenAt?.seconds
                ? new Date(
                    sensor.lastSeenAt.seconds * 1000
                  ).toLocaleString()
                : "—"}
            </span>
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-1">Última lectura</div>
            <pre className="p-3 rounded-xl bg-slate-50 text-sm overflow-auto">
              {JSON.stringify(sensor?.lastReading ?? { msg: "—" }, null, 2)}
            </pre>
          </div>

          {/* Historial simple de mensajes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">
                Historial de mensajes ({topicLabel})
              </span>
              <span className="text-xs text-slate-500">
                {history.length} mensajes
              </span>
            </div>
            <div className="border rounded-xl max-h-64 overflow-auto text-xs font-mono bg-slate-50">
              {history.length === 0 ? (
                <div className="p-3 text-slate-500">
                  Aún no hay mensajes recibidos desde Flespi.
                </div>
              ) : (
                history.map((h, idx) => (
                  <div
                    key={h.ts + "-" + idx}
                    className="border-b last:border-b-0 p-2"
                  >
                    <div className="text-[10px] text-slate-500 mb-1">
                      {new Date(h.ts).toLocaleString()}
                    </div>
                    <pre className="whitespace-pre-wrap break-words">
                      {h.payload}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Ubicación / Mapa con pulso y trayectoria */}
        <section className="rounded-2xl ring-1 ring-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Ubicación en tiempo real</h3>
            {sensor?.location && (
              <a
                className="text-sm text-sky-700 hover:underline"
                target="_blank"
                rel="noreferrer"
                href={`https://maps.google.com/?q=${sensor.location.lat},${sensor.location.lng}&travelmode=walking`}
              >
                Abrir en Maps
              </a>
            )}
          </div>

          <div className="mt-1">
            <MapTrack
              lat={sensor?.location?.lat}
              lng={sensor?.location?.lng}
              lastSeenAt={lastSeenSeconds}
              track={track}
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
            * Manda JSON desde Flespi/ESP32 así: {"{"}"lat": -16.409047, "lng":
            -71.537451, "hello": "He"{"}"}.
          </p>
        </section>
      </div>
    </div>
  );
}
