// src/features/sensors/MapTrack.tsx
import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Polyline,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type TrackPoint = {
  lat: number;
  lng: number;
  ts?: number;
};

type Props = {
  lat?: number;
  lng?: number;
  lastSeenAt?: number;
  track?: TrackPoint[];
  accuracy?: number; // radio en metros aprox
};

const TECSUP_AQP = { lat: -16.409047, lng: -71.537451 };

function RecenterOnPosition({ position }: { position: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position);
  }, [map, position]);

  return null;
}

export default function MapTrack({
  lat,
  lng,
  track = [],
  accuracy = 12,
}: Props) {
  const hasFix = typeof lat === "number" && typeof lng === "number";

  // Centro principal del mapa
  const center: LatLngExpression = hasFix
    ? [lat as number, lng as number]
    : [TECSUP_AQP.lat, TECSUP_AQP.lng];

  // Polilínea con el rastro (si mandas track en el futuro)
  const polyline: LatLngExpression[] = track.map((p) => [p.lat, p.lng]);

  // Posición del marcador: si hay fix, esa. Si no, la última del track.
  const markerPos: LatLngExpression | undefined = hasFix
    ? [lat as number, lng as number]
    : polyline.length
    ? polyline[polyline.length - 1]
    : undefined;

  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-slate-200"
      style={{ height: 280 }}
    >
      <MapContainer
        center={center}
        zoom={17}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔁 se recentra cada vez que cambian las coords */}
        <RecenterOnPosition position={center} />

        {/* Línea de ruta (si algún día mandas un array de puntos) */}
        {polyline.length > 1 && (
          <Polyline
            positions={polyline}
            pathOptions={{
              color: "#2563eb",
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}

        {/* Punto del trabajador + “burbujita” de precisión */}
        {markerPos && (
          <>
            <Marker position={markerPos} />
            <Circle
              center={markerPos}
              radius={accuracy}
              pathOptions={{
                color: "#3b82f6",
                weight: 2,
                fillOpacity: 0.15,
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
