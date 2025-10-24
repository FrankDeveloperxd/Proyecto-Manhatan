// src/features/start/components/AdminWorkersWidget.tsx
import { useState } from "react";
import WorkersQuickPanel from "../../workers/WorkersQuickPanel";

export default function AdminWorkersWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-500">
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Avatar/Ícono */}
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white grid place-content-center shadow-lg">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5.33 0-8 2.67-8 6v1h16v-1c0-3.33-2.67-6-8-6Z" fill="currentColor"/>
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight">Administración de trabajadores</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Registra empleados, genera su QR y gestiona su ficha. Todo en un solo lugar.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800">
                    Tiempo real
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800">
                    QR público
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-800">
                    CRUD
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-medium shadow-lg 
                           bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-95 active:opacity-90"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" className="-ml-0.5">
                  <path fill="currentColor" d="M11 11V6h2v5h5v2h-5v5h-2v-5H6v-2z"/>
                </svg>
                Ingresar usuario
              </button>
            </div>
          </div>
        </div>
      </div>

      <WorkersQuickPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
