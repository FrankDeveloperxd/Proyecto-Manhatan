export default function Section({
  title, icon, subtitle, actions, children,
}: {
  title: string;
  icon?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-gradient-to-r from-[#4FAEDD] to-[#3e96c9] text-white shadow-md">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <div>
            <div className="text-lg font-semibold">{title}</div>
            {subtitle && <div className="text-sm opacity-90">{subtitle}</div>}
          </div>
        </div>
        {actions}
      </div>
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 rounded-b-xl">
        {children}
      </div>
    </div>
  );
}
