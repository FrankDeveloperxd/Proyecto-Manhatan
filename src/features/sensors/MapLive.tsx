import { useEffect, useMemo, useState } from "react";

/**
 * Mapa liviano (sin dependencias):
 * - Fondo SVG con estilo de mapa (barrios, río Chili, vías)
 * - Ruta simulada por el centro de Arequipa
 * - Marcador que avanza lento con halo
 */
export default function MapLive() {
  // Ruta en coordenadas del viewBox (no son lat/lng reales, pero representan el centro AQP)
  const route = useMemo(
    () => [
      [20, 75], // Miraflores
      [35, 70],
      [48, 64], // Puente Grau
      [55, 58],
      [60, 52], // Plaza de Armas
      [65, 48],
      [72, 45], // Monasterio Santa Catalina
      [78, 50],
      [82, 58],
      [88, 66], // Yanahuara
      [82, 72],
      [72, 78],
      [60, 80], // regreso por el sur
      [48, 76],
      [35, 72],
    ],
    []
  );

  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0); // 0..1 interpolación dentro del segmento actual

  // Avance LENTO: cada 2.2s avanza 0.2 del segmento; al completar 1, pasa al siguiente
  useEffect(() => {
    const id = setInterval(() => {
      setT((v) => {
        const next = v + 0.2;
        if (next >= 1) {
          setIdx((i) => (i + 1) % (route.length - 1));
          return 0;
        }
        return next;
      });
    }, 2200);
    return () => clearInterval(id);
  }, [route.length]);

  const p0 = route[idx];
  const p1 = route[(idx + 1) % route.length];
  const x = p0[0] + (p1[0] - p0[0]) * t;
  const y = p0[1] + (p1[1] - p0[1]) * t;

  return (
    <div className="rounded-3xl bg-white shadow p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-semibold text-neutral-800">Ubicación en tiempo real</h3>
        <div className="text-xs text-neutral-500">Arequipa, Perú · simulado</div>
      </div>

      <div className="relative h-64 rounded-2xl overflow-hidden border border-neutral-200">
        {/* SVG estilo mapa (tile-like) */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {/* terreno */}
          <defs>
            <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#eef3f8" />
              <stop offset="100%" stopColor="#e6edf4" />
            </linearGradient>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#dfe6ee" strokeWidth="0.2" />
            </pattern>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.6" />
            </filter>
          </defs>

          <rect width="100" height="100" fill="url(#land)" />
          <rect width="100" height="100" fill="url(#grid)" opacity="0.35" />

          {/* Río Chili (aprox) */}
          <path
            d="M 0 40 C 20 35, 40 60, 60 58 C 80 56, 90 40, 100 45"
            fill="none"
            stroke="#8cc5ff"
            strokeWidth="3.5"
            opacity="0.7"
            filter="url(#soft)"
          />

          {/* Vías principales (estilo claro) */}
          <g stroke="#c8cfd8" strokeWidth="2" opacity="0.9">
            <path d="M10 20 L90 20" />
            <path d="M15 35 L85 35" />
            <path d="M12 50 L88 50" />
            <path d="M8 65 L92 65" />
            <path d="M20 10 L20 90" />
            <path d="M40 12 L40 88" />
            <path d="M60 10 L60 90" />
            <path d="M80 15 L80 85" />
          </g>

          {/* Ruta simulada (violeta) */}
          <polyline
            points={route.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Marcador */}
          <g>
            <circle cx={x} cy={y} r="1.6" fill="#2563eb" />
            <circle cx={x} cy={y} r="5" fill="#93c5fd" opacity="0.25">
              <animate attributeName="r" from="3" to="7" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.35" to="0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        * Fondo vectorial “tipo mapa” + recorrido urbano (Plaza de Armas · Yanahuara · Miraflores). Sin dependencias.
      </p>
    </div>
  );
}
