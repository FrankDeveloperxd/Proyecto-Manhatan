// src/features/training/Training.tsx
import React, { useMemo } from "react";

/* ================== DATOS MOCK (estables) ================== */
type Course = {
  id: string;
  title: string;
  subtitle: string;
  progress?: number;   // para "En curso"
  start?: string;
  end?: string;
  date?: string;       // para "Próximo"
};

type Cert = { id: string; title: string; date: string; score: number };

const inProgress: Course[] = [
  {
    id: "c1",
    title: "Seguridad Industrial en Minería",
    subtitle: "Protocolos de seguridad y manejo de equipos",
    progress: 65,
    start: "15 Sep 2024",
    end: "30 Oct 2024",
  },
  {
    id: "c2",
    title: "Primeros Auxilios y RCP",
    subtitle: "Atención de emergencias médicas",
    progress: 40,
    start: "20 Sep 2024",
    end: "15 Nov 2024",
  },
];

const upcoming: Course[] = [
  {
    id: "u1",
    title: "Manejo de Sustancias Químicas",
    subtitle: "Seguridad en el manejo y respuesta",
    date: "5 Nov 2024",
  },
  {
    id: "u2",
    title: "Prevención y Combate de Incendios",
    subtitle: "Técnicas de prevención y respuesta",
    date: "12 Nov 2024",
  },
];

const certs: Cert[] = [
  { id: "x1", title: "Seguridad en Alturas", date: "15 Ago 2024", score: 95 },
  { id: "x2", title: "Uso de EPP", date: "30 Jul 2024", score: 88 },
  { id: "x3", title: "Manejo de Maquinaria Pesada", date: "10 Jun 2024", score: 92 },
];

const stats = { done: 12, inProgress: 2, certificates: 8, hours: 156 };

/* ================== SUBCOMPONENTES LOCALES ================== */
const Section = ({
  title,
  icon,
  children,
  subtitle,
}: {
  title: string;
  icon?: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5 shadow-sm">
    <div className="flex items-start gap-3 mb-3">
      {icon && <div className="text-xl">{icon}</div>}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const ProgressBar = ({ value }: { value: number }) => {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, rgb(99,102,241), rgb(124,58,237))",
        }}
      />
    </div>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition">
    {children}
  </article>
);

const KPI = ({ label, value }: { label: string; value: number | string }) => (
  <Card>
    <div
      aria-hidden
      className="w-10 h-10 rounded-xl mb-2"
      style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}
    />
    <div className="text-2xl font-semibold text-neutral-900">{value}</div>
    <div className="text-xs text-neutral-500">{label}</div>
  </Card>
);

/* ================== PÁGINA ================== */
export default function Training() {
  const enCurso = useMemo(() => inProgress, []);
  const proximos = useMemo(() => upcoming, []);
  const certificados = useMemo(() => certs, []);

  return (
    <div className="mx-auto max-w-6xl px-3 md:px-4 lg:px-6">
      {/* HERO */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 md:p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-11 w-11 rounded-2xl grid place-items-center text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          >
            🎓
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-neutral-900">
              Capacitaciones
            </h1>
            <p className="text-sm text-neutral-500">
              Cursos de formación y desarrollo profesional
            </p>
          </div>
        </div>
      </div>

      {/* EN PROGRESO */}
      <Section
        icon="🚀"
        title="En Progreso"
        subtitle="Cursos que estás llevando ahora"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {enCurso.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start gap-3">
                <div
                  aria-hidden
                  className="h-12 w-12 rounded-2xl grid place-items-center text-white shrink-0"
                  style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
                >
                  🎯
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-sm text-neutral-500">{c.subtitle}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Progreso</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="mt-1">
                      <ProgressBar value={c.progress ?? 0} />
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-neutral-500 flex gap-4">
                    {c.start && <span>Inicio: {c.start}</span>}
                    {c.end && <span>Fin estimado: {c.end}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* PRÓXIMOS */}
      <div className="mt-4">
        <Section icon="🗓️" title="Próximos Cursos" subtitle="Se abrirán pronto">
          <div className="grid gap-3 md:grid-cols-2">
            {proximos.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start gap-3">
                  <div
                    aria-hidden
                    className="h-12 w-12 rounded-2xl grid place-items-center text-white shrink-0"
                    style={{ background: "linear-gradient(135deg,#22d3ee,#a78bfa)" }}
                  >
                    📅
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-neutral-900 leading-tight">
                          {c.title}
                        </h3>
                        <p className="text-sm text-neutral-500">{c.subtitle}</p>
                      </div>
                      {c.date && (
                        <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">
                          {c.date}
                        </span>
                      )}
                    </div>
                    <ul className="mt-2 text-sm text-neutral-500">
                      <li>Duración: 24 h · Certificación: Sí · Cupos: 12</li>
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* CERTIFICADOS */}
      <div className="mt-4">
        <Section icon="🏅" title="Certificaciones Obtenidas">
          <div className="grid gap-3">
            {certificados.map((ct) => (
              <Card key={ct.id}>
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-2xl grid place-items-center bg-amber-300/95 text-neutral-900 shrink-0">
                    🏆
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-medium text-neutral-900 leading-tight">
                        {ct.title}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {ct.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">Completado: {ct.date}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mt-4">
        <KPI label="Cursos Completados" value={stats.done} />
        <KPI label="En Progreso" value={stats.inProgress} />
        <KPI label="Certificados" value={stats.certificates} />
        <KPI label="Horas Capacitación" value={stats.hours} />
      </div>
    </div>
  );
}
