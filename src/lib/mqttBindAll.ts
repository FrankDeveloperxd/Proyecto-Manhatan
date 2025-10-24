import { client as mqtt } from "./mqttClient";
import { useTopicRegistry } from "./topicRegistry";
import { useEmergencyStore } from "./emergencyStore";

let wired = false;

export function bindAllSensorsOnce() {
  if (wired) return;
  wired = true;

  // escuchamos TODOS los `+/emergency`
  mqtt.subscribe(["+/emergency"]);

  const onMsg = (topic: string, payload: Buffer) => {
    if (!topic.endsWith("/emergency")) return;

    const text = payload.toString();
    let pressed = false;
    let workerName: string | undefined;
    let ts: number | undefined;

    try {
      const json = JSON.parse(text);
      pressed = !!json?.pressed;
      workerName = json?.workerName;
      ts = typeof json?.ts === "number" ? json.ts : undefined;
    } catch {
      // si no es JSON, ignoramos
    }

    // topicBase = "topic1" de "topic1/emergency"
    const topicBase = topic.split("/")[0];
    const { getByTopic } = useTopicRegistry.getState();
    const info = getByTopic(topicBase); // { sensorId, workerName }

    if (pressed) {
      useEmergencyStore.getState().trigger({
        workerName: workerName || info?.workerName,
        sensorId: info?.sensorId,
        topicBase,
        ts,
      });
    } else {
      useEmergencyStore.getState().clear();
    }
  };

  mqtt.on("message", onMsg);
}
