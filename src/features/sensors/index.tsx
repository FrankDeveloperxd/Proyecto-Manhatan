// src/features/sensors/index.tsx
import { useEffect, useState } from "react";
import SensorForm from "./SensorForm";
import SensorList from "./SensorList";
import SensorDetail from "./SensorDetail";
import { subscribeSensors } from "./api";
import type { Sensor } from "./types";

export default function SensorsPage() {
  const [items, setItems] = useState<Sensor[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<Sensor | null>(null);

  useEffect(() => {
    const off = subscribeSensors(setItems);
    return () => off();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Monitoreo de Sensores</h1>
        <button className="btn-primary" onClick={() => setOpenForm(true)}>+ Agregar sensor</button>
      </div>

      <SensorList items={items} onShow={(s)=>setSelected(s)} onEdit={(s)=>{ setSelected(s); setOpenForm(true); }} onDelete={()=>{}} />

      {openForm && <SensorForm onClose={() => setOpenForm(false)} onCreated={() => setOpenForm(false)} />}

      {selected && <SensorDetail sensor={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
