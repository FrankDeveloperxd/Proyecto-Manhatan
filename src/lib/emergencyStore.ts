// src/lib/emergencyStore.ts
import { create } from "zustand";

type EmergencyState = {
  active: boolean;
  workerName?: string;
  sensorId?: string;
  topicBase?: string;
  ts?: number;
  lat?: number;
  lng?: number;

  trigger: (p: {
    workerName?: string;
    sensorId?: string;
    topicBase?: string;
    ts?: number;
    lat?: number;
    lng?: number;
  }) => void;

  clear: () => void;
};

export const useEmergencyStore = create<EmergencyState>((set) => ({
  active: false,

  trigger: (p) =>
    set({
      active: true,
      ...p,
    }),

  clear: () =>
    set({
      active: false,
      workerName: undefined,
      sensorId: undefined,
      topicBase: undefined,
      ts: undefined,
      lat: undefined,
      lng: undefined,
    }),
}));
