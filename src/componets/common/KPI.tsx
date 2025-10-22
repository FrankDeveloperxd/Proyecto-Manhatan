export default function KPI({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-4">
      <div className="text-sm text-neutral-600">{label}</div>
      <div className="text-2xl font-semibold mt-1 text-neutral-900">{value}</div>
      {sublabel && <div className="text-xs text-neutral-500 mt-1">{sublabel}</div>}
    </div>
  );
}
