import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  className?: string;
}
export default function Card({ children, className }: Props) {
  return (
    <div className={`bg-white border border-neutral-200 rounded-2xl p-4 ${className ?? ""}`}>
      {children}
    </div>
  );
}
