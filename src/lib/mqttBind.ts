// src/lib/mqttBind.ts
import { client as mqtt } from "./mqttClient";
import { useEmergencyStore } from "./emergencyStore";

/**
 * Vincula un ESP32 con un sensor lógico del sistema.
 * Escucha mensajes MQTT y actualiza el estado global de emergencia.
 */
let bound = false;

export function bindEsp32ToSensor(opts: {
  topicBase: string;       // Ejemplo: "esp32/sensor123"
  sensorId: string;        // ID Firestore del sensor
  workerName: string;      // Nombre del trabajador
  workerId?: string;       // (opcional) ID del trabajador
}) {
  if (bound) return; // evita vincular más de una vez
  bound = true;

  const { topicBase, sensorId, workerName, workerId } = opts;
  const base = topicBase.replace(/\/+$/, ""); // limpia barras finales

  // Suscribirse a todos los subtemas del sensor
  const topics = [`${base}/#`];
  mqtt.subscribe(topics);

  // Callback al recibir mensajes MQTT
  const onMsg = (topic: string, payload: Buffer) => {
    const text = payload.toString();

    // ----------------------
    // 🔴 Mensajes de emergencia
    // ----------------------
    if (topic.endsWith("/emergency")) {
      try {
        const json = JSON.parse(text || "{}");
        const pressed = !!json.pressed;

        if (pressed) {
          // Activar alerta global
          useEmergencyStore.getState().trigger({
            workerName: json.workerName || workerName,
            sensorId,
            topicBase,
            ts: Number(json.ts) || Math.floor(Date.now() / 1000),
          });

          // ✅ Mostrar overlay visual (pantalla roja)
          const overlay = document.createElement("div");
          overlay.id = "emergency-overlay";
          overlay.style.position = "fixed";
          overlay.style.top = "0";
          overlay.style.left = "0";
          overlay.style.width = "100%";
          overlay.style.height = "100%";
          overlay.style.background = "rgba(200,0,0,0.95)";
          overlay.style.zIndex = "9999";
          overlay.style.display = "flex";
          overlay.style.flexDirection = "column";
          overlay.style.justifyContent = "center";
          overlay.style.alignItems = "center";
          overlay.style.color = "#fff";
          overlay.style.fontFamily = "sans-serif";
          overlay.style.fontSize = "1.5rem";
          overlay.style.textAlign = "center";

          overlay.innerHTML = `
            <h1 style="font-size:3rem;">🚨 EMERGENCIA ACTIVADA</h1>
            <p style="margin-top:1rem;">Trabajador: <strong>${json.workerName || workerName}</strong></p>
            <p style="opacity:0.8;">Sensor: ${sensorId}</p>
            <p style="margin-top:2rem;">Localizando...</p>
          `;

          // Agrega overlay si no existe
          if (!document.getElementById("emergency-overlay")) {
            document.body.appendChild(overlay);
          }

        } else {
          // Si el botón se suelta, limpiar alerta
          useEmergencyStore.getState().clear();
          const overlay = document.getElementById("emergency-overlay");
          if (overlay) overlay.remove();
        }
      } catch (err) {
        console.warn("Error al parsear /emergency:", err);
      }
      return;
    }

    // ----------------------
    // 📍 Mensajes GPS
    // ----------------------
    if (topic.endsWith("/gps")) {
      try {
        const j = JSON.parse(text || "{}");
        if (j && j.fix && j.lat != null && j.lng != null) {
          useEmergencyStore.getState().trigger({
            topicBase,
            sensorId,
            workerName,
            ts: Math.floor(Date.now() / 1000),
            lat: Number(j.lat),
            lng: Number(j.lng),
          });

          // Si el overlay existe, actualiza la ubicación
          const overlay = document.getElementById("emergency-overlay");
          if (overlay) {
            const loc = document.createElement("p");
            loc.innerHTML = `📍 Ubicación: ${Number(j.lat).toFixed(5)}, ${Number(j.lng).toFixed(5)}`;
            loc.style.marginTop = "1rem";
            overlay.appendChild(loc);
          }
        }
      } catch (err) {
        console.warn("Error al parsear /gps:", err);
      }
      return;
    }
  };

  // Vincular callback a cliente MQTT
  mqtt.on("message", onMsg);
}
