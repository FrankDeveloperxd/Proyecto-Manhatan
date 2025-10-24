import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

interface AgendaEvent {
  id?: string;
  title: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  location?: string;
  notes?: string;
  createdAt?: any;
}

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowHM = () => new Date().toTimeString().slice(0, 5); // "HH:MM"

const classCard =
  "rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 shadow-sm";
const classInput =
  "w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800/20 dark:focus:ring-neutral-200/20";
const classBtn =
  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[.99] disabled:opacity-50 dark:bg-neutral-200 dark:text-neutral-900";
const classBtnGhost =
  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800";

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<AgendaEvent, "id">>({
    title: "",
    date: todayStr(),
    time: nowHM(), // valor por defecto para no bloquear
    location: "",
    notes: "",
  });

  useEffect(() => {
    if (!editingId) setForm((f) => ({ ...f, date: selectedDate }));
  }, [selectedDate, editingId]);

  // Suscripción (sin orderBy; ordenamos en cliente)
  useEffect(() => {
    const colRef = collection(db, "agenda");
    const qRef = query(colRef, where("date", "==", selectedDate));
    const unsub = onSnapshot(
      qRef,
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data() as any;
          const dateStr =
            typeof data.date === "string"
              ? data.date
              : data.date?.toDate
              ? data.date.toDate().toISOString().slice(0, 10)
              : selectedDate;

          return {
            id: d.id,
            title: data.title ?? "",
            time: data.time ?? "",
            location: data.location ?? "",
            notes: data.notes ?? "",
            date: dateStr,
            createdAt: data.createdAt,
          } as AgendaEvent;
        });
        items.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        setEvents(items);
      },
      (err) => {
        console.error("onSnapshot error:", err);
      }
    );
    return () => unsub();
  }, [selectedDate]);

  const canSave = useMemo(() => !!(form.title && form.date), [form]);

  const saveEvent = async () => {
    if (!canSave) return;
    setLoading(true);

    const timeSafe = form.time || nowHM();

    // Inserción optimista
    const optimistic: AgendaEvent = {
      id: `tmp-${Date.now()}`,
      title: form.title,
      date: form.date,
      time: timeSafe,
      location: form.location,
      notes: form.notes,
    };
    setEvents((prev) => [...prev, optimistic].sort((a, b) => a.time.localeCompare(b.time)));

    try {
      if (editingId) {
        await updateDoc(doc(db, "agenda", editingId), {
          ...form,
          time: timeSafe,
        });
      } else {
        await addDoc(collection(db, "agenda"), {
          ...form,
          time: timeSafe,
          createdAt: serverTimestamp(),
        });
      }
      setForm({ title: "", date: selectedDate, time: nowHM(), location: "", notes: "" });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el evento. Revisa la consola.");
      setEvents((prev) => prev.filter((e) => e.id !== optimistic.id)); // revertir
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (ev: AgendaEvent) => {
    setEditingId(ev.id!);
    setForm({
      title: ev.title,
      date: ev.date,
      time: ev.time || nowHM(),
      location: ev.location || "",
      notes: ev.notes || "",
    });
    // opcional: desplazar arriba
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeEvent = async (id?: string) => {
    if (!id) return;
    if (!confirm("¿Eliminar este evento?")) return;

    const prev = events;
    setEvents((p) => p.filter((e) => e.id !== id));

    try {
      await deleteDoc(doc(db, "agenda", id));
      if (editingId === id) {
        setEditingId(null);
        setForm({ title: "", date: selectedDate, time: nowHM(), location: "", notes: "" });
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar. Revisa la consola.");
      setEvents(prev); // revertir si falla
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Agenda</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Calendario simple con Firestore
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className={classInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Formulario */}
      <div className={classCard + " p-4"}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className="text-xs text-neutral-500">Título</label>
            <input
              className={classInput}
              placeholder="Ej: Revisión de sensores"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Hora</label>
            <input
              type="time"
              className={classInput}
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Lugar (opcional)</label>
            <input
              className={classInput}
              placeholder="Sala / Planta"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500">Notas (opcional)</label>
            <input
              className={classInput}
              placeholder="Detalle breve"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className={classBtn} onClick={saveEvent} disabled={!canSave || loading}>
            {editingId ? "Guardar cambios" : "Agregar evento"}
          </button>
          {editingId && (
            <button
              className={classBtnGhost}
              onClick={() => {
                setEditingId(null);
                setForm({ title: "", date: selectedDate, time: nowHM(), location: "", notes: "" });
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Lista de eventos del día */}
      <div className={classCard + " p-4"}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Eventos para {selectedDate}</h3>
          <span className="text-xs text-neutral-500">
            {events.length} {events.length === 1 ? "evento" : "eventos"}
          </span>
        </div>

        {events.length === 0 && (
          <p className="text-sm text-neutral-500">No hay eventos registrados.</p>
        )}

        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {events.map((ev) => (
            <li key={ev.id} className="py-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-medium leading-tight">
                  {ev.time} · {ev.title}
                </p>
                {(ev.location || ev.notes) && (
                  <p className="text-xs text-neutral-500">
                    {ev.location ? `Lugar: ${ev.location}` : ""}
                    {ev.location && ev.notes ? " · " : ""}
                    {ev.notes ? `Notas: ${ev.notes}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className={classBtnGhost} onClick={() => startEdit(ev)}>
                  Editar
                </button>
                <button
                  className={classBtnGhost + " text-red-600 dark:text-red-400"}
                  onClick={() => removeEvent(ev.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
