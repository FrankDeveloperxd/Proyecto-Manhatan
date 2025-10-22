import { useAuthStore } from "../auth/authStore";

export default function Profile(){
  const { profile, user } = useAuthStore();
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Información Personal</h2>
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-neutral-300">Nombre</div>
          <div className="font-medium">{profile?.displayName || "—"}</div>
        </div>
        <div>
          <div className="text-sm text-neutral-300">Email</div>
          <div className="font-medium">{user?.email || "—"}</div>
        </div>
        <div>
          <div className="text-sm text-neutral-300">Código</div>
          <div className="font-medium">{profile?.code || "—"}</div>
        </div>
        <div>
          <div className="text-sm text-neutral-300">Cargo</div>
          <div className="font-medium">Técnico en SST</div>
        </div>
      </div>
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <h3 className="font-semibold mb-2">Información Médica</h3>
        <div className="text-sm text-neutral-300">Tipo de sangre, alergias, medicamentos… (solo lectura)</div>
      </div>
    </div>
  );
}
