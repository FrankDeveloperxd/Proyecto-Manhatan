import { doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../lib/firebase";
import type { Worker } from "./types";
import { QRCodeSVG } from "qrcode.react";

export default function PublicWorkerPage() {
  const { wid } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!wid) return;
      const ref = doc(db, "workers", wid);
      const snap = await getDoc(ref);
      setData(snap.exists() ? ({ id: snap.id, ...(snap.data() as Worker) }) : null);
      setLoading(false);
    })();
  }, [wid]);

  const initials = useMemo(() => getInitials(data?.fullName || ""), [data?.fullName]);
  const url = useMemo(() => (data?.id ? `${window.location.origin}/ficha-worker/${data.id}` : ""), [data?.id]);

  if (loading) return <Skeleton />;

  if (!data?.registered || data.public === false) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold">Ficha no disponible</h2>
        <p className="text-slate-600 mt-2">El trabajador no existe o su ficha no es pública.</p>
        <div className="mt-6">
          <button onClick={() => nav(-1)} className="rounded-xl px-4 py-2 bg-slate-900 text-white">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-cyan-50 fade-in">
      {/* Top hero */}
      <header className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500">
        <div className="max-w-6xl mx-auto px-5 py-8 text-white">
          <div className="flex items-center gap-3 slide-up" style={{animationDelay:"60ms"}}>
            <div className="icon-badge">
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-5.33 0-8 2.67-8 6v1h16v-1c0-3.33-2.67-6-8-6"/></svg>
            </div>
            <div>
              <div className="text-lg font-semibold">Información Personal</div>
              <div className="text-white/85 text-sm">Datos médicos y personales del trabajador</div>
            </div>
          </div>

          {/* Hero card */}
          <div className="mt-5 glass text-slate-900 px-5 py-4 slide-up" style={{animationDelay:"110ms"}}>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border border-white/70 bg-white/60 grid place-content-center">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt="Foto" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-slate-700">{initials}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-semibold leading-tight">{data.fullName}</div>
                <div className="text-slate-600">{data.role}{data.area ? ` · ${data.area}` : ""}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.companyName && <span className="pill">{data.companyName}</span>}
                  {data.code && <span className="pill">#{data.code}</span>}
                  {data.registryNumber && <span className="pill">Reg. {data.registryNumber}</span>}
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <a href={url} target="_blank" className="rounded-xl bg-white/80 hover:bg-white px-4 py-2 text-sm font-medium shadow">
                  Abrir enlace
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(url).then(()=>alert("URL copiada"))}
                  className="rounded-xl bg-slate-900 text-white hover:opacity-95 px-4 py-2 text-sm font-medium shadow"
                >
                  Copiar URL
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-5 py-8 grid lg:grid-cols-3 gap-6">
        {/* Col izquierda: QR + Institucional */}
        <div className="space-y-6 lg:col-span-1">
          <section className="glass p-5 slide-up" style={{animationDelay:"140ms"}}>
            <div className="flex items-center gap-2 mb-3">
              <div className="icon-badge">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M3 3h8v8H3zM5 5v4h4V5zm6 6h2v2h-2zm0-8h2v6h-2zm4 0h6v6h-6zm2 2v2h2V5zM3 13h6v8H3zm2 2v4h2v-4zm8 0h2v2h-2zm0 4h2v2h-2zm4-4h4v2h-2v2h-2zm0 6h4v2h-4z"/></svg>
              </div>
              <h3 className="font-semibold">Código QR</h3>
            </div>
            <div className="flex justify-center py-2">
              {url ? <QRCodeSVG value={url} size={220} /> : null}
            </div>
            <p className="text-xs text-slate-600 break-all text-center">{url}</p>
          </section>

          <Card title="Datos Institucionales" delay="160ms">
            <KV label="Empresa / Institución" value={data.companyName}/>
            <KV label="Área" value={data.area}/>
            <KV label="Rol / Cargo" value={data.role}/>
            <KV label="Código" value={data.code}/>
            <KV label="N° Registro" value={data.registryNumber}/>
          </Card>
        </div>

        {/* Col derecha: Personales + Médica + Contactos */}
        <div className="space-y-6 lg:col-span-2">
          <Card title="Datos Personales" icon="profile" delay="140ms">
            <div className="grid md:grid-cols-2 gap-3">
              <KV label="Nombre Completo" value={data.fullName}/>
              <KV label="DNI" value={data.dni}/>
              <KV label="Fecha de Nacimiento" value={fmtDate(data.birthDate)}/>
              <KV label="Edad" value={data.age}/>
              <KV label="Dirección" value={data.address}/>
              <KV label="Teléfono" value={data.phone}/>
              <KV label="Email" value={data.email}/>
              <KV label="Estado Civil" value={data.civilStatus}/>
            </div>
          </Card>

          <Card title="Información Médica" icon="health" delay="170ms">
            <div className="rounded-xl p-3 bg-rose-50 border border-rose-100">
              <div className="flex items-center gap-2 text-rose-700">
                <div className="h-6 w-6 grid place-content-center rounded-lg bg-white border border-rose-200">
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0 1 7.5 3a5.38 5.38 0 0 1 4.5 2.4A5.38 5.38 0 0 1 16.5 3A5.5 5.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.53Z"/></svg>
                </div>
                <div className="font-medium">Tipo de Sangre</div>
              </div>
              <div className="text-3xl font-semibold text-rose-700 mt-1">{toText(data.bloodType)}</div>
            </div>

            <BlockList
              title="Alergias"
              color="amber"
              items={data.allergies}
              empty="Sin alergias registradas"
              icon={<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2"/></svg>}
            />
            <BlockList
              title="Medicamentos Actuales"
              color="violet"
              items={data.medications}
              empty="Sin medicamentos"
              icon={<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3H5v6h14V3Zm-2 2v2H7V5h10ZM5 13v8h14v-8H5Zm2 2h10v4H7v-4Z"/></svg>}
            />
            <BlockList
              title="Condiciones"
              color="sky"
              items={data.conditions}
              empty="Sin condiciones registradas"
              icon={<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z"/></svg>}
            />
          </Card>

          <Card title="Contactos de Emergencia" icon="phone" delay="200ms">
            {data.emergencyContacts?.length ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.emergencyContacts.map((c, i) => (
                  <div key={i} className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.name || "—"}</div>
                      {c.primary ? <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 border border-emerald-200">Principal</span> : null}
                    </div>
                    <div className="text-sm text-slate-600">{c.relationship || "—"}</div>
                    <a className="text-sm text-sky-700 hover:underline" href={c.phone ? `tel:${c.phone}` : undefined}>
                      {c.phone || "—"}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600">No hay contactos registrados.</div>
            )}
          </Card>
        </div>
      </main>

      {/* Menú inferior fijo */}
      <nav className="sticky bottom-0 z-40">
        <div className="max-w-6xl mx-auto px-5 pb-5">
          <div className="glass px-3 py-2 flex items-center justify-between">
            <Btn onClick={() => nav(-1)} icon="back">Volver</Btn>
            <div className="flex items-center gap-2">
              <Btn onClick={() => window.location.href = '/app'} icon="home">Inicio</Btn>
              <Btn onClick={() => navigator.clipboard.writeText(url).then(()=>alert("URL copiada"))} icon="share">Compartir</Btn>
              <a href={url} target="_blank" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-slate-900 text-white">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m14 3l7 7l-1.5 1.5l-1.8-1.8L13 14l-3 1l1-3l4.7-4.7l-1.8-1.8zM4 5h7v2H6v12h12v-5h2v7H4z"/></svg>
                Abrir
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

/* ---------- UI bits ---------- */
function Skeleton() {
  return (
    <div className="min-h-[60dvh] grid place-content-center p-6">
      <div className="h-24 w-[80vw] max-w-3xl rounded-2xl bg-slate-200 animate-pulse" />
    </div>
  );
}

function Card({ title, icon, delay, children }:{
  title: string; icon?: "profile"|"health"|"phone"; delay?: string; children: React.ReactNode;
}) {
  return (
    <section className="glass p-5 slide-up" style={{animationDelay:delay||"0ms"}}>
      <div className="flex items-center gap-2 mb-3">
        <div className="icon-badge">
          {icon==="profile" && (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5a5 5 0 0 0 5 5m0 2c-5.33 0-8 2.67-8 6v1h16v-1c0-3.33-2.67-6-8-6"/></svg>)}
          {icon==="health" && (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35 10.55 20.03C5.4 15.36 2 12.28 2 8.5A5.5 5.5 0 0 1 7.5 3a5.38 5.38 0 0 1 4.5 2.4A5.38 5.38 0 0 1 16.5 3A5.5 5.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8.55 11.53Z"/></svg>)}
          {icon==="phone" && (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 10.8a15.05 15.05 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.05-.24 11.36 11.36 0 0 0 3.55.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 7a1 1 0 0 1 1-1h3.47a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.55 1 1 0 0 1-.24 1.05Z"/></svg>)}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function KV({ label, value }:{ label: string; value?: any }) {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white/80 px-3 py-2">
      <div className="text-slate-500 text-sm">{label}</div>
      <div className="font-medium break-words">{toText(value)}</div>
    </div>
  );
}

function BlockList({
  title, items, empty, color, icon,
}:{
  title: string; items?: string[]; empty: string; color: "amber"|"violet"|"sky"; icon?: React.ReactNode;
}) {
  const theme =
    color === "amber"  ? "bg-amber-50 border-amber-100"
  : color === "violet" ? "bg-violet-50 border-violet-100"
  :                      "bg-sky-50 border-sky-100";

  return (
    <div className={`mt-3 rounded-xl border ${theme} p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-lg bg-white border grid place-content-center">{icon}</div>
        <div className="font-medium">{title}</div>
      </div>
      {items?.length ? (
        <div className="grid gap-2">
          {items.map((t, i) => (
            <div key={i} className="rounded-lg border bg-white/80 px-3 py-2 text-sm">{t}</div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-600">{empty}</div>
      )}
    </div>
  );
}

function Btn({ children, onClick, icon }:{
  children: React.ReactNode; onClick?: ()=>void; icon?: "back"|"home"|"share";
}) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-white/80 hover:bg-white border">
      {icon==="back" && (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m11 7l-5 5l5 5V7Zm-7 5a8 8 0 1 0 8-8V2A10 10 0 1 1 2 12h2Z"/></svg>)}
      {icon==="home" && (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="m12 3l9 8h-3v9H6v-9H3l9-8Z"/></svg>)}
      {icon==="share" && (<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.2 3.2 0 0 0 0-1.39l7-4.11A2.99 2.99 0 1 0 14 5a3 3 0 0 0 .06.59l-7 4.11a3 3 0 1 0 0 4.6l7.05 4.13c-.04.19-.06.39-.06.59a3 3 0 1 0 3-3Z"/></svg>)}
      {children}
    </button>
  );
}

/* ---------- helpers ---------- */
function getInitials(name: string) {
  if (!name) return "—";
  return name.split(" ").filter(Boolean).slice(0,2).map(n=>n[0].toUpperCase()).join("");
}
function fmtDate(s?: string) {
  if (!s) return "—";
  let d = new Date(s);
  if (isNaN(d.getTime()) && /^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/"); d = new Date(+yyyy, +mm-1, +dd);
  }
  return isNaN(d.getTime()) ? s : d.toLocaleDateString();
}
function toText(v:any){ return v===undefined || v===null || v==="" ? "—" : String(v); }

