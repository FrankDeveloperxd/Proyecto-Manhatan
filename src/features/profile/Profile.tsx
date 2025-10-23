import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../lib/firebase";

// intenta usar tu store si existe (no toco otros archivos)
let useAuthStore: any;
try {
  // @ts-ignore
  useAuthStore = require("../auth/authStore").useAuthStore;
} catch {}

type UserDoc = {
  displayName?: string;
  email?: string;
  code?: string;
  role?: string;
  area?: string;
  bloodType?: string;
  allergies?: string;
  meds?: string;
  avatarUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  registered?: boolean;
  public?: boolean;
};

// ---------- Firestore helpers (colección "users") ----------
async function loadUser(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as Partial<UserDoc>) : null;
}

async function saveUser(uid: string, payload: Partial<UserDoc>) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
}

/* =============== PERFIL PRIVADO (form + QR) ================== */
export default function Profile() {
  const store = useAuthStore?.() ?? {};
  // 1) tomamos UID del store si está; 2) si no, lo tomamos de Firebase Auth
  const [uid, setUid] = useState<string | null>(store?.user?.uid ?? null);

  useEffect(() => {
    // si luego el store hidrata, lo usamos
    if (store?.user?.uid) setUid(store.user.uid);
  }, [store?.user?.uid]);

  useEffect(() => {
    if (uid) return; // ya tenemos uid
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u?.uid) setUid(u.uid);
    });
    return () => unsub();
  }, [uid]);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<UserDoc>({
    displayName: "",
    email: store?.user?.email ?? "",
    code: "",
    role: "Técnico en SST",
    area: "",
    bloodType: "",
    allergies: "",
    meds: "",
    avatarUrl: "",
    registered: false,
    public: true,
  });

  // carga inicial desde Firestore cuando ya hay uid
  useEffect(() => {
    if (!uid) return;
    (async () => {
      const data = await loadUser(uid);
      if (data) {
        setForm((prev) => ({
          ...prev,
          ...data,
          email: data.email ?? store?.user?.email ?? prev.email,
          registered: data.registered ?? false,
          public: data.public ?? true,
        }));
        store?.setProfile?.(data);
      }
    })();
  }, [uid]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSave = async () => {
    try {
      if (!uid) {
        alert("No se detectó el usuario. Vuelve a entrar a la app.");
        return;
      }
      setSaving(true);

      const payload: Partial<UserDoc> = {
        displayName: (form.displayName ?? "").trim(),
        email: (form.email ?? "").trim(),
        code: (form.code ?? "").trim(),
        role: (form.role ?? "").trim(),
        area: (form.area ?? "").trim(),
        bloodType: (form.bloodType ?? "").trim(),
        allergies: (form.allergies ?? "").trim(),
        meds: (form.meds ?? "").trim(),
        avatarUrl: (form.avatarUrl ?? "").trim(),
        registered: true,          // 🔵 queda registrado
        public: form.public ?? true,
      };
      if (!form.createdAt) payload.createdAt = serverTimestamp();

      await saveUser(uid, payload);

      // 🔵 activamos el estado para que muestre el QR sin recargar
      setForm((f) => ({ ...f, registered: true }));
      store?.setProfile?.(payload);

      // feedback
      alert("Perfil guardado y registrado ✅");
    } catch (err: any) {
      console.error(err);
      alert(`No se pudo guardar: ${err?.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = useMemo(() => (uid ? `${window.location.origin}/ficha/${uid}` : ""), [uid]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Información Personal</h2>

      {/* Tarjeta 1: datos personales (cielo) */}
      <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 grid md:grid-cols-2 gap-4">
        <LabeledInput label="Nombre" name="displayName" value={form.displayName ?? ""} onChange={onChange} />
        <LabeledInput label="Email" name="email" value={form.email ?? ""} onChange={onChange} placeholder="correo@empresa.com" />
        <LabeledInput label="Código" name="code" value={form.code ?? ""} onChange={onChange} placeholder="Ej. ADMIN-001 / T2024-001" />
        <LabeledInput label="Cargo" name="role" value={form.role ?? ""} onChange={onChange} placeholder="Técnico en SST" />
        <LabeledInput label="Área" name="area" value={form.area ?? ""} onChange={onChange} placeholder="Oficina / Planta / ..." className="md:col-span-2" />
      </div>

      {/* Tarjeta 2: datos médicos (cielo) */}
      <div className="rounded-2xl bg-sky-50 border border-sky-200 p-4 grid md:grid-cols-3 gap-4">
        <LabeledInput label="Tipo de Sangre" name="bloodType" value={form.bloodType ?? ""} onChange={onChange} placeholder="O+, A-, etc." />
        <LabeledInput label="Alergias" name="allergies" value={form.allergies ?? ""} onChange={onChange} placeholder="Penicilina, polen..." isTextArea />
        <LabeledInput label="Medicamentos" name="meds" value={form.meds ?? ""} onChange={onChange} placeholder="Nombre, dosis, frecuencia" isTextArea />
      </div>

      {/* Acción + estado registrado + QR al final */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <button
          onClick={onSave}
          disabled={saving || !uid}
          className="rounded-xl px-4 py-2 bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-40"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>

        <div className="ml-auto flex items-center gap-4">
          {form.registered ? (
            <span className="text-sm text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-lg">
              Trabajador registrado
            </span>
          ) : (
            <span className="text-sm text-slate-600">Guarda tu información para registrar y generar el QR.</span>
          )}

          {form.registered && publicUrl && (
            <>
              <div className="bg-white p-2 rounded-xl border">
                <QRCodeCanvas value={publicUrl} size={110} />
              </div>
              <button
                className="rounded-lg border border-slate-300 px-3 py-2 hover:bg-slate-50"
                onClick={() => {
                  navigator.clipboard?.writeText(publicUrl);
                  alert("URL copiada al portapapeles");
                }}
              >
                Copiar URL
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =============== FICHA PÚBLICA (QR): /ficha/:uid ================= */
export function PublicProfilePage() {
  const { uid } = useParams();
  const [data, setData] = useState<Partial<UserDoc> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!uid) return;
      const d = await loadUser(uid);
      setData(d ?? null);
      setLoading(false);
    })();
  }, [uid]);

  if (loading) return <div className="p-6">Cargando ficha…</div>;
  if (!data?.registered || data.public === false) return <div className="p-6">Ficha no disponible.</div>;

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <Card title="Información Personal">
        <TwoCol label="Nombre Completo" value={data.displayName} />
        <TwoCol label="Código" value={data.code} />
        <TwoCol label="Cargo" value={data.role} />
        <TwoCol label="Área" value={data.area} />
        <TwoCol label="Email" value={data.email} />
      </Card>

      <Card title="Información Médica">
        <TwoCol label="Tipo de Sangre" value={data.bloodType} />
        <TwoCol label="Alergias" value={data.allergies} />
        <TwoCol className="col-span-2" label="Medicamentos" value={data.meds} />
      </Card>
    </div>
  );
}

/* ================== UI helpers (mismo archivo) ================== */
function LabeledInput(props: {
  label: string;
  name: string;
  value: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  className?: string;
  isTextArea?: boolean;
}) {
  const Tag: any = props.isTextArea ? "textarea" : "input";
  return (
    <div className={props.className ?? ""}>
      <div className="text-sm text-sky-900">{props.label}</div>
      <Tag
        name={props.name}
        value={props.value}
        onChange={props.onChange as any}
        placeholder={props.placeholder}
        autoComplete="off"
        rows={props.isTextArea ? 3 : undefined}
        className="mt-1 w-full rounded-lg bg-white border border-sky-300 px-3 py-2 outline-none text-slate-900 placeholder-slate-400 focus:border-sky-500"
      />
    </div>
  );
}

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
      <div className="font-medium break-words">{props.value ?? "—"}</div>
    </div>
  );
}
