import { useEffect, useState } from "react";
import { subscribeWorkers } from "./api";
import type { Worker } from "./types";

export default function WorkerList({ onShowQR }: { onShowQR: (w: Worker) => void }) {
  const [items, setItems] = useState<Worker[]>([]);
  useEffect(() => subscribeWorkers(setItems), []);

  if (!items.length) return <p className="opacity-70">Aún no hay trabajadores registrados.</p>;

  return (
    <div className="mt-6 space-y-2">
      <h3 className="font-semibold">Trabajadores registrados</h3>
      <div className="grid gap-2">
        {items.map((w) => (
          <div key={w.id} className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <div className="font-medium">{w.fullName}</div>
              <div className="text-xs opacity-70">{w.role} · {w.code} · {w.area}</div>
            </div>
            <button className="btn" onClick={() => onShowQR(w)}>Ver QR</button>
          </div>
        ))}
      </div>
    </div>
  );
}
