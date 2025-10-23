export default function Tag({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-neutral-600 text-sm">
        <span className="text-base">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <div className="mt-1 text-neutral-900 text-sm sm:text-[15px]">{value}</div>
    </div>
  );
}
