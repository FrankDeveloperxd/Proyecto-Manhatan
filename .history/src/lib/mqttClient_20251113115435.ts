// src/lib/mqttClient.ts
import mqtt, { MqttClient } from "mqtt";

// ===============================
// CONFIGURACIÓN (misma que el HTML)
// ===============================

// Broker: mismo que en el HTML
const BROKER: string =
  (import.meta as any).env.VITE_MQTT_BROKER || "wss://mqtt.flespi.io/mqtt";

// Token: mismo que en el HTML
const TOKEN: string =
  (import.meta as any).env.VITE_FLESPI_TOKEN ||
  "i50Eau4vnoOspZZK5PyvsLFAdDgbUEZ8q5xq9QB8hcVR7apoR7zwTR6ajxbIUitg";

// Topic por defecto (por si algún componente lo necesita)
export const DEFAULT_TOPIC: string =
  (import.meta as any).env.VITE_MQTT_TOPIC || "esp32/test";

if (!TOKEN) {
  console.error(
    "[MQTT] Falta VITE_FLESPI_TOKEN en .env.local (reinicia el dev server)"
  );
}

// ===============================
// CLIENTE MQTT COMPARTIDO
// ===============================
export const client: MqttClient = mqtt.connect(BROKER, {
  // Igual que tu HTML: clientId aleatorio
  clientId: "web-monitor-" + Math.random().toString(16).substr(2, 8),

  // Muy importante: mismo formato de username
  username: "FlespiToken " + TOKEN,
  password: "",
  clean: true,
  reconnectPeriod: 3000,
  connectTimeout: 10000,
  // La versión de protocolo la dejamos por defecto (v4), como en el HTML
  // keepalive opcional
  keepalive: 60,
});

// ===============================
// LOGS BÁSICOS
// ===============================
client.on("connect", () => {
  console.log("[MQTT] ✅ Conectado a Flespi (frontend)", { BROKER });
});

client.on("reconnect", () => {
  console.log("[MQTT] 🔄 Reintentando conexión…");
});

client.on("close", () => {
  console.log("[MQTT] ⚠️ Conexión cerrada");
});

client.on("error", (e) => {
  console.error("[MQTT] ❌ Error:", e?.message ?? e);
});
