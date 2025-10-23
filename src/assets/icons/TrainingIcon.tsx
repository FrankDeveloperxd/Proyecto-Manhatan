export default function TrainingIcon({ active = false }: { active?: boolean }) {
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
        d="M12 3l8.5 4.5-8.5 4.5L3.5 7.5 12 3zM3.5 7.5v6L12 18l8.5-4.5v-6"
      />
    </svg>
  );
}
