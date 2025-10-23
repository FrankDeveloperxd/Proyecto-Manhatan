export default function HomeIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill={active ? "#6366f1" : "currentColor"}
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 9.75L12 3l9 6.75M4.5 10.5v10.125a.375.375 0 00.375.375H9.75v-5.25h4.5v5.25h4.875a.375.375 0 00.375-.375V10.5"
      />
    </svg>
  );
}
