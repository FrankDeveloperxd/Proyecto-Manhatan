import { useEffect, useState } from "react";
import { useAuthStore } from "../auth/authStore";
import Card from "../../componets/common/Card";
import AvatarUploader from "../../componets/profile/AvatarUploader";

export default function Home() {
  const { user, profile } = useAuthStore();
  const displayName = profile?.displayName || (user?.email?.split("@")[0] ?? "Usuario");
  const area  = profile?.area  || "Sin área";
  const code  = profile?.code  || "—";
  const photo = (profile as any)?.photoURL || null;

  // reloj
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = now.toLocaleTimeString("es-PE",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const d = now.toLocaleDateString("es-PE",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <div className="mx-auto max-w-7xl px-3 md:px-4 lg:px-6">
      {/* HERO: perfil + reloj */}
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Perfil */}
        <Card className="overflow-hidden p-0">
          <div className="h-28 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="-mt-12 px-6 pb-6">
            <div className="flex items-end gap-4">
              <AvatarUploader url={photo} size={96} />
              <div className="pb-1">
                <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-white">
                  {displayName}
                </h2>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{user?.email}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Tag icon="📍" label="Ubicación" value="Arequipa (AQP)" />
              <Tag icon="🗂️" label="Área" value={area} />
              <Tag icon="🪪" label="Código" value={code} />
            </div>
          </div>
        </Card>

        {/* Reloj */}
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-semibold tracking-wide">{h.replace(":00 "," ")}</div>
              <div className="text-sm md:text-base text-white/80 mt-2 capitalize">{d}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Segunda fila: QR + accesos rápidos */}
      <div className="grid gap-6 mt-6 xl:grid-cols-[1fr_420px]">
        {/* QR */}
        <Card className="p-0 overflow-hidden">
          <div className="px-6 pt-5">
            <h3 className="text-neutral-800 dark:text-white font-semibold">Código QR de Identificación</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Muestra este QR para control y registro.</p>
          </div>
          <div className="p-6">
            <div className="h-56 grid place-items-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <span className="text-neutral-400 dark:text-neutral-500">[ Tu QR aquí ]</span>
            </div>
            <div className="text-center text-xs text-neutral-400 mt-2">ID: {code}</div>
          </div>
        </Card>

        {/* Accesos rápidos */}
        <Card>
          <h3 className="text-neutral-800 dark:text-white font-semibold mb-3">Accesos rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickBtn emoji="📡" label="Ver Sensores"  to="/app/sensors" />
            <QuickBtn emoji="🕒" label="Asistencia"    to="/app/attendance" />
            <QuickBtn emoji="🎓" label="Capacitación"  to="/app/training" />
            <QuickBtn emoji="🗓️" label="Mi Agenda"     to="/app/agenda" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Tag({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 shadow-sm hover:shadow transition">
      <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
        <span>{icon}</span><span>{label}</span>
      </div>
      <div className="text-neutral-900 dark:text-neutral-100 text-sm mt-1">{value}</div>
    </div>
  );
}

function QuickBtn({ emoji, label, to }: { emoji: string; label: string; to: string }) {
  return (
    <a
      href={to}
      className="group rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
    >
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-sm text-neutral-800 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
        {label}
      </div>
    </a>
  );
}
