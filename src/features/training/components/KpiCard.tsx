export default function KpiCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card card-hover" style={{ padding: "18px" }}>
      <div
        className="w-10 h-10 rounded-xl mb-2"
        style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}
        aria-hidden
      />
      <div className="text-2xl font-semibold text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500">{label}</div>
    </div>
  );
}
