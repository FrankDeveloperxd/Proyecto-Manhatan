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
    <div className="card card--glow">
      <div className="section-header">
        {icon && <span className="text-xl">{icon}</span>}
        <div className="flex-1">
          <div className="section-title">{title}</div>
          {subtitle && <div className="section-sub">{subtitle}</div>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
