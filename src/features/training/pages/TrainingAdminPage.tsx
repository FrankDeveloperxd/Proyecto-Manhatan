import { useEffect, useState } from "react";
import {
  createTraining,
  listTrainings,
  listWorkersForTraining,
  updateTraining,
  deleteTrainingAndCleanup,
} from "../api";
import { Training, Worker } from "../types";

/* ---------- UI helpers ---------- */
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm ${className ?? ""}`}>{children}</div>
);

const Section: React.FC<{ title: string; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <Card>
    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      {right}
    </div>
    <div className="p-5">{children}</div>
  </Card>
);

function Badge({ tone = "slate", children }: { tone?: "slate"|"indigo"|"emerald"|"rose"|"sky"; children: React.ReactNode }) {
  const map: Record<string,string> = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    sky: "bg-sky-50 text-sky-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[tone]}`}>{children}</span>;
}

function Button({ variant="primary", size="md", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "primary"|"ghost"|"danger"; size?: "sm"|"md"}) {
  const base = "rounded-xl font-semibold transition disabled:opacity-60";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm" }[size];
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-rose-100 text-rose-700 hover:bg-rose-200",
  }[variant];
  return <button {...props} className={`${base} ${sizes} ${styles} ${props.className ?? ""}`} />;
}

/* ---------- Formulario reutilizable (ahora con horas y modalidad) ---------- */
function TrainingForm({
  initial,
  submitText,
  onSubmit,
  onAfterSubmit,
}: {
  initial?: Partial<Training>;
  submitText: string;
  onSubmit: (vals: Partial<Training>) => Promise<void> | void;
  onAfterSubmit?: () => void; // para colapsar después de guardar
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");

  // fechas y horas
  const [startDate, setStart] = useState(initial?.startDate || new Date().toISOString().slice(0, 10));
  const [endDate, setEnd] = useState(initial?.endDate || "");
  const [startTime, setStartTime] = useState(initial?.startTime || "");
  const [endTime, setEndTime] = useState(initial?.endTime || "");

  const [modality, setModality] = useState<Training["modality"]>(initial?.modality || "presencial");

  const [hours, setHours] = useState(initial?.hours ?? 8);
  const [certifies, setCertifies] = useState(initial?.certifies ?? true);
  const [mandatory, setMandatory] = useState(initial?.mandatory ?? false);
  const [steps, setSteps] = useState(initial?.steps ?? 3);
  const [area, setArea] = useState(initial?.area || "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<null | {type:"ok"|"err";text:string}>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await onSubmit({
        title, description,
        startDate, endDate: endDate || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        modality,
        hours, certifies, mandatory, steps, area
      });
      setMsg({type:"ok", text:"Guardado ✅"});
      onAfterSubmit?.();
    } catch (e: any) {
      setMsg({type:"err", text: e?.message || "No se pudo guardar"});
    } finally {
      setLoading(false);
    }
  }

  const input = "rounded-xl border border-slate-200 px-3 py-2 w-full";

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <input className={input} placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} required />
        <input className={input} placeholder="Área (opcional)" value={area} onChange={e=>setArea(e.target.value)} />
        <textarea className={`${input} md:col-span-2`} placeholder="Descripción" rows={3} value={description} onChange={e=>setDescription(e.target.value)} />

        <label className="text-sm">Inicio
          <input type="date" className={`${input} mt-1`} value={startDate} onChange={e=>setStart(e.target.value)} />
        </label>
        <label className="text-sm">Fin (opcional)
          <input type="date" className={`${input} mt-1`} value={endDate} onChange={e=>setEnd(e.target.value)} />
        </label>

        <label className="text-sm">Hora inicio
          <input type="time" className={`${input} mt-1`} value={startTime} onChange={e=>setStartTime(e.target.value)} />
        </label>
        <label className="text-sm">Hora fin
          <input type="time" className={`${input} mt-1`} value={endTime} onChange={e=>setEndTime(e.target.value)} />
        </label>

        <label className="text-sm">Horas totales
          <input type="number" min={1} className={`${input} mt-1`} value={hours} onChange={e=>setHours(+e.target.value)} />
        </label>
        <label className="text-sm">Pasos
          <input type="number" min={1} className={`${input} mt-1`} value={steps} onChange={e=>setSteps(+e.target.value)} />
        </label>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="text-sm">Modalidad
          <select className={`${input} mt-1`} value={modality} onChange={e=>setModality(e.target.value as Training["modality"])}>
            <option value="presencial">Presencial</option>
            <option value="virtual">Virtual</option>
            <option value="mixta">Mixta</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={certifies} onChange={e=>setCertifies(e.target.checked)} />
          Certifica
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mandatory} onChange={e=>setMandatory(e.target.checked)} />
          Obligatorio
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button disabled={loading}>{loading ? "Guardando…" : submitText}</Button>
        {msg && <span className={`${msg.type==="ok"?"text-emerald-600":"text-rose-600"} text-sm`}>{msg.text}</span>}
      </div>
    </form>
  );
}

/* ---------- Tarjeta de curso (resalta seleccionado) ---------- */
function TrainingCardRow({
  t, selected, onSelect, onEdit, onDelete,
}: {
  t: Training; selected?: boolean;
  onSelect?: (id: string) => void;
  onEdit: (t: Training) => void;
  onDelete: (t: Training) => void;
}) {
  return (
    <Card className={`p-4 hover:shadow-md transition relative ${selected ? "ring-2 ring-indigo-500 bg-indigo-50/40" : ""}`}>
      {/* banda lateral para seleccionado */}
      {selected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-2xl" />}
      <div className="flex items-start gap-4">
        <button onClick={() => onSelect?.(t.id)} className="flex-1 text-left">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white grid place-items-center">🎯</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{t.title}</div>
                {selected && <Badge tone="indigo">Seleccionado</Badge>}
              </div>
              {t.description && <div className="text-sm text-slate-600 line-clamp-2">{t.description}</div>}
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span>Inicio: {new Date(t.startDate).toLocaleDateString()}</span>
                {t.endDate && <span>Fin: {new Date(t.endDate).toLocaleDateString()}</span>}
                {(t.startTime || t.endTime) && <span>{t.startTime || "--"}–{t.endTime || "--"}</span>}
                <Badge tone="indigo">Pasos: {t.steps}</Badge>
                <Badge>Horas: {t.hours}</Badge>
                <Badge tone={t.mandatory ? "rose":"emerald"}>{t.mandatory ? "Obligatorio":"Opcional"}</Badge>
                <Badge>{t.certifies ? "Certifica":"Sin certificado"}</Badge>
                {t.modality && <Badge tone="sky">Modo: {t.modality}</Badge>}
                {t.area && <Badge tone="sky">Área: {t.area}</Badge>}
              </div>
            </div>
          </div>
        </button>
        <div className="flex flex-col gap-2">
          <Button variant="ghost" onClick={() => onEdit(t)}>Editar</Button>
          <Button variant="danger" onClick={() => onDelete(t)}>Eliminar</Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Panel de inscritos (tabla) ---------- */
function EnrolledPanel({ trainingId }: { trainingId?: string }) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Worker[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!trainingId) { setList([]); return; }
      setLoading(true);
      const data = await listWorkersForTraining(trainingId);
      if (alive) { setList(data); setLoading(false); }
    })();
    return () => { alive = false; };
  }, [trainingId]);

  return (
    <Section title="Inscritos">
      {!trainingId ? (
        <div className="text-slate-500 text-sm">Elige una capacitación en la izquierda para ver su lista.</div>
      ) : loading ? (
        <div className="text-sm">Cargando…</div>
      ) : !list.length ? (
        <div className="text-slate-500 text-sm">Sin inscritos aún.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Trabajador</th>
                <th className="py-2">Área</th>
                <th className="py-2 text-right">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {list.map((w) => {
                const e = (w.trainingEnrollments ?? []).find(x => x.trainingId === trainingId);
                return (
                  <tr key={w.id} className="border-t">
                    <td className="py-2">{w.name} <span className="text-slate-400">· {w.email ?? ""}</span></td>
                    <td className="py-2">{w.area ?? "-"}</td>
                    <td className="py-2 text-right">{e?.status ?? "enrolled"} · {e?.progress ?? 0}% · {e?.hoursDone ?? 0}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

/* ---------- Página ---------- */
export default function TrainingAdminPage() {
  const [items, setItems] = useState<Training[]>([]);
  const [selected, setSelected] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Training | null>(null);

  // estado para colapsar/expandir crear
  const [showCreate, setShowCreate] = useState<boolean>(false);

  async function refresh() {
    setLoading(true);
    const data = await listTrainings();
    setItems(data);
    if (data.length && !selected) setSelected(data[0].id);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function onCreate(vals: Partial<Training>) {
    const id = await createTraining(vals as any);
    setSelected(id);
    await refresh();
    // colapsa después de crear
    setShowCreate(false);
  }
  async function onEditSave(vals: Partial<Training>) {
    if (!editing) return;
    await updateTraining(editing.id, vals);
    setEditing(null);
    await refresh();
  }
  async function onDelete(t: Training) {
    if (!confirm(`¿Eliminar “${t.title}”?`)) return;
    await deleteTrainingAndCleanup(t.id);
    if (selected === t.id) setSelected(undefined);
    await refresh();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Section
          title="Crear capacitación"
          right={
            <Button variant="ghost" onClick={() => setShowCreate(s => !s)}>
              {showCreate ? "Ocultar" : "Crear"}
            </Button>
          }
        >
          {/* contenedor colapsable simple */}
          <div className={`grid transition-all duration-300 ${showCreate ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              {showCreate && (
                <TrainingForm
                  submitText="Guardar"
                  onSubmit={onCreate}
                  onAfterSubmit={() => setShowCreate(false)}
                />
              )}
            </div>
          </div>
          {!showCreate && <div className="text-sm text-slate-500">Pulsa “Crear” para abrir el formulario.</div>}
        </Section>

        <Section title="Capacitaciones">
          {loading ? (
            <div className="text-sm">Cargando capacitaciones…</div>
          ) : !items.length ? (
            <div className="text-slate-500 text-sm">No hay capacitaciones creadas.</div>
          ) : (
            <div className="grid gap-3">
              {items.map(t => (
                <TrainingCardRow
                  key={t.id}
                  t={t}
                  selected={selected === t.id}
                  onSelect={setSelected}
                  onEdit={setEditing}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </Section>
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <EnrolledPanel trainingId={selected} />
      </div>

      {/* Modal edición */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
          <Card className="max-w-2xl w-full">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="font-semibold">Editar capacitación</div>
              <button className="text-slate-500 hover:text-slate-700" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="p-5">
              <TrainingForm initial={editing} submitText="Guardar cambios" onSubmit={onEditSave} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
