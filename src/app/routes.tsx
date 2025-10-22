import { createBrowserRouter, Navigate } from "react-router-dom";
import Guard from "./guard";
import Login from "../features/auth/Login";
import Home from "../features/home/Home";
import Sensors from "../features/sensors/Sensors";
import Training from "../features/training/Training";
import Attendance from "../features/attendance/Attendance";
import Profile from "../features/profile/Profile";
import Agenda from "../features/agenda/Agenda";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  {
    path: "/app",
    element: <Guard />,
    children: [
      { index: true, element: <Home /> },
      { path: "sensors", element: <Sensors /> },
      { path: "training", element: <Training /> },
      { path: "attendance", element: <Attendance /> },
      { path: "profile", element: <Profile /> },
      { path: "agenda", element: <Agenda /> },
    ],
  },
]);
