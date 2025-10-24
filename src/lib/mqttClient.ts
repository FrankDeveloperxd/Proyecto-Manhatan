import mqtt from "mqtt";

const MQTT_URL = "wss://mqtt.flespi.io:443";

// ✅ usa Opción A (tipada) o B (exprés) para esta línea
const TOKEN = (import.meta as any).env.VITE_FLESPI_RO_TOKEN as string;

if (!TOKEN) {
  console.error("[MQTT] Falta VITE_FLESPI_RO_TOKEN en .env.local (reinicia el dev server)");
}

export const client = mqtt.connect(MQTT_URL, {
  username: `FlespiToken ${TOKEN}`,
  password: "",
  protocolVersion: 5,
  clean: true,
  keepalive: 60,
});

client.on("connect", () => console.log("[MQTT] Conectado a flespi (frontend)"));
client.on("reconnect", () => console.log("[MQTT] Reintentando conexión…"));
client.on("error", (e) => console.error("[MQTT] Error:", e?.message ?? e));
client.on("close", () => console.log("[MQTT] Conexión cerrada"));
