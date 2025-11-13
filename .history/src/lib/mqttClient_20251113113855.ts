// src/lib/mqttClient.ts
import mqtt, { MqttClient } from "mqtt";

// 🟣 1) URL del broker (igual que en tu HTML que sí funciona)
const MQTT_URL =
  (import.meta as any).env.VITE_MQTT_BROKER || "wss://mqtt.flespi.io/mqtt";

// 🟣 2) Token: usamos el mismo nombre que tienes en .env.local
// Si quieres hardcodear el token aquí, también puedes.
const TOKEN =
  (import.meta as any).env.VITE_FLESPI_TOKEN ||
  "i50Eau4vnoOspZZK5PyvsLFAdDgbUEZ8q5xq9QB8hcVR7apoR7zwTR6ajxbIUitg";

if (!TOKEN) {
  console.error(
    "[MQTT] Falta VITE_FLESPI_TOKEN en .env.local (reinicia el dev server)"
  );
}

// 🟣 3) Cliente MQTT compartido para todo el frontend
export const client: MqttClient = mqtt.connect(MQTT_URL, {
  clientId: "sst-guard-" + Math.random().toString(16).slice(2, 10),
  username: `FlespiToken ${TOKEN}`, // igualito que en tu HTML
  password: "",
  protocolVersion: 4, // la lib del HTML usa v4
  clean: true,
  keepalive: 60,
  reconnectPeriod: 3000,
  connectTimeout: 10000,
});

// 🟣 4) Logs básicos (ya los tenías, los mantengo)
client.on("connect", () =>
  console.log("[MQTT] Conectado a flespi (frontend)", { MQTT_URL })
);
client.on("reconnect", () => console.log("[MQTT] Reintentando conexión…"));
client.on("error", (e) =>
  console.error("[MQTT] Error:", e?.message ?? e)
);
client.on("close", () => console.log("[MQTT] Conexión cerrada"));
