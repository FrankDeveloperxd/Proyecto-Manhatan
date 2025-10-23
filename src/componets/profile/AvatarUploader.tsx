import { useRef, useState } from "react";
import { auth, db, storage } from "../../lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";

/** SVG placeholder ligero (iniciales) */
function makePlaceholder(uid: string, size = 96) {
  const initials = (auth.currentUser?.email || "U")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  const bg = "#A78BFA"; // violeta suave
  const fg = "#FFFFFF";

  const svg = encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
      <rect width='100%' height='100%' rx='18' fill='${bg}' />
      <text x='50%' y='54%' font-family='Inter,Arial,sans-serif' font-size='${size *
        0.38}' fill='${fg}' text-anchor='middle' dominant-baseline='middle'>
        ${initials}
      </text>
    </svg>
  `);

  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}

/** Comprime cualquier imagen a JPG 256px máx con fondo blanco (si había transparencia). */
async function fileToJpegDataURL(file: File, maxSide = 256): Promise<string> {
  const objUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = objUrl;
    });

    const ratio = Math.max(img.width, img.height) / maxSide || 1;
    const w = Math.round(img.width / ratio);
    const h = Math.round(img.height / ratio);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    // Fondo blanco para PNG/WEBP con transparencia
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.7); // ~70% calidad
  } finally {
    URL.revokeObjectURL(objUrl);
  }
}

export default function AvatarUploader({
  url,
  size = 96,
}: {
  url: string | null;
  size?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(url);
  const inputRef = useRef<HTMLInputElement>(null);

  const uid = auth.currentUser?.uid;

  const onPick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!uid) return;
    const f = e.target.files?.[0];
    if (!f) return;

    setBusy(true);
    try {
      // 1) Comprimir a JPG ligero
      const dataUrl = await fileToJpegDataURL(f, 256);

      // 2) Subir como data_url (evita preflight raros de CORS)
      const path = `avatars/${uid}/avatar.jpg`;
      const storageRef = ref(storage, path);
      await uploadString(storageRef, dataUrl, "data_url");

      // 3) URL de descarga
      const downloadURL = await getDownloadURL(storageRef);

      // 4) Guardar en Firestore
      await updateDoc(doc(db, "users", uid), { photoURL: downloadURL });

      setLocalUrl(downloadURL);
    } catch {
      // Fallback: subir placeholder
      try {
        const ph = makePlaceholder(uid, size);
        const storageRef = ref(storage, `avatars/${uid}/avatar.jpg`);
        await uploadString(storageRef, ph, "data_url");
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, "users", uid), { photoURL: downloadURL });
        setLocalUrl(downloadURL);
      } catch {
        // Último recurso: mostrar placeholder local sin subir
        setLocalUrl(makePlaceholder(uid, size));
      }
    } finally {
      setBusy(false);
      e.target.value = ""; // permite volver a elegir la misma imagen
    }
  };

  const show = localUrl || (uid ? makePlaceholder(uid, size) : null);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onPick}
        className="grid place-items-center rounded-full ring-4 ring-white bg-neutral-200 overflow-hidden"
        style={{ width: size, height: size }}
        title="Cambiar avatar"
      >
        {show ? (
          <img
            src={show}
            alt="Avatar"
            style={{ width: size, height: size }}
            className="object-cover"
          />
        ) : (
          <span className="text-neutral-500">Avatar</span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"            // 👈 acepta PNG/JPG/WEBP/HEIC (si el navegador soporta)
        className="hidden"
        onChange={onChange}
      />

      {busy && (
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-neutral-500">
          Subiendo…
        </span>
      )}
    </div>
  );
}
