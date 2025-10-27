import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useTheme } from "../../styles/theme";

type TopBarProps = {
  onToggleMenu?: () => void; // 👈 opcional, para móvil
};

export default function TopBar({ onToggleMenu }: TopBarProps) {
  const { theme, toggle } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/30 bg-[#4FAEDD] dark:bg-neutral-900 text-white"
    >
      <div className="h-14 flex items-center justify-between px-3 md:px-6">
        {/* Botón menú: solo móvil */}
        <button
          className="p-2 -ml-1 rounded-lg hover:bg-white/15 md:hidden"
          onClick={onToggleMenu}
          aria-label="Abrir menú"
        >
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </button>

        {/* Título del panel */}
        <div className="text-sm md:text-base font-medium select-none">
          Panel Administrativo
        </div>

        {/* Acciones a la derecha */}
        <div className="flex items-center gap-2">
          {/* Botón modo claro/oscuro */}
          <button
            onClick={toggle}
            className="px-2 py-1 rounded-lg hover:bg-white/15"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* Botón salir */}
          <button
            onClick={() => signOut(auth)}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
