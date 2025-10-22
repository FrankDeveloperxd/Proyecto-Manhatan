import type { ReactNode } from "react";

type Color = "green" | "yellow" | "red" | "gray" | "blue" | "purple";

export default function Badge({
  color = "gray",
  children,
}: {
  color?: Color;
  children: ReactNode;
}) {
  const colors: Record<Color, string> = {
    green:  "bg-green-100 text-green-700 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red:    "bg-red-100 text-red-700 border-red-200",
    gray:   "bg-neutral-100 text-neutral-700 border-neutral-200",
    blue:   "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${colors[color]}`}>
      {children}
    </span>
  );
}
