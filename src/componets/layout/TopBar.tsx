import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useTheme } from "../../styles/theme";

type TopBarProps = {
  onToggleMenu?: () => void; // 👈 opcional, para móvil
};

export default function TopBar({ onToggleMenu }: TopBarProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-neutral-200 dark:bg-neutral-900/80 dark:border-neutral-700">
      <div className="h-14 flex items-center justify-between px-3 md:px-6">
        {/* Botón menú: solo móvil */}
        <button
          className="p-2 -ml-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
          onClick={onToggleMenu}
          aria-label="Abrir menú"
        >
          <div className="w-5 h-0.5 bg-neutral-700 dark:bg-neutral-200 mb-1"></div>
          <div className="w-5 h-0.5 bg-neutral-700 dark:bg-neutral-200 mb-1"></div>
          <div className="w-5 h-0.5 bg-neutral-700 dark:bg-neutral-200"></div>
        </button>

        {/* Título del panel */}
        <div className="text-sm md:text-base font-medium">
          Panel Administrativo
        </div>

        {/* Acciones a la derecha */}
        <div className="flex items-center gap-2">
          {/* Botón modo claro/oscuro */}
          <button
            onClick={toggle}
            className="px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>

          {/* Botón salir */}
          <button
            onClick={() => signOut(auth)}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800
                       dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-white transition-colors"
            title="Cerrar sesión"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
