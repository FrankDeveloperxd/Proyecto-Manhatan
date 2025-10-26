// features/attendance/api.ts
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  deleteDoc,
  setDoc,
  updateDoc,
  limit as qlimit,
} from "firebase/firestore";
import { db, ensureAuth } from "../../lib/firebase";
import { Worker } from "../../features/training/types";

/* ---------------- Helpers ---------------- */
const todayKey = () => new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
const monthKey = () => new Date().toISOString().slice(0, 7);  // "YYYY-MM"

const minutesBetween = (a: number, b: number) =>
  Math.max(0, Math.round((b - a) / 60000));

const parseHM = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
};

/* --------------- Horario configurable --------------- */
// Persistimos en localStorage para respuesta inmediata en el cliente
let ATT_SHIFT_START = localStorage.getItem("att_shift_start") || "08:30";
let ATT_SHIFT_END   = localStorage.getItem("att_shift_end")   || "17:30";

export function setShiftBounds(start: string, end: string) {
  ATT_SHIFT_START = start;
  ATT_SHIFT_END   = end;
  localStorage.setItem("att_shift_start", start);
  localStorage.setItem("att_shift_end", end);
}
export function getShiftBounds() {
  return { start: ATT_SHIFT_START, end: ATT_SHIFT_END };
}

/* ----------------- Colecciones ----------------- */
const workersCol = () => collection(db, "workers");
// Subcolección: workers/{wid}/attendance/{date}
const attCol = (wid: string) => collection(db, "workers", wid, "attendance");

/* ----------------- Listado de workers ----------------- */
export async function listWorkersForAttendance(): Promise<Worker[]> {
  // Si quieres ordenar por nombre, agrega: orderBy("name") (requiere índice si no existe)
  const snap = await getDocs(workersCol());
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Worker[];
}

/* ----------------- Estado de hoy (uno) ----------------- */
export async function getTodayAttendance(wid: string) {
  const ref = doc(db, "workers", wid, "attendance", todayKey());
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
}

/* ----------------- Estado de hoy (TODOS) ultra-rápido -----------------
   Una sola consulta a collectionGroup("attendance") con date == hoy.
   Devuelve: { [wid]: attendanceDeHoy }
----------------------------------------------------------------------- */
export async function getTodayAttendanceMap(): Promise<Record<string, any>> {
  const qy = query(
    collectionGroup(db, "attendance"),
    where("date", "==", todayKey())
  );
  const snap = await getDocs(qy);

  const map: Record<string, any> = {};
  snap.forEach((d) => {
    // path esperado: "workers/{wid}/attendance/{date}"
    // parent = "attendance", parent.parent = "workers/{wid}"
    const parent = d.ref.parent;              // attendance
    const workerDoc = parent.parent;          // DocumentReference workers/{wid}
    const wid = workerDoc?.id;
    if (wid) map[wid] = { id: d.id, ...(d.data() as any) };
  });
  return map;
}

/* ----------------- Registrar entrada ----------------- */
export async function punchIn(wid: string) {
  await ensureAuth();
  const ref = doc(db, "workers", wid, "attendance", todayKey());
  const now = Date.now();

  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() as any;
    if (data.inAt) return; // ya registrado
    await updateDoc(ref, { inAt: now });
    return;
  }

  const late = now > parseHM(ATT_SHIFT_START);
  await setDoc(ref, {
    date: todayKey(),
    inAt: now,
    outAt: null,
    totalMinutes: 0,
    breaksMinutes: 0,
    status: late ? "late" : "present",
  });
}

/* ----------------- Registrar salida ----------------- */
export async function punchOut(wid: string) {
  await ensureAuth();
  const ref = doc(db, "workers", wid, "attendance", todayKey());
  const now = Date.now();

  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // si no hubo entrada, creamos el doc con salida
    await setDoc(ref, {
      date: todayKey(),
      inAt: null,
      outAt: now,
      totalMinutes: 0,
      breaksMinutes: 0,
      status: "present",
      outStatus: now < parseHM(ATT_SHIFT_END) ? "early" : "ok",
    });
    return;
  }

  const data = snap.data() as any;
  const inAt = data.inAt
    ? typeof data.inAt === "number"
      ? data.inAt
      : data.inAt.toMillis?.() ?? now
    : now;

  const total = minutesBetween(inAt, now);
  const leaveEarly = now < parseHM(ATT_SHIFT_END);

  await updateDoc(ref, {
    outAt: now,
    totalMinutes: total,
    outStatus: leaveEarly ? "early" : "ok",
  });
}

/* ----------------- Borrar registro de HOY ----------------- */
export async function clearTodayAttendance(wid: string) {
  await ensureAuth();
  const ref = doc(db, "workers", wid, "attendance", todayKey());
  const snap = await getDoc(ref);
  if (!snap.exists()) return; // nada que borrar
  await deleteDoc(ref);
}

/* ----------------- Historial ----------------- */
export async function listAttendance(wid: string, n = 30) {
  const qy = query(attCol(wid), orderBy("date", "desc"), qlimit(n));
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Array<{
    id: string;
    date: string;
    inAt?: number | null;
    outAt?: number | null;
    totalMinutes?: number;
    status?: string;
    outStatus?: string;
  }>;
}

/* ----------------- Estadísticas (mes actual) ----------------- */
export async function getAttendanceStats(wid: string) {
  const hist = await listAttendance(wid, 120); // suficiente para cubrir el mes
  const mk = monthKey();
  const month = hist.filter(
    (h) => typeof h.date === "string" && h.date.startsWith(mk)
  );

  const present = month.filter((h) => (h.status ?? "present") !== "absent").length;
  const late = month.filter((h) => h.status === "late").length;
  const absent = month.filter((h) => h.status === "absent").length;
  const totalMin = month.reduce((s, h) => s + (h.totalMinutes || 0), 0);

  const totalDays = month.length || 1; // evitar /0
  const pct = Math.round(((present - absent) / totalDays) * 1000) / 10;

  return {
    daysWorked: present,
    lates: late,
    absences: absent,
    totalHours: (totalMin / 60).toFixed(1),
    attendancePct: pct,
  };
}
