// src/features/sensors/types.ts
export type Sensor = {
  id?: string;
  workerId: string;
  workerName?: string;
  type: string; // 'gps' | 'temp' | 'hr' | ...
  topic: string; // e.g. 'topic1'
  subscription: string; // e.g. 'subs1'
  active?: boolean;
  lastReading?: any;
  lastSeenAt?: any;
  emergency?: boolean;
  location?: { lat: number; lng: number };
  createdAt?: any;
  updatedAt?: any;
};
