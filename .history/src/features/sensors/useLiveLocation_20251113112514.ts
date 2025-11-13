// src/features/sensors/useLiveLocation.ts
import { useEffect, useState } from "react";
import { getMqttClient } from "../../lib/mqttClient";

export type LivePoint = {
  lat: number;
  lng: number;
  timestamp: number;
  raw: string;
};

export type LiveLocationState = {
  connected: boolean;
  lastPoint: LivePoint | null;
  history: LivePoint[];
  lastPayload: string | null;
};

const MAX_HISTORY = 50;

export function useLiveLocation(topic: string): LiveLocationState {
  const [connected, setConnected] = useState(false);
  const [lastPoint, setLastPoint] = useState<LivePoint | null>(null);
  const [history, setHistory] = useState<LivePoint[]>([]);
  const [lastPayload, setLastPayload] = useState<string | null>(null);

  useEffect(() => {
    const client = getMqttClient();

    const handleConnect = () => setConnected(true);
    const handleClose = () => setConnected(false);

    client.on("connect", handleConnect);
    client.on("close", handleClose);

    client.subscribe(topic, { qos: 0 }, (err) => {
      if (err) console.error("[MQTT] Error al suscribirse:", err.message);
      else console.log("[MQTT] Suscrito a", topic);
    });

    const handleMessage = (t: string, payload: Uint8Array) => {
      if (t !== topic) return;

      const payloadStr = new TextDecoder().decode(payload);
      setLastPayload(payloadStr);

      try {
        const data = JSON.parse(payloadStr);

        // ADAPTA ESTOS NOMBRES A TU PAYLOAD REAL
        const lat = data.lat ?? data.latitude ?? data.latitud;
        const lng = data.lng ?? data.lon ?? data.longitud;

        if (typeof lat === "number" && typeof lng === "number") {
          const point: LivePoint = {
            lat,
            lng,
            timestamp: Date.now(),
            raw: payloadStr,
          };

          setLastPoint(point);
          setHistory((prev) => {
            const next = [point, ...prev];
            return next.slice(0, MAX_HISTORY);
          });
        } else {
          console.warn("[MQTT] Payload sin coordenadas válidas:", data);
        }
      } catch (e) {
        console.warn("[MQTT] Payload no es JSON válido:", payloadStr);
      }
    };

    client.on("message", handleMessage);

    return () => {
      try {
        client.off("connect", handleConnect);
        client.off("close", handleClose);
        client.off("message", handleMessage);
        client.unsubscribe(topic);
      } catch (e) {
        console.warn("[MQTT] Error limpiando listeners:", e);
      }
    };
  }, [topic]);

  return { connected, lastPoint, history, lastPayload };
}
