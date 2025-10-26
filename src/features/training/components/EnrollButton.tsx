import { useState } from "react";
import { enrollWorker } from "../api";

export default function EnrollButton({ wid, trainingId }: { wid: string; trainingId: string }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function doEnroll() {
    setLoading(true);
    await enrollWorker(wid, trainingId);
    setLoading(false);
    setOk(true);
  }

  if (ok) return <span className="text-emerald-600 text-sm">Inscrito ✓</span>;
  return (
    <button className="text-sm px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-60"
            onClick={doEnroll} disabled={loading}>
      {loading ? "Inscribiendo..." : "Inscribirme"}
    </button>
  );
}
