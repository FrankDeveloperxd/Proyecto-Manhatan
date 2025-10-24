// src/features/sensors/MapLive.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  showMarker?: boolean;
  height?: number;
};

export default function MapLive({ lat, lng, showMarker = true, height = 280 }: Props) {
  const center: [number, number] = [lat, lng];

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden border">
      <MapContainer center={center} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showMarker && (
          <Marker position={center}>
            <Popup>Ubicación actual</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
