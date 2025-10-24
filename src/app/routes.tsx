import { createBrowserRouter, Navigate } from "react-router-dom";
import Agenda from "../features/agenda/Agenda";
import Attendance from "../features/attendance/Attendance";
import Login from "../features/auth/Login";
import Profile, { PublicProfilePage } from "../features/profile/Profile";
import Inicio from "../features/start/Inicio";
import Training from "../features/training/Training";
import Guard from "./guard";


// Páginas admin
import Analytics from "../features/admin/Analytics";
import Assets from "../features/admin/Assets";
import Docs from "../features/admin/Docs";
import Settings from "../features/admin/Settings";
import Users from "../features/admin/Users";

// ✅ Workers (privado) y ficha pública
import WorkersPage from "../features/workers";
import PublicWorkerPage from "../features/workers/PublicWorkerPage";
import SensorsPage from "../features/sensors";
import SensorViewPage from "../features/sensors/SensorViewPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },

  // 👇 Rutas públicas para abrir fichas desde el QR
  { path: "/ficha/:uid", element: <PublicProfilePage /> },       // perfil (ya existía)
  { path: "/ficha-worker/:wid", element: <PublicWorkerPage /> }, // ✅ nueva para trabajadores

  {
    path: "/app",
    element: <Guard />,
    children: [
      { index: true, element: <Inicio /> },
      { path: "sensors", element: <SensorsPage /> },
      { path: "sensors/:sid", element: <SensorViewPage /> },
      { path: "training", element: <Training /> },
      { path: "attendance", element: <Attendance /> },
      { path: "profile", element: <Profile /> },
      { path: "agenda", element: <Agenda /> },

      // ----- Nueva ruta para Trabajadores -----
      { path: "workers", element: <WorkersPage /> },

      // ----- Rutas ADMIN -----
      { path: "users", element: <Users /> },
      { path: "assets", element: <Assets /> },
      { path: "docs", element: <Docs /> },
      { path: "analytics", element: <Analytics /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);
