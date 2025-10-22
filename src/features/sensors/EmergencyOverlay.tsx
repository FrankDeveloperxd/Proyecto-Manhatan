import React from "react";

type EmergencyOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function EmergencyOverlay({ open, onClose }: EmergencyOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 grid place-items-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
        <div className="text-6xl mb-3">🚨</div>
        <h3 className="text-xl font-semibold mb-1">Emergencia activada</h3>
        <p className="text-neutral-600">
          Se notificó a los supervisores con tu ubicación.
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded bg-neutral-900 text-white hover:bg-neutral-800"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
