import { useEffect, useMemo, useState } from "react";
import { createSensor, listWorkersBrief } from "./api";

const TOPIC_OPTIONS = [
  { id: "topic1", label: "topic1", subscriptions: ["subs1", "subs1"] },
  { id: "topic2", label: "topic2", subscriptions: ["subsA", "subsA"] },
  { id: "topic3", label: "topic3", subscriptions: ["subsC", "subsC"] },
  { id: "topic4", label: "topic4", subscriptions: ["subsD", "subsD"] },
  { id: "topic5", label: "topic5", subscriptions: ["subsE", "subsE"] },
];

export default function SensorForm({ onClose, onCreated }: { onClose: ()=>void; onCreated?: ()=>void }) {
  const [workers, setWorkers] = useState<{id:string;fullName:string}[]>([]);
  const [workerId, setWorkerId] = useState("");
  const [topic, setTopic] = useState(TOPIC_OPTIONS[0].id);
  const [subscription, setSubscription] = useState(TOPIC_OPTIONS[0].subscriptions[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { (async ()=> setWorkers(await listWorkersBrief()))(); }, []);
  useEffect(() => {
    const t = TOPIC_OPTIONS.find(x => x.id === topic);
    setSubscription(t?.subscriptions?.[0] ?? "");
  }, [topic]);

  const workerOptions = useMemo(() => workers, [workers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!workerId) return setError("Selecciona un trabajador");
    try {
      setSaving(true);
      await createSensor({ workerId, topic, subscription });
      alert("Dispositivo asignado");
      onCreated?.(); onClose();
    } catch (err:any) {
      setError(err?.message ?? "Error creando sensor");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="rounded-2xl bg-white w-[min(880px,95%)] p-0 shadow-xl overflow-hidden relative">
        {/* Header gradient */}
        <div className="px-6 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Asignar sensor</div>
            <button className="text-white/90 hover:text-white" onClick={onClose}>Cerrar</button>
          </div>
          <div className="text-sm text-white/80">Asocia un dispositivo (ESP32) a un trabajador y define su topic/subscription.</div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600">Trabajador</label>
            <select className="input mt-1 h-10" value={workerId} onChange={e=>setWorkerId(e.target.value)}>
              <option value="">— selecciona —</option>
              {workerOptions.map(w => <option key={w.id} value={w.id}>{w.fullName} · {w.id}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">Solo puedes elegir usuarios existentes.</p>
          </div>

          <div>
            <label className="text-sm text-slate-600">Topic</label>
            <select className="input mt-1 h-10" value={topic} onChange={e=>setTopic(e.target.value)}>
              {TOPIC_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600">Subscription</label>
            <select className="input mt-1 h-10" value={subscription} onChange={e=>setSubscription(e.target.value)}>
              {(TOPIC_OPTIONS.find(t => t.id === topic)?.subscriptions || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-between mt-2">
            {error ? <div className="text-sm text-red-600">{error}</div> : <span />}
            <div className="flex gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Guardando…" : "Asignar sensor"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
