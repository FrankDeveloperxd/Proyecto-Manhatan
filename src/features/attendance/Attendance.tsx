import React, { useMemo, useState } from "react";

/** Pantalla de Asistencia — Responsive (móvil y desktop) */
export default function Attendance() {
  // Estado simulado del día
  const [attendance] = useState({
    entry: "8:30 AM",
    exit: null as string | null,
    worked: "9h 30min",
    pauses: "1h 15min",
  });

  // Historial simulado
  const history = useMemo(
    () => [
      { day: "Lun", date: "06 Oct", in: "8:32 AM", out: "6:45 PM", hours: "10h 13min", status: "Tardanza" },
      { day: "Mar", date: "07 Oct", in: "8:28 AM", out: "6:30 PM", hours: "10h 02min", status: "Presente" },
      { day: "Mié", date: "08 Oct", in: "8:15 AM", out: "6:20 PM", hours: "10h 05min", status: "Presente" },
      { day: "Jue", date: "09 Oct", in: "8:45 AM", out: "6:15 PM", hours: "9h 30min", status: "Tardanza" },
      { day: "Vie", date: "10 Oct", in: "8:30 AM", out: "6:15 PM", hours: "9h 45min", status: "Presente" },
    ],
    []
  );

  const monthStats = { present: 22, late: 3, absent: 1, percent: 95.8 };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 md:px-6 lg:px-8 pb-24">
      {/* CABECERA */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕒</span>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-neutral-800">Asistencia Laboral</h1>
            <p className="text-sm text-neutral-500">Control de registro de asistencia</p>
          </div>
        </div>
      </Card>

      {/* LAYOUT RESPONSIVE: 2 columnas en md+ */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Columna izquierda (acciones + estado + resumen) */}
        <div className="md:col-span-8 space-y-6">
          {/* BOTONES */}
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled
                className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-5 text-center shadow-sm
                           text-neutral-500 hover:bg-neutral-100 transition disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-1">⏱️</div>
                <div className="font-semibold">Registrar Entrada</div>
                <div className="text-xs mt-1">Ya registrado</div>
              </button>

              <button
                className="rounded-2xl bg-green-500 px-4 py-5 text-center text-white shadow-md hover:bg-green-600 transition"
              >
                <div className="text-2xl mb-1">✅</div>
                <div className="font-semibold">Registrar Salida</div>
                <div className="text-xs mt-1 opacity-90">Guarda tu salida del día</div>
              </button>
            </div>
          </Card>

          {/* ESTADO DEL DÍA */}
          <Section title="Estado del día">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MiniCard icon="🟢" label="Entrada Hoy" value={attendance.entry || "No registrado"} />
              <MiniCard icon="🔴" label="Salida Hoy" value={attendance.exit || "No registrado"} />
              <MiniCard icon="⏳" label="Horas Trabajadas" value={attendance.worked} />
              <MiniCard icon="☕" label="Pausas" value={attendance.pauses} />
            </div>
          </Section>

          {/* RESUMEN SEMANAL */}
          <Section title="Resumen semanal">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard label="Días trabajados" value="5" />
              <SummaryCard label="Horas totales" value="42.5h" />
              <SummaryCard label="Asistencia" value="100%" />
              <SummaryCard label="Tardanzas" value="2" />
            </div>
          </Section>

          {/* ESTADÍSTICAS DEL MES (también aquí en mobile) */}
          <div className="md:hidden">
            <Section title="Estadísticas del mes">
              <div className="grid grid-cols-2 gap-3">
                <Stat icon="✅" color="green" label="Días presentes" value={monthStats.present} />
                <Stat icon="⏰" color="amber" label="Tardanzas" value={monthStats.late} />
                <Stat icon="❌" color="red" label="Ausencias" value={monthStats.absent} />
                <Stat icon="📊" color="blue" label="Asistencia" value={`${monthStats.percent}%`} />
              </div>
            </Section>
          </div>
        </div>

        {/* Columna derecha (historial + stats en desktop) */}
        <div className="md:col-span-4 space-y-6">
          {/* HISTORIAL — carta con lista en móvil, tabla en desktop */}
          <Card>
            <h3 className="font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              🗂️ Historial de asistencia
            </h3>

            {/* Mobile: lista de tarjetas */}
            <div className="md:hidden flex flex-col gap-2">
              {history.map((d) => (
                <div
                  key={d.date}
                  className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm flex justify-between"
                >
                  <div>
                    <div className="font-medium text-neutral-800">
                      {d.day} <span className="text-neutral-500 text-sm">{d.date}</span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {d.in} – {d.out}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-indigo-600">{d.hours}</div>
                    <Badge kind={d.status === "Presente" ? "success" : "warning"}>{d.status}</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: tabla compacta */}
            <div className="hidden md:block overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="py-2 pr-3">Día</th>
                    <th className="py-2 pr-3">Fecha</th>
                    <th className="py-2 pr-3">Entrada</th>
                    <th className="py-2 pr-3">Salida</th>
                    <th className="py-2 pr-3">Horas</th>
                    <th className="py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((d, i) => (
                    <tr key={i} className="border-t border-neutral-200">
                      <td className="py-2 pr-3">{d.day}</td>
                      <td className="py-2 pr-3">{d.date}</td>
                      <td className="py-2 pr-3">{d.in}</td>
                      <td className="py-2 pr-3">{d.out}</td>
                      <td className="py-2 pr-3 font-medium text-indigo-600">{d.hours}</td>
                      <td className="py-2">
                        <Badge kind={d.status === "Presente" ? "success" : "warning"}>{d.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* ESTADÍSTICAS — sólo visible aquí en desktop */}
          <div className="hidden md:block">
            <Section title="Estadísticas del mes">
              <div className="grid grid-cols-2 gap-3">
                <Stat icon="✅" color="green" label="Días presentes" value={monthStats.present} />
                <Stat icon="⏰" color="amber" label="Tardanzas" value={monthStats.late} />
                <Stat icon="❌" color="red" label="Ausencias" value={monthStats.absent} />
                <Stat icon="📊" color="blue" label={`Asistencia`} value={`${monthStats.percent}%`} />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Subcomponentes reutilizables ---------------- */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
        📋 {title}
      </h2>
      {children}
    </Card>
  );
}

function MiniCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
      <div className="text-xl">{icon}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
      <div className="text-sm font-semibold text-neutral-800 mt-1">{value}</div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
      <div className="text-xl font-semibold text-neutral-800">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}

function Badge({
  children,
  kind = "success",
}: {
  children: React.ReactNode;
  kind?: "success" | "warning";
}) {
  const k =
    kind === "success"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";
  return <span className={`text-xs px-2 py-0.5 rounded-full ${k}`}>{children}</span>;
}

function Stat({
  icon,
  color,
  label,
  value,
}: {
  icon: string;
  color: "green" | "amber" | "red" | "blue";
  label: string;
  value: number | string;
}) {
  const colorMap: Record<typeof color, string> = {
    green: "text-green-600 bg-green-50",
    amber: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50",
    blue: "text-blue-600 bg-blue-50",
  };
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm flex items-center gap-3">
      <div className={`h-10 w-10 grid place-items-center rounded-full ${colorMap[color]}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold text-neutral-800">{value}</div>
        <div className="text-xs text-neutral-500">{label}</div>
      </div>
    </div>
  );
}
