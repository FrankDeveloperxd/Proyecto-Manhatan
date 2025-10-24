// src/components/common/icons.tsx
import React from "react";

type IconProps = { size?: number; className?: string };

export const MenuIcon = ({ size = 20, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ChevronRightIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const HomeIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 10v10h14V10" />
  </svg>
);

export const UsersIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const BuildingIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
  </svg>
);

export const FileIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

export const SettingsIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82l.02.06a2 2 0 1 1-3.38 0l.02-.06A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33l-.06.02a2 2 0 1 1 0-3.38l.06.02A1.65 1.65 0 0 0 4.6 9c.26-.4.43-.87.6-1.34a1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3 4.6c.4-.26.87-.43 1.34-.6A1.65 1.65 0 0 0 4.6 3a1.65 1.65 0 0 0-.33-1.82l-.02-.06a2 2 0 1 1 3.38 0l-.02.06A1.65 1.65 0 0 0 9 4.6c.4.26.87.43 1.34.6A1.65 1.65 0 0 0 11 6c0 .35.07.69.2 1.01.14.35.34.67.6.94.27.26.59.46.94.6.32.13.66.2 1.01.2s.69-.07 1.01-.2c.35-.14.67-.34.94-.6.26-.27.46-.59.6-.94.13-.32.2-.66.2-1.01 0-.35-.07-.69-.2-1.01A1.65 1.65 0 0 0 19.4 3a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20 6.6c-.4.26-.87.43-1.34.6.26.4.43.87.6 1.34.26.4.43.87.6 1.34.4.26.87.43 1.34.6Z" />
  </svg>
);

export const ChartIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <rect x="7" y="8" width="3" height="7" />
    <rect x="12" y="5" width="3" height="10" />
    <rect x="17" y="11" width="3" height="4" />
  </svg>
);

export const CalendarIcon = ({ size = 18, className = "" }: IconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className}
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
