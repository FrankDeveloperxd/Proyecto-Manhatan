// src/features/sensors/api.ts
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Sensor } from "./types";

const sensorsCol = collection(db, "sensors");
const workersCol = collection(db, "workers");

export async function createSensor(payload: Partial<Sensor>) {
  if (!payload.workerId) throw new Error("workerId requerido");

  // 1) worker debe existir
  const wRef = doc(db, "workers", payload.workerId);
  const wSnap = await getDoc(wRef);
  if (!wSnap.exists()) throw new Error("Trabajador no encontrado");

  // 2) no permitir más de un sensor por trabajador
  const q1 = query(sensorsCol, where("workerId", "==", payload.workerId));
  const dup = await getDocs(q1);
  if (!dup.empty) throw new Error("Este trabajador ya tiene un dispositivo asignado");

  // 3) crear doc
  const docRef = doc(sensorsCol);
  await setDoc(
    docRef,
    {
      workerId: payload.workerId,
      workerName: wSnap.data().fullName ?? "",
      topic: payload.topic,
      subscription: payload.subscription,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Opcional: marca que el dispositivo soporta múltiples métricas
      // kind: "device",
    },
    { merge: true }
  );

  return { id: docRef.id };
}


export async function deleteSensor(sensorId: string) {
  await deleteDoc(doc(sensorsCol, sensorId));
}

export function subscribeSensors(cb: (items: Sensor[]) => void) {
  const q = query(sensorsCol, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const arr = snap.docs.map(d => ({ id: d.id, ...(d.data() as Sensor) }));
    cb(arr);
  });
}

export function subscribeSensor(sensorId: string, cb: (s?: Sensor) => void) {
  if (!sensorId) return () => {};
  const ref = doc(db, "sensors", sensorId);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) { cb(undefined); return; }
    cb({ id: snap.id, ...(snap.data() as Sensor) });
  });
}

// helper: get worker list (id + name) for selection
export async function listWorkersBrief() {
  const q = query(workersCol, orderBy("fullName", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, fullName: d.data().fullName }));
}
