import { useEffect, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import Card from "../../componets/common/Card";

function Clock({ initial24=true }){
  const [use24, setUse24] = useState(initial24);
  const [now, setNow] = useState(new Date());
  useEffect(()=>{ const id=setInterval(()=>setNow(new Date()),1000); return ()=>clearInterval(id); },[]);
  const time = use24 ? now.toLocaleTimeString("es-PE",{hour12:false}) : now.toLocaleTimeString("es-PE",{hour12:true});
  const date = now.toLocaleDateString("es-PE",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Hora actual</h3>
        <button onClick={()=>setUse24(v=>!v)} className="text-xs underline">Formato {use24?"12h":"24h"}</button>
      </div>
      <div className="text-3xl mt-2 font-mono">{time}</div>
      <div className="text-sm text-neutral-500 capitalize">{date}</div>
    </Card>
  );
}

export default function Home(){
  const { user, profile } = useAuthStore();
  const name = profile?.displayName ?? "Trabajador";
  const area = profile?.area ?? "Área no asignada";
  const code = profile?.code ?? "—";

  return (
    <div className="space-y-4">
      {/* Cabecera de perfil */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-neutral-100 grid place-items-center text-2xl">🧑‍🚒</div>
          <div>
            <h2 className="text-lg font-semibold">{name}</h2>
            <div className="text-neutral-600 text-sm">{area}</div>
            <div className="text-neutral-500 text-xs">Código: {code}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Card><div className="text-sm text-neutral-600">Ubicación</div><div className="font-medium">Arequipa (AQP)</div></Card>
          <Card><div className="text-sm text-neutral-600">Cargo</div><div className="font-medium">Seguridad y Salud</div></Card>
          <Card><div className="text-sm text-neutral-600">Proyecto</div><div className="font-medium">Minería y Procesos</div></Card>
          <Card><div className="text-sm text-neutral-600">ID</div><div className="font-medium">{code}</div></Card>
        </div>
      </Card>

      {/* Reloj + QR */}
      <div className="grid md:grid-cols-2 gap-4">
        <Clock initial24={true}/>
        <Card className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Código QR de Identificación</h3>
            <p className="text-sm text-neutral-600">Datos personales y médicos (solo lectura).</p>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-sm">Mostrar QR</button>
              <button className="px-3 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-sm">Imprimir</button>
            </div>
          </div>
          <div className="h-28 w-28 rounded-xl bg-neutral-200 grid place-items-center font-mono text-xs">
            QR
          </div>
        </Card>
      </div>

      {/* Accesos rápidos */}
      <div className="grid md:grid-cols-3 gap-4">
        <a href="/app/sensors" className="block">
          <Card>
            <div className="text-2xl">🛰️</div>
            <div className="font-semibold">Ver Sensores</div>
            <div className="text-sm text-neutral-600">Monitoreo en tiempo real</div>
          </Card>
        </a>
        <a href="/app/attendance" className="block">
          <Card>
            <div className="text-2xl">🕒</div>
            <div className="font-semibold">Registrar Asistencia</div>
            <div className="text-sm text-neutral-600">Entrada, salida y pausas</div>
          </Card>
        </a>
        <a href="/app/agenda" className="block">
          <Card>
            <div className="text-2xl">🗓️</div>
            <div className="font-semibold">Mi Agenda</div>
            <div className="text-sm text-neutral-600">Eventos del día</div>
          </Card>
        </a>
      </div>
    </div>
  );
}
