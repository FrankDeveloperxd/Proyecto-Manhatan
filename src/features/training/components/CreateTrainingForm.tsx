import { useState } from "react";
import { createTraining } from "../api";

export default function CreateTrainingForm({ onCreated }: { onCreated?: (id: string)=>void }) {
  const [title, setTitle] = useState("");
  const [description, setDesc] = useState("");
  const [startDate, setStart] = useState<string>(new Date().toISOString().slice(0,10));
  const [hours, setHours] = useState(8);
  const [certifies, setCert] = useState(true);
  const [area, setArea] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = await createTraining({
        title, description, startDate, hours, certifies, area,
        endDate: undefined,
        mandatory: false,
        steps: 0
    });
    onCreated?.(id);
    setTitle(""); setDesc(""); setHours(8); setCert(true); setArea("");
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded-xl">
      <h3 className="font-semibold">Crear capacitación</h3>
      <input className="input" placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
      <textarea className="input" placeholder="Descripción" value={description} onChange={e=>setDesc(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Inicio
          <input type="date" className="input" value={startDate} onChange={e=>setStart(e.target.value)} />
        </label>
        <label className="text-sm">Horas
          <input type="number" className="input" min={1} value={hours} onChange={e=>setHours(+e.target.value)} />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={certifies} onChange={e=>setCert(e.target.checked)} />
          Certifica
        </label>
        <input className="input" placeholder="Área (opcional)" value={area} onChange={e=>setArea(e.target.value)} />
      </div>
      <button className="btn-primary">Guardar</button>
    </form>
  );
}
