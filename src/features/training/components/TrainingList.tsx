import { useEffect, useState } from "react";
import { listTrainings, getTraining } from "../api";
import { Training } from "../types";

export default function TrainingList({
  selectedId,
  onSelect,
}: { selectedId?: string; onSelect?: (id: string) => void; }) {
  const [items, setItems] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await listTrainings();
      setItems(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-4">Cargando capacitaciones…</div>;
  if (!items.length) return <div className="p-4 text-slate-500">No hay capacitaciones creadas.</div>;

  return (
    <ul className="divide-y rounded-xl border">
      {items.map(t => (
        <li
          key={t.id}
          className={`p-4 cursor-pointer hover:bg-slate-50 ${selectedId===t.id?"bg-slate-50":""}`}
          onClick={() => onSelect?.(t.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-sm text-slate-500">{t.description}</p>
              <p className="text-xs text-slate-400 mt-1">
                Inicio: {new Date(t.startDate).toLocaleDateString()} · Horas: {t.hours}
                {t.certifies ? " · Certifica" : ""}
                {t.area ? ` · Área: ${t.area}` : ""}
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
