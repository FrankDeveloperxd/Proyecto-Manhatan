import { create } from "zustand";

type EmergencyState = {
  active: boolean;
  workerName?: string;
  sensorId?: string;
  topicBase?: string;
  ts?: number;
  // actions
  trigger: (p: { workerName?: string; sensorId?: string; topicBase?: string; ts?: number }) => void;
  clear: () => void;
};

export const useEmergencyStore = create<EmergencyState>((set) => ({
  active: false,
  trigger: ({ workerName, sensorId, topicBase, ts }) =>
    set({ active: true, workerName, sensorId, topicBase, ts }),
  clear: () => set({ active: false, workerName: undefined, sensorId: undefined, topicBase: undefined, ts: undefined }),
}));
