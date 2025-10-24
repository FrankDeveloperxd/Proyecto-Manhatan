import { MapContainer, TileLayer, Marker, Polyline, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Map as LeafletMap } from "leaflet";
import { useEffect, useMemo, useRef } from "react";

export type TrackPoint = { lat: number; lng: number; ts?: number };
type StatusKey = "connected" | "unstable" | "disconnected" | "no-data";

type Props = {
  lat?: number;
  lng?: number;
  lastSeenAt?: number | Date;
  track?: TrackPoint[];
  accuracy?: number;
};

export default function MapTrack({
  lat,
  lng,
  lastSeenAt,
  track = [],
  accuracy = 12,
}: Props) {
  const center = useMemo<[number, number] | undefined>(
    () => (lat != null && lng != null ? [lat, lng] : undefined),
    [lat, lng]
  );

  const status: StatusKey = useMemo(() => {
    if (!lastSeenAt) return "no-data";
    const t = lastSeenAt instanceof Date ? lastSeenAt.getTime() : lastSeenAt * 1000;
    const age = Date.now() - t;
    if (age < 60_000) return "connected";
    if (age < 5 * 60_000) return "unstable";
    return "disconnected";
  }, [lastSeenAt]);

  // Iconos visuales
  const liveIcon = useMemo(() => L.divIcon({ className: "pulse-dot" }), []);
  const staleIcon = useMemo(() => L.divIcon({ className: "stale-dot" }), []);

  // Reducir historial → 1 punto cada 5 min
  const filteredTrack = useMemo(() => {
    if (!track?.length) return [];
    const step = 5 * 60 * 1000; // 5 min
    const reduced: TrackPoint[] = [];
    let lastT = 0;
    for (const p of track) {
      const ts = (p.ts || Date.now());
      if (ts - lastT >= step) {
        reduced.push(p);
        lastT = ts;
      }
    }
    return reduced;
  }, [track]);

  const bounds = useMemo(() => {
    const pts = [...filteredTrack];
    if (center) pts.push({ lat: center[0], lng: center[1] });
    if (pts.length < 2) return null;
    return L.latLngBounds(pts.map((p) => [p.lat, p.lng]));
  }, [filteredTrack, center]);

  // Polyline (trayectoria reducida)
  const line: [number, number][] = filteredTrack.map((p) => [p.lat, p.lng]);

  // Subcomponente para fitBounds sin usar whenReady
  function FitBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
    const map = useMap();
    useEffect(() => {
      if (bounds) setTimeout(() => map.fitBounds(bounds.pad(0.2)), 100);
    }, [bounds, map]);
    return null;
  }

  if (!center) {
    return (
      <div
        style={{ height: 260 }}
        className="grid place-content-center text-sm text-slate-600 bg-slate-50 rounded-xl"
      >
        Sin coordenadas. Aún no hay posición registrada.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: 300 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {bounds && <FitBounds bounds={bounds} />}

      {line.length > 1 && <Polyline positions={line} />}
      <Circle center={center} radius={accuracy} />

      <Marker
        position={center}
        icon={status === "connected" || status === "unstable" ? liveIcon : staleIcon}
      />
    </MapContainer>
  );
}
