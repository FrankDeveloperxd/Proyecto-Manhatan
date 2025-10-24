type Props = {
  setTemp: (v: number | ((x: number) => number)) => void;
  setHum: (v: number | ((x: number) => number)) => void;
  setActivity: (v: "Normal" | "Moderado" | "Alto") => void;
  setLux: (v: number | ((x: number) => number)) => void;
  setFc: (v: number | ((x: number) => number)) => void;
  setSpo2: (v: number | ((x: number) => number)) => void;
  setPa: (v: [number, number] | ((x: [number, number]) => [number, number])) => void;
};

export default function SimulatorPanel(p: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-3">
      <div className="font-semibold mb-2">Panel de simulación</div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <button className="btn" onClick={() => p.setTemp(38.2)}>Fiebre</button>
        <button className="btn" onClick={() => p.setTemp(36.5)}>Normal</button>

        <button className="btn" onClick={() => p.setHum(80)}>Humedad alta</button>
        <button className="btn" onClick={() => p.setHum(55)}>Humedad ok</button>

        <button className="btn" onClick={() => p.setActivity("Alto")}>Actividad alta</button>
        <button className="btn" onClick={() => p.setActivity("Normal")}>Actividad baja</button>

        <button className="btn" onClick={() => p.setFc(105)}>FC alta</button>
        <button className="btn" onClick={() => p.setFc(72)}>FC ok</button>

        <button className="btn" onClick={() => p.setSpo2(92)}>SpO₂ baja</button>
        <button className="btn" onClick={() => p.setSpo2(98)}>SpO₂ ok</button>
      </div>

      <style>{`.btn{ @apply rounded-lg border border-neutral-200 px-2 py-1 bg-white hover:bg-neutral-50; }`}</style>
    </div>
  );
}
