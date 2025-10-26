import {
  addDoc, collection, doc, getDoc, getDocs,
  orderBy, query, updateDoc, where
} from "firebase/firestore";
import { db, ensureAuth, auth } from "../../lib/firebase";
import { Training, TrainingEnrollment, Worker, WorkerStats } from "./types";

const agendaCol = () => collection(db, "agenda");
const workersCol = () => collection(db, "workers");
const now = () => Date.now();

/* ---------- TRAININGS en agenda ---------- */
export async function listTrainings(): Promise<Training[]> {
  try {
    const q = query(agendaCol(), where("type","==","training")); // sin orderBy
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Training[];
    return items.sort((a,b)=> {
      const ax = a?.startDate ? Date.parse(a.startDate) : Number.MAX_SAFE_INTEGER;
      const bx = b?.startDate ? Date.parse(b.startDate) : Number.MAX_SAFE_INTEGER;
      return ax - bx;
    });
  } catch (err: any) {
    throw new Error("No se pudo obtener la lista de capacitaciones.");
  }
}


export async function createTraining(
  input: Omit<Training, "id" | "type" | "createdBy" | "createdAt">
) {
  await ensureAuth(); // <-- importante
  const payload: Omit<Training, "id"> = {
    ...input,
    type: "training",
    createdBy: auth.currentUser?.uid ?? "anonymous",
    createdAt: now(),
  };
  try {
    const ref = await addDoc(agendaCol(), payload as any);
    return ref.id;
  } catch (e: any) {
    // Propaga un mensaje legible
    throw new Error(e?.message || "No se pudo crear la capacitación");
  }
}

export async function getTraining(id: string): Promise<Training | null> {
  const snap = await getDoc(doc(db, "agenda", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as Training;
}

/* ---------- WORKERS / INSCRIPCIONES ---------- */
export async function listWorkers(): Promise<Worker[]> {
  const snap = await getDocs(workersCol());
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Worker[];
}

export async function listWorkersForTraining(trainingId: string): Promise<Worker[]> {
  const q = query(workersCol(), where("trainingIds", "array-contains", trainingId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Worker[];
}

export async function getWorker(wid: string): Promise<Worker | null> {
  const snap = await getDoc(doc(db, "workers", wid));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    id: snap.id,
    ...data,
    trainingEnrollments: data.trainingEnrollments ?? [],
    trainingIds: data.trainingIds ?? [],
  } as Worker;
}

export async function enrollWorker(wid: string, trainingId: string) {
  await ensureAuth();
  const wref = doc(db, "workers", wid);
  const wsnap = await getDoc(wref);
  if (!wsnap.exists()) throw new Error("Trabajador no encontrado");

  const data = wsnap.data() as any;
  const enrollments: TrainingEnrollment[] = data.trainingEnrollments ?? [];
  const trainingIds: string[] = data.trainingIds ?? [];

  const i = enrollments.findIndex(e => e.trainingId === trainingId);
  if (i === -1) {
    enrollments.push({
      trainingId,
      status: "enrolled",
      progress: 0,
      hoursDone: 0,
      certified: false,
      lastUpdate: now(),
    });
    if (!trainingIds.includes(trainingId)) trainingIds.push(trainingId);
    await updateDoc(wref, { trainingEnrollments: enrollments, trainingIds });
  }
}

export async function unenrollWorker(wid: string, trainingId: string) {
  await ensureAuth();
  const wref = doc(db, "workers", wid);
  const wsnap = await getDoc(wref);
  if (!wsnap.exists()) return;

  const data = wsnap.data() as any;
  const enrollments: TrainingEnrollment[] = data.trainingEnrollments ?? [];
  const trainingIds: string[] = data.trainingIds ?? [];

  const filtered = enrollments.filter(e => e.trainingId !== trainingId);
  const ids = trainingIds.filter(id => id !== trainingId);

  await updateDoc(wref, { trainingEnrollments: filtered, trainingIds: ids });
}

export async function getWorkerStats(wid: string): Promise<WorkerStats> {
  const worker = await getWorker(wid);
  const list = worker?.trainingEnrollments ?? [];
  const inProgress = list.filter(e => e.status !== "completed").length;
  const certificates = list.filter(e => e.certified).length;
  const hoursCompleted = list.reduce((s, e) => s + (e.hoursDone || 0), 0);
  const coursesCompleted = list.filter(e => e.status === "completed").length;
  return { inProgress, certificates, hoursCompleted, coursesCompleted };
}
import { deleteDoc, setDoc } from "firebase/firestore"; // si no estaban

// Actualiza una capacitación (solo los campos que envíes)
export async function updateTraining(
  trainingId: string,
  patch: Partial<Omit<Training, "id" | "type" | "createdBy" | "createdAt">>
) {
  await ensureAuth();
  const ref = doc(db, "agenda", trainingId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Capacitación no encontrada");
  await updateDoc(ref, patch as any);
}

// Elimina la capacitación y limpia inscripciones en workers
export async function deleteTrainingAndCleanup(trainingId: string) {
  await ensureAuth();

  // 1) Borrar el doc en agenda
  await deleteDoc(doc(db, "agenda", trainingId));

  // 2) Quitar el id y el enrollment en todos los workers inscritos
  const q = query(workersCol(), where("trainingIds", "array-contains", trainingId));
  const snap = await getDocs(q);
  const ops: Promise<any>[] = [];
  snap.forEach((d) => {
    const data = d.data() as any;
    const trainingIds: string[] = (data.trainingIds || []).filter((id: string) => id !== trainingId);
    const trainingEnrollments: TrainingEnrollment[] = (data.trainingEnrollments || []).filter(
      (e: TrainingEnrollment) => e.trainingId !== trainingId
    );
    ops.push(updateDoc(doc(db, "workers", d.id), { trainingIds, trainingEnrollments }));
  });
  await Promise.all(ops);
}
