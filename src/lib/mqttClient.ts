// src/lib/mqttClient.ts
import mqtt, { MqttClient } from "mqtt";

export const BROKER = "wss://mqtt.flespi.io/mqtt";
export const DEFAULT_TOPIC = "esp32/test";

// puedes dejarlo hardcodeado, es un proyecto de pruebas
const FLESPI_TOKEN =
  "i50Eau4vnoOspZZK5PyvsLFAdDgbUEZ8q5xq9QB8hcVR7apoR7zwTR6ajxbIUitg";

if (!FLESPI_TOKEN) {
  console.error(
    "[MQTT] Falta FLESPI_TOKEN. Revisa src/lib/mqttClient.ts o tu .env.local"
  );
}

export const client: MqttClient = mqtt.connect(BROKER, {
  clientId: "safetrack-web-" + Math.random().toString(16).slice(2),
  username: `FlespiToken ${FLESPI_TOKEN}`,
  password: "",
  protocolVersion: 5,
  clean: true,
  keepalive: 60,
  reconnectPeriod: 3000,
});

client.on("connect", () => {
  console.log("[MQTT] ✅ Conectado a Flespi (frontend)", { BROKER });
});

client.on("reconnect", () => console.log("[MQTT] 🔄 Reintentando conexión…"));
client.on("close", () => console.log("[MQTT] ⚠️ Conexión cerrada"));
client.on("error", (e) =>
  console.error("[MQTT] ❌ Error MQTT:", e?.message ?? e)
);
