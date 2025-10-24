import { create } from "zustand";

export type TopicInfo = {
  sensorId: string;
  workerName: string;
  workerId?: string;
};

type TopicRegistryState = {
  topics: Record<string, TopicInfo>; // { topicBase: info }
  setAll: (list: { topic: string; sensorId: string; workerName: string; workerId?: string }[]) => void;
  upsert: (topic: string, info: TopicInfo) => void;
  getByTopic: (topicBase: string) => TopicInfo | undefined;
  removeByTopic: (topicBase: string) => void;
  removeBySensorId: (sensorId: string) => void;
};

export const useTopicRegistry = create<TopicRegistryState>((set, get) => ({
  // ---- estado inicial ----
  topics: {},

  // Carga masiva: lista de sensores -> { topicBase: info }
  setAll: (list) =>
    set({
      topics: Object.fromEntries(
        list
          .filter((s) => s.topic && s.sensorId && s.workerName)
          .map((s) => [
            s.topic.split("/")[0],
            { sensorId: s.sensorId, workerName: s.workerName, workerId: s.workerId },
          ])
      ),
    }),

  // Inserta/actualiza un registro
  upsert: (topic, info) =>
    set((st) => ({
      topics: { ...st.topics, [topic.split("/")[0]]: info },
    })),

  // Obtiene info por topic base
  getByTopic: (topicBase) => get().topics[topicBase],

  // ---- NUEVO: borrar por topic base ----
  removeByTopic: (topicBase) =>
    set((st) => {
      const next = { ...st.topics };
      delete next[topicBase];
      return { topics: next };
    }),

  // ---- NUEVO: borrar todas las entradas que apunten a un sensorId ----
  removeBySensorId: (sensorId) =>
    set((st) => {
      const next = { ...st.topics };
      for (const k of Object.keys(next)) {
        if (next[k]?.sensorId === sensorId) delete next[k];
      }
      return { topics: next };
    }),
}));
