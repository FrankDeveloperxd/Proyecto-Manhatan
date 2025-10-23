export type FilterKey = "todos" | "en-curso" | "proximos" | "certificados";

export default function FilterChips({
  value, onChange,
}: { value: FilterKey; onChange: (k: FilterKey) => void }) {
  const items: { k: FilterKey; label: string }[] = [
    { k: "todos", label: "Todos" },
    { k: "en-curso", label: "En curso" },
    { k: "proximos", label: "Próximos" },
    { k: "certificados", label: "Certificados" },
  ];
  return (
    <div className="chips">
      {items.map(({ k, label }) => (
        <button
          key={k}
          className={`chip ${value === k ? "chip--active" : ""}`}
          onClick={() => onChange(k)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
