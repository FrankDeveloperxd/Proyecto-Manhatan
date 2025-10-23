import { useMemo, useState } from "react";
import type { Worker } from "./types";

type Props = {
  onSubmit: (data: Worker) => Promise<void> | void; // ← sin photoFile
  onClear: () => void;
};

const empty: Worker = {
  fullName: "",
  dni: "",
  birthDate: "",
  age: undefined,
  address: "",
  phone: "",
  email: "",
  civilStatus: "",
  photoUrl: "",
  bloodType: "",
  allergies: [],
  conditions: [],
  medications: [],
  emergencyContacts: [],
  companyName: "",
  area: "",
  role: "",
  code: "",
  registryNumber: "",
};

export default function WorkerForm({ onSubmit, onClear }: Props) {
  const [data, setData] = useState<Worker>(empty);
  const [allergyInput, setAllergyInput] = useState("");
  const [medInput, setMedInput] = useState("");
  const [condInput, setCondInput] = useState("");

  // feedback
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // validación
  const valid = useMemo(() => {
    const required = [
      data.fullName,
      data.dni,
      data.birthDate,
      data.phone,
      data.companyName,
      data.role,
      data.code,
    ];
    return required.every((v) =>
      typeof v === "string" ? v.trim().length > 0 : !!v
    );
  }, [data]);

  const handle =
    (k: keyof Worker) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setSuccessMsg(null);
      setErrorMsg(null);
      setData((prev) => ({ ...prev, [k]: e.target.value }));
    };

  const addArr = (k: "allergies" | "medications" | "conditions", v: string) => {
    if (!v.trim()) return;
    setSuccessMsg(null);
    setErrorMsg(null);
    setData((prev) => ({ ...prev, [k]: [...prev[k], v.trim()] }));
  };

  const removeArr = (
    k: "allergies" | "medications" | "conditions",
    i: number
  ) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setData((prev) => ({ ...prev, [k]: prev[k].filter((_, idx) => idx !== i) }));
  };

  const addEmergency = () => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setData((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        {
          name: "",
          relationship: "",
          phone: "",
          primary: prev.emergencyContacts.length === 0,
        },
      ],
    }));
  };

  const updateEmergency = (
    i: number,
    field: "name" | "relationship" | "phone" | "primary",
    value: any
  ) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    setData((prev) => {
      const arr = [...prev.emergencyContacts];
      (arr[i] as any)[field] = value;
      return { ...prev, emergencyContacts: arr };
    });
  };

  const clearForm = () => {
    setData(empty);
    setAllergyInput("");
    setMedInput("");
    setCondInput("");
    onClear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!valid) {
      const faltantes = camposFaltantes(data).join(", ");
      const msg = `Faltan campos obligatorios: ${faltantes}`;
      setErrorMsg(msg);
      alert(msg);
      return;
    }

    try {
      setSaving(true);
      const age = calcAge(data.birthDate);
      await onSubmit({ ...data, age }); // ← ya no mandamos photoFile
      clearForm();
      setSuccessMsg("✅ Trabajador agregado correctamente.");
      alert("Trabajador agregado correctamente.");
    } catch (err: any) {
      const msg =
        err?.message ||
        "No se pudo guardar (revisa consola y reglas de Firestore).";
      console.error(err);
      setErrorMsg(msg);
      alert("No se pudo guardar: " + msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Feedback */}
      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 text-green-800 px-3 py-2">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 px-3 py-2">
          {errorMsg}
        </div>
      )}

      {/* Encabezado */}
      <section className="rounded-xl border p-4">
        <div className="flex gap-4 items-center">
          <img
            src="/logo512.png"
            alt="Safetrack"
            className="w-20 h-20 object-contain rounded-lg"
          />
          <div>
            <h2 className="text-xl font-semibold">
              Formulario de Registro de Trabajador
            </h2>
            <p className="text-sm opacity-80">
              Completa los datos personales, médicos, contactos de emergencia y
              datos institucionales. Luego guarda para generar su QR.
            </p>
          </div>
        </div>
      </section>

      {/* Datos personales */}
      <section className="rounded-xl border p-4">
        <h3 className="font-semibold mb-3">Datos personales</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Nombre completo *"
            value={data.fullName}
            onChange={handle("fullName")}
          />
          <input
            className="input"
            placeholder="DNI *"
            value={data.dni}
            onChange={handle("dni")}
          />
          <input
            className="input"
            type="date"
            placeholder="Fecha de nacimiento *"
            value={data.birthDate}
            onChange={handle("birthDate")}
          />
          <input
            className="input"
            placeholder="Dirección"
            value={data.address}
            onChange={handle("address")}
          />
          <input
            className="input"
            placeholder="Teléfono *"
            value={data.phone}
            onChange={handle("phone")}
          />
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={handle("email")}
          />
          <input
            className="input"
            placeholder="Estado civil"
            value={data.civilStatus}
            onChange={handle("civilStatus")}
          />
          {/* mantiene URL Foto (opcional) */}
          <input
            className="input"
            placeholder="URL Foto (opcional)"
            value={data.photoUrl || ""}
            onChange={handle("photoUrl")}
          />
        </div>
      </section>

      {/* Información médica */}
      <section className="rounded-xl border p-4">
        <h3 className="font-semibold mb-3">Información médica</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Tipo de sangre (ej. O+)"
            value={data.bloodType}
            onChange={handle("bloodType")}
          />
        </div>

        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <BoxArr
            title="Alergias"
            value={allergyInput}
            onChange={setAllergyInput}
            onAdd={() => {
              addArr("allergies", allergyInput);
              setAllergyInput("");
            }}
            items={data.allergies}
            onRemove={(i) => removeArr("allergies", i)}
          />
          <BoxArr
            title="Condiciones"
            value={condInput}
            onChange={setCondInput}
            onAdd={() => {
              addArr("conditions", condInput);
              setCondInput("");
            }}
            items={data.conditions}
            onRemove={(i) => removeArr("conditions", i)}
          />
          <BoxArr
            title="Medicamentos"
            value={medInput}
            onChange={setMedInput}
            onAdd={() => {
              addArr("medications", medInput);
              setMedInput("");
            }}
            items={data.medications}
            onRemove={(i) => removeArr("medications", i)}
          />
        </div>
      </section>

      {/* Contactos de emergencia */}
      <section className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Contactos de emergencia</h3>
          <button type="button" className="btn" onClick={addEmergency}>
            Añadir contacto
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          {data.emergencyContacts.map((c, i) => (
            <div key={i} className="grid md:grid-cols-4 gap-3">
              <input
                className="input"
                placeholder="Nombre"
                value={c.name}
                onChange={(e) => updateEmergency(i, "name", e.target.value)}
              />
              <input
                className="input"
                placeholder="Parentesco"
                value={c.relationship}
                onChange={(e) =>
                  updateEmergency(i, "relationship", e.target.value)
                }
              />
              <input
                className="input"
                placeholder="Teléfono"
                value={c.phone}
                onChange={(e) => updateEmergency(i, "phone", e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!c.primary}
                  onChange={(e) =>
                    updateEmergency(i, "primary", e.target.checked)
                  }
                />
                Principal
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Datos institucionales */}
      <section className="rounded-xl border p-4">
        <h3 className="font-semibold mb-3">Datos institucionales</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            className="input"
            placeholder="Empresa / Institución *"
            value={data.companyName}
            onChange={handle("companyName")}
          />
          <input
            className="input"
            placeholder="Área"
            value={data.area}
            onChange={handle("area")}
          />
          <input
            className="input"
            placeholder="Rol / Cargo *"
            value={data.role}
            onChange={handle("role")}
          />
          <input
            className="input"
            placeholder="Código (ej. SUP-001) *"
            value={data.code}
            onChange={handle("code")}
          />
          <input
            className="input"
            placeholder="Nro de registro (opcional)"
            value={data.registryNumber || ""}
            onChange={handle("registryNumber")}
          />
        </div>
      </section>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setSuccessMsg(null);
            setErrorMsg(null);
            clearForm();
          }}
          title="Limpiar campos para registrar un nuevo trabajador"
          disabled={saving}
        >
          Agregar trabajador
        </button>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}

function BoxArr({
  title,
  value,
  onChange,
  onAdd,
  items,
  onRemove,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  items: string[];
  onRemove: (i: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{title}</label>
      <div className="flex gap-2 mt-1">
        <input
          className="input flex-1"
          placeholder={`Agregar ${title.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="btn" onClick={onAdd}>
          Añadir
        </button>
      </div>
      <Tags items={items} onRemove={onRemove} />
    </div>
  );
}

// Acepta 'yyyy-MM-dd' (input date) y 'dd/MM/yyyy'
function calcAge(s: string) {
  if (!s) return undefined;
  let d = new Date(s); // ISO (yyyy-MM-dd)
  if (isNaN(d.getTime()) && /^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  if (isNaN(d.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function Tags({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (i: number) => void;
}) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((t, i) => (
        <span
          key={i}
          className="px-2 py-1 rounded-full border text-sm flex items-center gap-2"
        >
          {t}
          <button
            type="button"
            className="text-xs opacity-70"
            onClick={() => onRemove(i)}
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}

// Helpers
function camposFaltantes(d: Worker): string[] {
  const out: string[] = [];
  if (!d.fullName?.trim()) out.push("Nombre completo");
  if (!d.dni?.trim()) out.push("DNI");
  if (!d.birthDate?.trim()) out.push("Fecha de nacimiento");
  if (!d.phone?.trim()) out.push("Teléfono");
  if (!d.companyName?.trim()) out.push("Empresa/Institución");
  if (!d.role?.trim()) out.push("Rol/Cargo");
  if (!d.code?.trim()) out.push("Código");
  return out;
}
