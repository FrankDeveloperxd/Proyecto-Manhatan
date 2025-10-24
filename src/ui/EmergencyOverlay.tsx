import { create } from "zustand";

type EmergencyState = {
  visible: boolean;
  sensorId?: string;
  workerName?: string;
  workerId?: string;
  show: (p: { sensorId: string; workerName: string; workerId?: string }) => void;
  clear: () => void;
};

export const useEmergency = create<EmergencyState>((set) => ({
  visible: false,
  show: (p) => set({ visible: true, ...p }),
  clear: () => set({ visible: false, sensorId: undefined, workerName: undefined, workerId: undefined }),
}));

export function showEmergency(p: { sensorId: string; workerName: string; workerId?: string }) {
  useEmergency.getState().show(p);
}
export function clearEmergency() {
  useEmergency.getState().clear();
}

export default function EmergencyOverlay() {
  const { visible, workerName, sensorId, clear } = useEmergency();

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[9999] grid place-content-center bg-red-900/90 text-white p-6 animate-pulse">
      <div className="max-w-xl text-center">
        <div className="text-3xl font-bold mb-2">⚠️ EMERGENCIA</div>
        <div className="mb-3">{workerName ?? "Trabajador"} necesita ayuda</div>
        <div className="flex gap-3 justify-center">
          {sensorId && (
            <a className="rounded-lg px-4 py-2 bg-white text-red-800"
               href={`/app/sensors/${sensorId}`}>
              Localizar trabajador
            </a>
          )}
          <button className="rounded-lg px-4 py-2 bg-white/20" onClick={clear}>
            Ocultar
          </button>
        </div>
      </div>
    </div>
  );
}
