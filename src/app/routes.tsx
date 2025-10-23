import { createBrowserRouter, Navigate } from "react-router-dom";
import Agenda from "../features/agenda/Agenda";
import Attendance from "../features/attendance/Attendance";
import Login from "../features/auth/Login";
import Profile, { PublicProfilePage } from "../features/profile/Profile"; // 👈 import también la ficha pública
import Sensors from "../features/sensors/Sensors";
import Inicio from "../features/start/Inicio"; // corregido (sin doble /)
import Training from "../features/training/Training";
import Guard from "./guard";

// Páginas admin
import Analytics from "../features/admin/Analytics";
import Assets from "../features/admin/Assets";
import Docs from "../features/admin/Docs";
import Settings from "../features/admin/Settings";
import Users from "../features/admin/Users";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },

  // 👇 Ruta pública para abrir fichas desde el QR
  { path: "/ficha/:uid", element: <PublicProfilePage /> },

  {
    path: "/app",
    element: <Guard />,
    children: [
      { index: true, element: <Inicio /> },
      { path: "sensors", element: <Sensors /> },
      { path: "training", element: <Training /> },
      { path: "attendance", element: <Attendance /> },
      { path: "profile", element: <Profile /> },
      { path: "agenda", element: <Agenda /> },

      // ----- Rutas ADMIN -----
      { path: "users", element: <Users /> },
      { path: "assets", element: <Assets /> },
      { path: "docs", element: <Docs /> },
      { path: "analytics", element: <Analytics /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

