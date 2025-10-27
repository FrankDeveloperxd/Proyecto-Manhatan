// src/features/start/components/AdminWorkersWidget.tsx
import { useEffect, useRef, useState } from "react";
import WorkersQuickPanel from "../../workers/WorkersQuickPanel";

export default function AdminWorkersWidget() {
  const [open, setOpen] = useState(false);

  // 🔹 Ref del track del carrusel
  const trackRef = useRef<HTMLDivElement | null>(null);

  // 🔹 Autoplay cada 3s
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const slides = Array.from(track.children);
    if (slides.length === 0) return;

    let index = 0;

    const goTo = (i: number) => {
      const width = track.clientWidth; // cada slide es min-w-full
      track.scrollTo({ left: i * width, behavior: "smooth" });
    };

    const id = setInterval(() => {
      index = (index + 1) % slides.length;
      goTo(index);
    }, 3000);

    // Si la ventana cambia de tamaño, re-posiciona el slide actual
    const onResize = () => goTo(index);
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(id);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      {/* === NUEVO BLOQUE (arriba): Texto izquierda + Carrusel derecha === */}
      <section className="mb-8">
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-tr from-sky-400 via-cyan-500 to-blue-600">
          <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur-md p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Texto izquierda */}
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  SAFETRACK 0.1
                </h2>
                <p className="mt-3 text-slate-600 dark:text-slate-300">
                  Centraliza la gestión del personal: registros, turnos y capacitaciones.
                  Visualiza en tiempo real el estado de cada colaborador.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                    Registra toda la informacion de tu personal ahora más fácil.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                    Fichas completas: contacto, cargo, alergias y estudios.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                    Ubicación en tiempo real de tus trabajadores.
                  </li>
                </ul>
              </div>

              {/* Carrusel derecha (autoplay 3s) */}
              <div className="order-first lg:order-none">
                <div className="relative">
                  {/* Track */}
                  <div
                    ref={trackRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl shadow-lg"
                  >
                    <a
                      id="slide-1"
                      className="min-w-full h-64 md:h-80 lg:h-96 snap-start relative block bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src="/imagen1.png"
                        alt="Imagen 1"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </a>
                    <a
                      id="slide-2"
                      className="min-w-full h-64 md:h-80 lg:h-96 snap-start relative block bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src="/imagen2.png"
                        alt="Imagen 2"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </a>
                    <a
                      id="slide-3"
                      className="min-w-full h-64 md:h-80 lg:h-96 snap-start relative block bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src="/imagen3.png"
                        alt="Imagen 3"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </a>
                    {/* 🔹 Nuevo slide 4 */}
                    <a
                      id="slide-4"
                      className="min-w-full h-64 md:h-80 lg:h-96 snap-start relative block bg-slate-100 dark:bg-slate-800"
                    >
                      <img
                        src="/imagen4.png"
                        alt="Imagen 4"
                        className="w-full h-full object-cover"
                        draggable={false}
                      />
                    </a>
                  </div>

                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-3">
                    <a
                      href="#slide-1"
                      className="h-2.5 w-2.5 rounded-full bg-slate-400 hover:bg-slate-600"
                      aria-label="Ir al slide 1"
                    />
                    <a
                      href="#slide-2"
                      className="h-2.5 w-2.5 rounded-full bg-slate-400 hover:bg-slate-600"
                      aria-label="Ir al slide 2"
                    />
                    <a
                      href="#slide-3"
                      className="h-2.5 w-2.5 rounded-full bg-slate-400 hover:bg-slate-600"
                      aria-label="Ir al slide 3"
                    />
                    {/* 🔹 Nuevo dot 4 */}
                    <a
                      href="#slide-4"
                      className="h-2.5 w-2.5 rounded-full bg-slate-400 hover:bg-slate-600"
                      aria-label="Ir al slide 4"
                    />
                  </div>
                </div>
              </div>
              {/* /Carrusel */}
            </div>
          </div>
        </div>
      </section>

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
