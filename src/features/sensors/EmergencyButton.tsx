export default function EmergencyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl bg-red-600 text-white py-3 font-medium shadow hover:bg-red-500 active:scale-[.99] transition"
      title="Enviar alerta de emergencia"
    >
      🚨 Botón de Emergencia
    </button>
  );
}
