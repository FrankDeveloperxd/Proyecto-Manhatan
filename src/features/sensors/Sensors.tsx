import { useState } from "react";
import { Card, KPI, Badge } from "../../componets/common";
import EmergencyOverlay from "./EmergencyOverlay";

export default function Sensors() {
  const [emergency, setEmergency] = useState(false);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Monitoreo de Sensores</h2>

      <div className="grid md:grid-cols-4 gap-4">
        <KPI label="GPS" value="En vivo" sublabel="Conexión RTDB" />

        <Card>
          <div className="text-sm text-neutral-600 mb-1">Estado</div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
            <span className="text-xl font-semibold">Activo</span>
          </div>
          <div className="text-xs text-neutral-500 mt-1">Zona de trabajo</div>
        </Card>

        <Card>
          <div className="text-sm text-neutral-600 mb-1">Alerta</div>
          <Badge color="gray">Sin alertas</Badge>
        </Card>

        <KPI label="Última actualización" value="—" />
      </div>

      <Card className="overflow-hidden">
        <div className="h-72 grid place-items-center bg-neutral-100 text-neutral-500">
          Aquí irá el mapa (Leaflet/Mapbox) con puntos en vivo.
        </div>
      </Card>

      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white"
          onClick={() => setEmergency(true)}
        >
          Botón de Emergencia
        </button>
        <button className="px-4 py-2 rounded bg-neutral-100 hover:bg-neutral-200">
          Simular trabajador (demo)
        </button>
      </div>

      <EmergencyOverlay open={emergency} onClose={() => setEmergency(false)} />
    </div>
  );
}
