import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../lib/firebase";
import type { Worker } from "./types";

export default function PublicWorkerPage() {
  const { wid } = useParams(); // worker id
  const [data, setData] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!wid) return;
      const ref = doc(db, "workers", wid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setData({ id: snap.id, ...(snap.data() as Worker) });
      } else {
        setData(null);
      }
      setLoading(false);
    })();
  }, [wid]);

  if (loading) return <div className="p-6">Cargando ficha…</div>;
  if (!data?.registered || data.public === false) return <div className="p-6">Ficha no disponible.</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <Card title="Datos Personales">
        <TwoCol label="Nombre completo" value={data.fullName} />
        <TwoCol label="DNI" value={data.dni} />
        <TwoCol label="Fecha de nacimiento" value={data.birthDate} />
        <TwoCol label="Edad" value={data.age} />
        <TwoCol label="Dirección" value={data.address} />
        <TwoCol label="Teléfono" value={data.phone} />
        <TwoCol label="Email" value={data.email} />
        <TwoCol label="Estado civil" value={data.civilStatus} />
      </Card>

      <Card title="Información Médica">
        <TwoCol label="Tipo de sangre" value={data.bloodType} />
        <TwoCol label="Alergias" value={data.allergies?.join(", ")} />
        <TwoCol label="Condiciones" value={data.conditions?.join(", ")} />
        <TwoCol className="col-span-2" label="Medicamentos" value={data.medications?.join(", ")} />
      </Card>

      <Card title="Contactos de Emergencia">
        {data.emergencyContacts?.length ? (
          <div className="space-y-2 col-span-2">
            {data.emergencyContacts.map((c, i) => (
              <div key={i} className="border rounded-lg p-3 text-sm">
                <div className="font-medium">{c.name} {c.primary ? <span className="text-green-700">· Principal</span> : null}</div>
                <div className="opacity-80">{c.relationship}</div>
                <div className="opacity-80">{c.phone}</div>
              </div>
            ))}
          </div>
        ) : (
          <TwoCol className="col-span-2" label="Contactos" value="—" />
        )}
      </Card>

      <Card title="Datos Institucionales">
        <TwoCol label="Empresa" value={data.companyName} />
        <TwoCol label="Área" value={data.area} />
        <TwoCol label="Rol" value={data.role} />
        <TwoCol label="Código" value={data.code} />
        <TwoCol label="N° Registro" value={data.registryNumber} />
      </Card>
    </div>
  );
}

/* ====== UI helpers ====== */
function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white text-black p-5 shadow border border-slate-200">
      <div className="text-lg font-semibold">{props.title}</div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">{props.children}</div>
    </div>
  );
}
function TwoCol(props: { label: string; value?: any; className?: string }) {
  return (
    <div className={props.className ?? ""}>
      <div className="text-slate-600">{props.label}</div>
      <div className="font-medium break-words">{(props.value ?? "—").toString()}</div>
    </div>
  );
}
