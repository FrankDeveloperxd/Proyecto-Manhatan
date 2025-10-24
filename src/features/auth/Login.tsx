import { useState, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import RadarBg from "./RadarBg";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass,  setPass ] = useState("");
  const [err,   setErr  ] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);     // 👈 éxito
  const [bad, setBad] = useState(false);   // 👈 error (para pintar rojo)
  const [showPass, setShowPass] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const mapError = (code?: string) => {
    const m: Record<string, string> = {
      "auth/invalid-credential": "Correo o contraseña inválidos.",
      "auth/user-not-found": "El usuario no existe.",
      "auth/wrong-password": "Contraseña incorrecta.",
      "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde.",
      "auth/network-request-failed": "Problema de red. Revisa tu conexión.",
    };
    return m[code ?? ""] || `Firebase: ${code}`;
  };

  const login = async () => {
    if (loading) return;
    setErr("");
    setBad(false);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      setOk(true);                 // pinta verde
      setTimeout(() => nav("/app"), 450); // navega 1 sola vez
    } catch (e: any) {
      setBad(true);                // pinta rojo
      setErr(mapError(e?.code));
      btnRef.current?.classList.add("animate-[shake_150ms_ease-in-out_2]");
      setTimeout(() => btnRef.current?.classList.remove("animate-[shake_150ms_ease-in-out_2]"), 400);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter") login();
  };

  return (
    <div className="relative min-h-dvh overflow-hidden text-white">
      <RadarBg /> {/* 👈 fondo separado */}

      {/* CONTENEDOR LOGIN (tus estilos tal cual) */}
      <div className="min-h-dvh grid place-items-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_10px_50px_rgba(0,0,0,0.35)]">
          <div className="p-7 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
              <p className="text-sm text-neutral-300 mt-1">Accede con tu cuenta corporativa.</p>
            </div>

            <label className="block text-xs text-neutral-300 mb-1">Correo</label>
            <div className="relative mb-4">
              <input
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 outline-none placeholder:text-neutral-400 focus:ring-2 ring-indigo-500 transition"
                placeholder="admin@demo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onKeyDown}
                inputMode="email"
                autoFocus
              />
            </div>

            <label className="block text-xs text-neutral-300 mb-1">Contraseña</label>
            <div className="relative">
              <input
                className="w-full rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 pr-10 outline-none placeholder:text-neutral-400 focus:ring-2 ring-indigo-500 transition"
                placeholder="••••••••"
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-white transition"
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            {err && <div className="mt-3 text-sm text-red-300">{err}</div>}

            {/* Botón con barra de verificación (verde/rojo) */}
            <div className="relative mt-6">
              <button
                ref={btnRef}
                onClick={login}
                disabled={loading || ok}
                className={`relative w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
                  ${ok ? "bg-green-600" : bad ? "bg-red-600" : "bg-indigo-600 hover:bg-indigo-500"}
                  disabled:opacity-60 disabled:cursor-not-allowed
                  shadow-[0_10px_30px_rgba(79,70,229,0.35)] transition`}
              >
                {loading && <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                <span>{ok ? "¡Bienvenido!" : (loading ? "Entrando..." : "Entrar")}</span>

                {/* Barra de progreso */}
                <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none" aria-hidden>
                  <span
                    className={`absolute left-0 top-0 h-full transition-[width,background] duration-400 ease-out
                      ${ok ? "bg-green-500 w-full" : bad ? "bg-red-500 w-full" : "bg-white/0 w-0"}`}
                  />
                </span>
              </button>
            </div>

            <div className="mt-5 text-xs text-neutral-300/80">
            </div>
          </div>
        </div>
      </div>

      {/* Animaciones y fixes extra */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) }
          50% { transform: translate(-10px, -10px) }
        }
        @keyframes shake {
          0% { transform: translateX(0) }
          25% { transform: translateX(-4px) }
          50% { transform: translateX(4px) }
          75% { transform: translateX(-2px) }
          100% { transform: translateX(0) }
        }
        @keyframes sweep {
          0%   { transform: rotate(0deg) }
          100% { transform: rotate(360deg) }
        }
        .gps-dot{position:absolute;height:10px;width:10px;background:#22c55e;border-radius:9999px;box-shadow:0 0 10px 2px rgba(34,197,94,0.8);filter:drop-shadow(0 0 6px rgba(34,197,94,0.8))}
        @keyframes path1{0%{transform:translate(6rem,-2rem)}25%{transform:translate(10rem,2rem)}50%{transform:translate(0rem,8rem)}75%{transform:translate(-8rem,1rem)}100%{transform:translate(6rem,-2rem)}}
        @keyframes path2{0%{transform:translate(-4rem,4rem)}20%{transform:translate(-6rem,-2rem)}55%{transform:translate(6rem,-6rem)}85%{transform:translate(10rem,3rem)}100%{transform:translate(-4rem,4rem)}}
        @keyframes path3{0%{transform:translate(0rem,10rem)}30%{transform:translate(5rem,5rem)}60%{transform:translate(-5rem,-4rem)}100%{transform:translate(0rem,10rem)}}
        .gps1{top:45%;left:50%;animation:path1 12s ease-in-out infinite}
        .gps2{top:50%;left:50%;background:#f59e0b;box-shadow:0 0 10px 2px rgba(245,158,11,0.8);animation:path2 14s ease-in-out infinite}
        .gps3{top:55%;left:50%;background:#60a5fa;box-shadow:0 0 10px 2px rgba(96,165,250,0.8);animation:path3 10s ease-in-out infinite}
        input[type="password"]::-ms-reveal,input[type="password"]::-ms-clear{display:none}
      `}</style>
    </div>
  );
}
