import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuthStore } from "../../features/auth/authStore";

export default function TopBar(){
  const { profile } = useAuthStore();
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold tracking-wide">APP DEMO</h1>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-neutral-600">
            {profile?.displayName || "Usuario"}
          </span>
          <button
            onClick={()=>signOut(auth)}
            className="px-3 py-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
