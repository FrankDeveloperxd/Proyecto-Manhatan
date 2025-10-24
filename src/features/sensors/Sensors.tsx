import { useEffect, useMemo, useState } from "react";
import EmergencyButton from "./EmergencyButton";
import EmergencyOverlay from "./EmergencyOverlay";
import MapLive from "./MapLive";
import SimulatorPanel from "./SimulatorPanel";

// ——— utilitas de estado
type Level = "Normal" | "Moderado" | "Alto";
const badge = (lvl: Level) =>
  ({
    Normal: "bg-emerald-100 text-emerald-700",
    Moderado: "bg-amber-100 text-amber-700",
    Alto: "bg-red-100 text-red-700",
  }[lvl]);

export default function Sensors() {
  // simulación base
  const [temp, setTemp] = useState(36.5);
  const [hum, setHum] = useState(60);
  const [activity, setActivity] = useState<Level>("Moderado");
  const [lux, setLux] = useState(450);
  const [fc, setFc] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [pa, setPa] = useState<[number, number]>([120, 80]);

  const [recent, setRecent] = useState<
    { t: string; temp: number; hum: number; fc: number }[]
  >([]);

  const [emOpen, setEmOpen] = useState(false);

  // tick de simulación cada 4s
  useEffect(() => {
    const id = setInterval(() => {
      setTemp((v) => +(v + (Math.random() - 0.5) * 0.4).toFixed(1));
      setHum((v) => Math.max(30, Math.min(90, Math.round(v + (Math.random() - 0.5) * 4))));
      setLux((v) => Math.max(120, Math.min(900, Math.round(v + (Math.random() - 0.5) * 60))));
      setFc((v) => Math.max(58, Math.min(110, Math.round(v + (Math.random() - 0.5) * 6))));
      setSpo2((v) => Math.max(90, Math.min(100, Math.round(v + (Math.random() - 0.5) * 1))));
      setPa(([s, d]) => [Math.max(100, Math.min(140, s + Math.round((Math.random() - 0.5) * 4))), d]);

      const now = new Date();
      setRecent((r) => {
        const next = [
          { t: now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }), temp, hum, fc },
          ...r,
        ].slice(0, 5);
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [temp, hum, fc]);

  const tempLvl: Level = temp >= 37.5 ? "Alto" : temp >= 36.8 ? "Moderado" : "Normal";
  const humLvl: Level = hum >= 75 ? "Alto" : hum >= 65 ? "Moderado" : "Normal";
  const luxLvl: Level = lux >= 800 ? "Alto" : lux >= 600 ? "Moderado" : "Normal";
  const spo2Lvl: Level = spo2 <= 93 ? "Alto" : spo2 <= 95 ? "Moderado" : "Normal";
  const fcLvl: Level = fc >= 100 || fc <= 60 ? "Moderado" : "Normal";

  // props para el panel de simulación
  const simProps = useMemo(
    () => ({
      setTemp, setHum, setActivity, setLux, setFc, setSpo2, setPa,
    }),
    []
  );

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-6 pb-28 md:pb-10">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-700 to-fuchsia-600 text-white p-5 mb-5 shadow-lg">
        <div className="flex items-center gap-3 text-2xl font-semibold">
          <span className="text-3xl">🧩</span> Monitoreo de Sensores
        </div>
        <div className="opacity-90">Estado actual de los sensores del trabajador</div>
      </div>

      {/* Cuatro tarjetas grandes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <BigCard
          icon="🌡️"
          title={`${temp.toFixed(1)}°C`}
          subtitle="Temperatura Corporal"
          level={tempLvl}
        />
        <BigCard
          icon="💧"
          title={`${hum}%`}
          subtitle="Humedad Ambiente"
          level={humLvl}
        />
        <BigCard
          icon="🚶"
          title={activity}
          subtitle="Actividad Física"
          level={activity}
        />
        <BigCard
          icon="🔆"
          title={`${lux} lux`}
          subtitle="Nivel de Luz"
          level={luxLvl}
        />
      </div>

      {/* biométricos + últimas lecturas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-3xl bg-white shadow p-4">
          <h3 className="font-semibold text-neutral-800 mb-3">Sensores Biométricos</h3>
          <BioRow icon="❤️" title="Frecuencia Cardíaca" value={`${fc} bpm`} level={fcLvl} />
          <BioRow icon="🫁" title="Saturación de Oxígeno" value={`${spo2}%`} level={spo2Lvl} />
          <BioRow icon="🔺" title="Presión Arterial" value={`${pa[0]}/${pa[1]}`} level="Normal" />
        </section>

        <section className="rounded-3xl bg-white shadow p-4">
          <h3 className="font-semibold text-neutral-800 mb-3">Últimas lecturas</h3>
          <div className="space-y-2">
            {recent.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-neutral-200 px-3 py-2"
              >
                <div className="text-neutral-500 text-sm">⏱️ {r.t}</div>
                <div className="flex items-center gap-3">
                  <Chip label={`${r.temp.toFixed(1)}°C`} />
                  <Chip label={`${r.hum}%`} />
                  <Chip label={`${r.fc} bpm`} />
                </div>
              </div>
            ))}
            {!recent.length && <div className="text-neutral-400 text-sm">Sin datos aún…</div>}
          </div>
        </section>
      </div>

      {/* mapa + emergencias + simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">
        <MapLive lat={0} lng={0} />
        <div className="rounded-3xl bg-white shadow p-4 flex flex-col gap-3">
          <EmergencyButton onClick={() => setEmOpen(true)} />
          <SimulatorPanel {...simProps} />
        </div>
      </div>

      <EmergencyOverlay open={emOpen} onClose={() => setEmOpen(false)} />
    </div>
  );
}

/* ————— Subcomponentes internos ————— */

function BigCard({
  icon, title, subtitle, level,
}: { icon: string; title: string; subtitle: string; level: Level }) {
  return (
    <div className="rounded-3xl bg-white shadow p-5">
      <div className="text-4xl">{icon}</div>
      <div className="mt-4 text-3xl font-extrabold text-neutral-900">{title}</div>
      <div className="text-neutral-500">{subtitle}</div>
      <span className={`inline-block mt-3 text-xs px-2.5 py-1 rounded-full ${badge(level)}`}>
        {level}
      </span>
    </div>
  );
}

function BioRow({ icon, title, value, level }: { icon: string; title: string; value: string; level: Level }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3 flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium text-neutral-800">{title}</div>
          <div className="text-neutral-500 text-sm">{value}</div>
        </div>
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full ${badge(level)}`}>{level}</span>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return <span className="text-xs rounded-full bg-neutral-100 px-2 py-0.5">{label}</span>;
}
