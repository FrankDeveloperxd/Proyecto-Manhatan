// src/features/workers/api.ts
import {
  collection, doc, onSnapshot, orderBy, query,
  serverTimestamp, setDoc, updateDoc, deleteDoc, getDoc
} from "firebase/firestore";
import {
    getDownloadURL,
    ref,
    uploadBytesResumable,
} from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import type { Worker } from "./types";

const workersCol = collection(db, "workers");

// límites de tus reglas (ajústalos si cambias reglas)
const MAX_MB = 5;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export async function createWorker(payload: Worker, photoFile?: File) {
  const docRef = doc(workersCol);
  const now = serverTimestamp();

  let photoUrl = (payload.photoUrl ?? "").trim();

  // 1) Subida de foto (opcional) con validaciones y metadata


    // opcionalmente puedes escuchar progreso:
    // task.on("state_changed", snap => {
    //   const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
    //   console.log(`upload ${pct}%`);
    // });

  

  // 2) Guardar documento en Firestore
  await setDoc(
    docRef,
    {
      ...payload,
      registered: true,
      public: true,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  return { id: docRef.id, photoUrl };
}

export function subscribeWorkers(cb: (items: Worker[]) => void) {
  const q = query(workersCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Worker) }));
    cb(items);
  });
}

export async function getWorker(id: string) {
  const ref = doc(workersCol, id);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Worker) }) : null;
}

export async function updateWorker(id: string, partial: Partial<Worker>) {
  const ref = doc(workersCol, id);
  await updateDoc(ref, { ...partial, updatedAt: serverTimestamp() });
}

export async function deleteWorker(id: string) {
  const ref = doc(workersCol, id);
  await deleteDoc(ref);
}