// src/lib/mqttBind.ts
import { client as mqtt } from "./mqttClient";
import { useEmergencyStore } from "./emergencyStore";

// Llama a esto una sola vez al arrancar la app (o al cargar los sensores)
let bound = false;

export function bindEsp32ToSensor(opts: {
  topicBase: string;        // p.e. "topic1"
  sensorId: string;         // ID Firestore, p.e. "MGMWP..."
  workerName: string;       // "Frank ..."
  workerId?: string;        // si lo tienes en el doc
}) {
  if (bound) return; // evitar doble binding
  bound = true;

  const { topicBase, sensorId, workerName, workerId } = opts;
  const base = topicBase.replace(/\/+$/, "");

  // escuchamos TODO del sensor
  const topics = [`${base}/#`];
  mqtt.subscribe(topics);

  const onMsg = (topic: string, payload: Buffer) => {
    const text = payload.toString();

    // /emergency: { pressed: true|false, ts, workerName? }
    if (topic.endsWith("/emergency")) {
      try {
        const json = JSON.parse(text || "{}");
        const pressed = !!json.pressed;

        if (pressed) {
          useEmergencyStore.getState().setPanic({
            active: true,
            sensorId,
            workerName: json.workerName || workerName,
            workerId,
            lastTs: Number(json.ts) || Math.floor(Date.now() / 1000),
          });
        } else {
          useEmergencyStore.getState().clear();
        }
      } catch {
        // ignorar
      }
      return;
    }

    // /gps: { ts, fix, lat, lng, ... }  -> guardamos coords para mostrar en overlay
    if (topic.endsWith("/gps")) {
      try {
        const j = JSON.parse(text || "{}");
        if (j && j.fix && j.lat != null && j.lng != null) {
          useEmergencyStore.getState().setPanic({
            lastLat: Number(j.lat),
            lastLng: Number(j.lng),
          });
        }
      } catch {}
      return;
    }
  };

  mqtt.on("message", onMsg);
}
