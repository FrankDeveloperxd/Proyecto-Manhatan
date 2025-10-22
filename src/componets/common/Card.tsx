import type { ReactNode } from "react";

export default function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}
