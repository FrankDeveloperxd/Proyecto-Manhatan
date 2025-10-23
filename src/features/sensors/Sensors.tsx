// src/features/sensors/Sensors.tsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../auth/authStore";

/* ----- Tipos y datos mock (luego reemplazas por Firestore) ----- */
type SensorState = "ok" | "alert" | "offline";

type Sensor = {
  id: string;
  name: string;
  site: string;
  last: string;        // última lectura (ej. "22.4 °C")
  state: SensorState;
  battery: number;     // %
};

const MOCK: Sensor[] = [
  { id: "S-001", name: "Temp. Sala 1", site: "Planta A", last: "22.4 °C", state: "ok",     battery: 91 },
  { id: "S-002", name: "Gas GLP 2",     site: "Planta A", last: "3.2 ppm", state: "alert",  battery: 54 },
  { id: "S-003", name: "Vibración M1",  site: "Planta B", last: "0.18 g",  state: "ok",     battery: 77 },
  { id: "S-004", name: "Ruido Zona C",  site: "Planta B", last: "86 dB",   state: "alert",  battery: 62 },
  { id: "S-005", name: "Humo Almacén",  site: "Almacén",  last: "—",        state: "offline", battery: 0  },
];

/* ----- Helpers visuales ----- */
const stateInfo: Record<SensorState, {label: string; dot: string; chip: string; glow: string;}> = {
  ok:      { label: "OK",      dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200", glow:"shadow-[0_0_0_3px_rgba(16,185,129,.12)]" },
  alert:   { label: "Alerta",  dot: "bg-amber-500",   chip: "bg-amber-50 text-amber-700 border-amber-200",     glow:"shadow-[0_0_0_3px_rgba(245,158,11,.12)]" },
  offline: { label: "Offline", dot: "bg-neutral-400", chip: "bg-neutral-100 text-neutral-600 border-neutral-200", glow:"shadow-[0_0_0_3px_rgba(0,0,0,.06)]" },
};

/* ----- Componente principal ----- */
export default function Sensors() {
  const role = useAuthStore(s => s.profile?.role ?? "empleado");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | SensorState>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return MOCK.filter(s => {
      const byTab = tab === "all" ? true : s.state === tab;
      if (!byTab) return false;
      if (!query) return true;
      return (
        s.id.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query) ||
        s.site.toLowerCase().includes(query)
      );
    });
  }, [q, tab]);

  return (
    <div className="mx-auto max-w-7xl px-3 md:px-4 lg:px-6">
      {/* header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-neutral-900">Sensores</h1>
          <p className="text-sm text-neutral-500">Monitoreo en tiempo real</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <ViewSwitch view={view} onChange={setView} />
        </div>
      </div>

      {/* toolbar */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-3 md:p-4 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* buscador */}
          <div className="relative flex-1">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nombre, ID o sede…"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 pl-9 outline-none focus:ring-2 ring-indigo-500 transition"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔎</span>
          </div>

          {/* tabs */}
          <div className="grid grid-cols-4 md:flex md:items-center gap-2">
            <TabButton active={tab==="all"}     onClick={() => setTab("all")}     label="Todos"    />
            <TabButton active={tab==="ok"}      onClick={() => setTab("ok")}      label="OK"       dotClass={stateInfo.ok.dot}/>
            <TabButton active={tab==="alert"}   onClick={() => setTab("alert")}   label="Alerta"   dotClass={stateInfo.alert.dot}/>
            <TabButton active={tab==="offline"} onClick={() => setTab("offline")} label="Offline"  dotClass={stateInfo.offline.dot}/>
          </div>

          {/* acciones admin */}
          {role === "admin" && (
            <div className="flex gap-2 md:ml-auto">
              <button className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50">➕ Nuevo</button>
              <button className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50">⟳ Refrescar</button>
            </div>
          )}
        </div>
      </div>

      {/* contenido */}
      {view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(s => <SensorCard key={s.id} s={s} isAdmin={role==="admin"} />)}
          {filtered.length === 0 && <EmptyState />}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Sede</th>
                <th className="text-left px-4 py-3">Última</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Batería</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-neutral-100">
                  <td className="px-4 py-3 font-medium text-neutral-800">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-neutral-600">{s.site}</td>
                  <td className="px-4 py-3">{s.last}</td>
                  <td className="px-4 py-3">
                    <Chip s={s} />
                  </td>
                  <td className="px-4 py-3">{s.battery}%</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/app/sensors/${s.id}`} className="text-indigo-600 hover:underline">Detalle</Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-500">Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* switch de vista en móvil */}
      <div className="md:hidden mt-4 flex justify-center">
        <ViewSwitch view={view} onChange={setView} />
      </div>
    </div>
  );
}

/* ----- Subcomponentes ----- */

function TabButton({
  active, onClick, label, dotClass,
}: { active: boolean; onClick: () => void; label: string; dotClass?: string; }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border transition text-sm
        ${active ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                 : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"}`}
    >
      <span className="inline-flex items-center gap-2">
        {dotClass && <span className={`inline-block h-2 w-2 rounded-full ${dotClass}`} />}
        {label}
      </span>
    </button>
  );
}

function ViewSwitch({ view, onChange }: { view: "grid" | "list"; onChange: (v:"grid"|"list")=>void; }) {
  return (
    <div className="inline-flex rounded-xl border border-neutral-200 p-1 bg-white">
      <button
        onClick={() => onChange("grid")}
        className={`px-3 py-1.5 rounded-lg text-sm ${view==="grid" ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
        title="Cuadrícula"
      >▦</button>
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1.5 rounded-lg text-sm ${view==="list" ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
        title="Lista"
      >☰</button>
    </div>
  );
}

function SensorCard({ s, isAdmin }: { s: Sensor; isAdmin: boolean }) {
  const info = stateInfo[s.state];
  return (
    <div
      className={`rounded-2xl border bg-white border-neutral-200 p-4 shadow-sm hover:shadow-md transition ${info.glow}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-neutral-500">{s.id} · {s.site}</div>
          <div className="text-base font-semibold text-neutral-900">{s.name}</div>
        </div>
        <Chip s={s} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm">
          <div className="text-neutral-500">Última lectura</div>
          <div className="font-medium">{s.last}</div>
        </div>
        <div className="text-sm text-neutral-600">
          🔋 {s.battery}%
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          to={`/app/sensors/${s.id}`}
          className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-500"
        >
          Ver detalle
        </Link>

        {isAdmin && (
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-sm">✎ Editar</button>
            <button className="px-3 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-sm">🗑️ Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ s }: { s: Sensor }) {
  const info = stateInfo[s.state];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${info.chip}`}>
      <span className={`h-2 w-2 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full grid place-items-center rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
      <div className="text-4xl">🛰️</div>
      <div className="mt-2 text-neutral-700 font-medium">Sin sensores coincidentes</div>
      <div className="text-sm text-neutral-500">Ajusta los filtros o la búsqueda.</div>
    </div>
  );
}
