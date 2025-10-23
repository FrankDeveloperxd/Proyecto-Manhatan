import { QRCodeSVG } from "qrcode.react";
import type { Worker } from "./types";

export default function WorkerQRModal({
  open, onClose, worker,
}: { open: boolean; onClose: () => void; worker?: Worker }) {
  if (!open || !worker) return null;

  // Si hay id, el QR es URL pública; si no, caemos a JSON
  const url = worker.id ? `${window.location.origin}/ficha-worker/${worker.id}` : null;
  const qrValue = url ?? JSON.stringify(worker);

  const copy = async () => {
    try {
      if (url) {
        await navigator.clipboard.writeText(url);
        alert("URL copiada al portapapeles");
      }
    } catch {
      alert("No se pudo copiar la URL");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg">
        <h3 className="font-semibold mb-2">QR del trabajador</h3>
        <div className="flex justify-center my-4">
          <QRCodeSVG value={qrValue} size={260} />
        </div>

        {url ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="truncate">{url}</div>
            <button className="btn" onClick={copy}>Copiar URL</button>
          </div>
        ) : (
          <p className="text-xs break-all">{qrValue}</p>
        )}

        <div className="text-right mt-4">
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
