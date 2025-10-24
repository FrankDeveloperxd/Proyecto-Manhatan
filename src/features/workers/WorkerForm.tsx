import { useEffect, useMemo, useState } from "react";
import type { Worker } from "./types";

type Props = {
  mode?: "create" | "edit";
  initialData?: Worker | null;
  onSubmit: (data: Worker) => Promise<void> | void;
  onClear: () => void;
};

const empty: Worker = {
  fullName: "", dni: "", birthDate: "", age: undefined,
  address: "", phone: "", email: "", civilStatus: "", photoUrl: "",
  bloodType: "", allergies: [], conditions: [], medications: [],
  emergencyContacts: [],
  companyName: "", area: "", role: "", code: "", registryNumber: "",
};

export default function WorkerForm({ mode="create", initialData, onSubmit, onClear }: Props) {
  const [data, setData] = useState<Worker>(initialData ?? empty);
  const [allergyInput, setAllergyInput] = useState("");
  const [medInput, setMedInput] = useState("");
  const [condInput, setCondInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type:"ok"|"err", text:string} | null>(null);

  useEffect(()=>{ if(initialData) setData(initialData); },[initialData]);

  const errs = useMemo(()=>{
    const e: Record<string,string> = {};
    if(!data.fullName.trim()) e.fullName="Requerido";
    if(!data.dni.trim()) e.dni="Requerido";
    if(!data.birthDate.trim()) e.birthDate="Requerido";
    if(!data.phone.trim()) e.phone="Requerido";
    if(!data.companyName.trim()) e.companyName="Requerido";
    if(!data.role.trim()) e.role="Requerido";
    if(!data.code.trim()) e.code="Requerido";
    return e;
  },[data]);
  const valid = Object.keys(errs).length===0;

  const set = (k: keyof Worker) => (e: React.ChangeEvent<HTMLInputElement>)=>{
    setMsg(null);
    setData(p=>({...p,[k]:e.target.value}));
  };

  const submit = async (e: React.FormEvent)=>{
    e.preventDefault();
    if(!valid){ setMsg({type:"err", text:"Revisa los campos obligatorios."}); return; }
    try{
      setSaving(true);
      await onSubmit({...data, age: calcAge(data.birthDate)});
      if(mode==="edit") setMsg({type:"ok", text:"Trabajador actualizado."});
      else { setMsg({type:"ok", text:"Trabajador agregado."}); clear(); }
    }catch(err:any){
      setMsg({type:"err", text: err?.message ?? "No se pudo guardar."});
    }finally{ setSaving(false); }
  };

  const clear = ()=>{
    setData(empty); setAllergyInput(""); setMedInput(""); setCondInput("");
    onClear();
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border p-0 overflow-hidden bg-white/80 dark:bg-slate-900/60">
      {/* header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white">
        <div className="text-sm opacity-90">Formulario</div>
        <div className="text-xl font-semibold">
          {mode==="edit" ? "Editar trabajador" : "Registrar trabajador"}
        </div>
      </div>

      {/* body */}
      <div className="p-5 space-y-6">
        {msg && (
          <div className={`rounded-lg px-3 py-2 border ${msg.type==="ok"
            ? "border-green-200 bg-green-50 text-green-800"
            : "border-red-200 bg-red-50 text-red-800"}`}>
            {msg.text}
          </div>
        )}

        {/* personales */}
        <Section title="Datos personales" subtitle="Identificación y contacto">
          <Grid>
            <FloatInput label="Nombre completo *" value={data.fullName} onChange={set("fullName")} error={!!errs.fullName}/>
            <FloatInput label="DNI *" value={data.dni} onChange={set("dni")} error={!!errs.dni}/>
            <FloatInput label="Fecha de nacimiento *" type="date" value={data.birthDate} onChange={set("birthDate")} error={!!errs.birthDate}/>
            <FloatInput label="Dirección" value={data.address} onChange={set("address")}/>
            <FloatInput label="Teléfono *" value={data.phone} onChange={set("phone")} error={!!errs.phone}/>
            <FloatInput label="Email" type="email" value={data.email} onChange={set("email")}/>
            <FloatInput label="Estado civil" value={data.civilStatus} onChange={set("civilStatus")}/>
            <FloatInput label="URL Foto (opcional)" value={data.photoUrl || ""} onChange={set("photoUrl")}/>
          </Grid>
        </Section>

        {/* médica */}
        <Section title="Información médica" subtitle="Para emergencias">
          <Grid>
            <FloatInput label="Tipo de sangre (ej. O+)" value={data.bloodType} onChange={set("bloodType")}/>
          </Grid>
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            <BoxArr title="Alergias" value={allergyInput} onChange={setAllergyInput}
              onAdd={()=>{ if(allergyInput.trim()){ setMsg(null); setData(p=>({...p, allergies:[...p.allergies, allergyInput.trim()]})); setAllergyInput(""); } }}
              items={data.allergies} onRemove={i=>setData(p=>({...p, allergies:p.allergies.filter((_,x)=>x!==i)}))} />
            <BoxArr title="Condiciones" value={condInput} onChange={setCondInput}
              onAdd={()=>{ if(condInput.trim()){ setMsg(null); setData(p=>({...p, conditions:[...p.conditions, condInput.trim()]})); setCondInput(""); } }}
              items={data.conditions} onRemove={i=>setData(p=>({...p, conditions:p.conditions.filter((_,x)=>x!==i)}))} />
            <BoxArr title="Medicamentos" value={medInput} onChange={setMedInput}
              onAdd={()=>{ if(medInput.trim()){ setMsg(null); setData(p=>({...p, medications:[...p.medications, medInput.trim()]})); setMedInput(""); } }}
              items={data.medications} onRemove={i=>setData(p=>({...p, medications:p.medications.filter((_,x)=>x!==i)}))} />
          </div>
        </Section>

        {/* contactos */}
        <Section title="Contactos de emergencia" subtitle="Primer contacto en caso de incidente"
                 action={<button type="button" className="btn" onClick={()=>{
                   setMsg(null);
                   setData(p=>({...p, emergencyContacts:[...p.emergencyContacts, {name:"",relationship:"",phone:"",primary:p.emergencyContacts.length===0}]}));
                 }}>Añadir</button>}>
          <div className="grid gap-3">
            {data.emergencyContacts.map((c,i)=>(
              <div key={i} className="grid md:grid-cols-4 gap-3">
                <FloatInput label="Nombre" value={c.name} onChange={e=>mutEC(i,"name",(e.target as any).value)}/>
                <FloatInput label="Parentesco" value={c.relationship} onChange={e=>mutEC(i,"relationship",(e.target as any).value)}/>
                <FloatInput label="Teléfono" value={c.phone} onChange={e=>mutEC(i,"phone",(e.target as any).value)}/>
                <label className="text-sm flex items-center gap-2 mt-2 md:mt-0">
                  <input type="checkbox" checked={!!c.primary} onChange={e=>mutEC(i,"primary",e.target.checked)}/> Principal
                </label>
              </div>
            ))}
          </div>
        </Section>

        {/* institucional */}
        <Section title="Datos institucionales" subtitle="Empresa y rol">
          <Grid>
            <FloatInput label="Empresa / Institución *" value={data.companyName} onChange={set("companyName")} error={!!errs.companyName}/>
            <FloatInput label="Área" value={data.area} onChange={set("area")}/>
            <FloatInput label="Rol / Cargo *" value={data.role} onChange={set("role")} error={!!errs.role}/>
            <FloatInput label="Código (ej. SUP-001) *" value={data.code} onChange={set("code")} error={!!errs.code}/>
            <FloatInput label="N° de registro (opcional)" value={data.registryNumber || ""} onChange={set("registryNumber")}/>
          </Grid>
        </Section>
      </div>

      {/* footer sticky */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 border-t px-5 py-3 flex gap-3 justify-end">
        <button type="button" className="btn-secondary" onClick={clear} disabled={saving}>
          {mode==="edit" ? "Cancelar edición" : "Limpiar"}
        </button>
        <button type="submit" className="btn-primary" disabled={saving || !valid}>
          {saving ? "Guardando…" : (mode==="edit" ? "Actualizar" : "Guardar")}
        </button>
      </div>
    </form>
  );

  function mutEC(i:number, field:"name"|"relationship"|"phone"|"primary", value:any){
    setMsg(null);
    setData(p=>{
      const arr=[...p.emergencyContacts]; (arr[i] as any)[field]=value;
      return {...p, emergencyContacts:arr};
    });
  }
}

/* helpers UI */
function Section({title, subtitle, action, children}:{title:string; subtitle?:string; action?:React.ReactNode; children:React.ReactNode}){
  return (
    <section>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Grid({children}:{children:React.ReactNode}){ return <div className="grid md:grid-cols-3 gap-3">{children}</div>; }
function FloatInput(props: React.InputHTMLAttributes<HTMLInputElement> & {label:string; error?:boolean;}){
  const {label, error, className, ...rest}=props;
  return (
    <div className={`field ${className||""}`}>
      <input {...rest} placeholder=" " className={`${error?"border-red-300 focus:border-red-400 focus:ring-red-300/50":""}`} />
      <label>{label}</label>
    </div>
  );
}
function calcAge(s:string){
  if(!s) return undefined;
  let d=new Date(s);
  if(isNaN(d.getTime()) && /^\d{2}\/\d{2}\/\d{4}$/.test(s)){
    const [dd,mm,yyyy]=s.split("/"); d=new Date(+yyyy,+mm-1,+dd);
  }
  if(isNaN(d.getTime())) return undefined;
  const now=new Date(); let age=now.getFullYear()-d.getFullYear();
  const m=now.getMonth()-d.getMonth();
  if(m<0 || (m===0 && now.getDate()<d.getDate())) age--;
  return age;
}
function BoxArr({title,value,onChange,onAdd,items,onRemove}:{title:string;value:string;onChange:(v:string)=>void;onAdd:()=>void;items:string[];onRemove:(i:number)=>void;}){
  return (
    <div>
      <div className="field">
        <input placeholder=" " value={value} onChange={(e)=>onChange(e.target.value)} />
        <label>Agregar {title.toLowerCase()}</label>
      </div>
      <div className="flex gap-2 mt-2">
        <button type="button" className="btn" onClick={onAdd}>Añadir</button>
        {!!items?.length && <div className="flex flex-wrap gap-2">
          {items.map((t,i)=>(
            <span key={i} className="px-2 py-1 rounded-full border text-xs flex items-center gap-2">
              {t}<button type="button" className="opacity-70" onClick={()=>onRemove(i)}>✕</button>
            </span>
          ))}
        </div>}
      </div>
    </div>
  );
}
