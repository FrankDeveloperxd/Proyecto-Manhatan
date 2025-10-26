import React, { useEffect, useState } from "react";
import {
  listWorkersForAttendance,
  getTodayAttendance,
  punchIn,
  punchOut,
  setShiftBounds,
  getShiftBounds,
  clearTodayAttendance,
} from "./api";
import { Worker } from "../training/types";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Link } from "react-router-dom";
dayjs.locale("es");

type Today = {
  id?: string;
  date?: string;
  inAt?: number | null;
  outAt?: number | null;
  totalMinutes?: number;
  status?: string;
  outStatus?: string;
} | null;

const AttendanceAdminPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Today>>({});
  const [busyId, setBusyId] = useState<string>("");

  // horario configurable (persistido en localStorage por el API)
  const { start: savedStart, end: savedEnd } = getShiftBounds();
  const [start, setStart] = useState(savedStart);
  const [end, setEnd] = useState(savedEnd);

  const todayStr = new Date().toISOString().slice(0, 10);

  /* ------------ Carga inicial optimizada ------------ */
  useEffect(() => {
    (async () => {
      const list = await listWorkersForAttendance();
      setWorkers(list);

      // Pedimos todos los estados de hoy en paralelo
      const results = await Promise.all(
        list.map((w) => getTodayAttendance(w.id).then((t) => [w.id, t] as const))
      );
      const map: Record<string, Today> = Object.fromEntries(results);
      setAttendance(map);
    })();
  }, []);

  /* ------------ Acciones optimistas (1 llamada) ------------ */
  async function handlePunchIn(wid: string) {
    try {
      setBusyId(wid);
      await punchIn(wid);                           // write
      const t = await getTodayAttendance(wid);      // single read
      setAttendance((m) => ({ ...m, [wid]: t }));   // actualizar solo ese worker
    } finally {
      setBusyId("");
    }
  }

  async function handlePunchOut(wid: string) {
    try {
      setBusyId(wid);
      await punchOut(wid);
      const t = await getTodayAttendance(wid);
      setAttendance((m) => ({ ...m, [wid]: t }));
    } finally {
      setBusyId("");
    }
  }

  async function handleClearToday(wid: string) {
    const ok = window.confirm(
      "¿Eliminar registro de asistencia de HOY para este trabajador?"
    );
    if (!ok) return;
    try {
      setBusyId(wid);
      await clearTodayAttendance(wid);
      setAttendance((m) => ({ ...m, [wid]: null })); // re-habilita botones
    } finally {
      setBusyId("");
    }
  }

  /* ------------ Utilidades de UI ------------ */
  const formatTime = (ts?: number | null) =>
    ts ? dayjs(ts).format("h:mm A") : "—";

  const saveShift = () => setShiftBounds(start, end);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Asistencia</h2>
        <p className="text-gray-600">Fecha: {todayStr}</p>
      </div>

      {/* Controles de horario */}
      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-slate-600">Entrada</label>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
        />
        <label className="text-sm text-slate-600 ml-2">Salida</label>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
        />
        <button
          onClick={saveShift}
          className="ml-2 px-3 py-1 rounded-lg bg-slate-900 text-white text-sm hover:opacity-90"
        >
          Guardar horario
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b bg-gray-100 text-left text-sm text-gray-600">
              <th className="p-3">Nombre</th>
              <th className="p-3">Entrada</th>
              <th className="p-3">Salida</th>
              <th className="p-3 text-center">Acciones</th>
              <th className="p-3 text-center">Eliminar</th>
              <th className="p-3 text-center">Ver</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w) => {
              const t = attendance[w.id] || null;
              const hasIn = !!t?.inAt;
              const hasOut = !!t?.outAt;
              const dayClosed = hasIn && hasOut;
              const waiting = busyId === w.id;

              return (
                <tr key={w.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-semibold">{w.name || w.email}</div>
                    <div className="text-xs text-gray-500">
                      {w.email}
                      {w.area ? ` · ${w.area}` : ""}
                    </div>
                  </td>

                  <td className="p-3 text-sm">
                    {hasIn ? (
                      <span
                        className={
                          t?.status === "late"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }
                      >
                        Entrada: {formatTime(t?.inAt)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-3 text-sm">
                    {hasOut ? (
                      <span
                        className={
                          t?.outStatus === "early"
                            ? "text-yellow-600"
                            : "text-blue-600"
                        }
                      >
                        Salida: {formatTime(t?.outAt)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-3 text-center">
                    {dayClosed ? (
                      <>
                        <button
                          disabled
                          className="bg-gray-200 text-gray-400 px-3 py-1 rounded mr-2 cursor-not-allowed"
                        >
                          Entrada registrada
                        </button>
                        <button
                          disabled
                          className="bg-gray-200 text-gray-400 px-3 py-1 rounded cursor-not-allowed"
                        >
                          Salida registrada
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handlePunchIn(w.id)}
                          disabled={waiting || hasIn}
                          className={`px-3 py-1 rounded mr-2 ${
                            hasIn
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                        >
                          {waiting && !hasIn ? "Guardando..." : "Registrar entrada"}
                        </button>
                        <button
                          onClick={() => handlePunchOut(w.id)}
                          disabled={waiting || !hasIn || hasOut}
                          className={`px-3 py-1 rounded ${
                            (!hasIn || hasOut)
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {waiting && hasIn && !hasOut ? "Guardando..." : "Registrar salida"}
                        </button>
                      </>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleClearToday(w.id)}
                      disabled={waiting || (!hasIn && !hasOut)}
                      className={`px-3 py-1 rounded ${
                        (!hasIn && !hasOut)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-rose-600 text-white hover:bg-rose-700"
                      }`}
                      title="Eliminar registro de asistencia de hoy"
                    >
                      {waiting ? "Eliminando..." : "Eliminar"}
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <Link
                      to={`ver/${w.id}`}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceAdminPage;
