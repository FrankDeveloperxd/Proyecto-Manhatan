// src/app/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/Login";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import Inicio from "./features/start/Inicio";
import PublicWorkerPage from "./features/workers/PublicWorkerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* Público */}
      <Route path="/login" element={<Login />} />

      {/* Protegido: panel */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Inicio />
          </ProtectedRoute>
        }
      />

     {/* PÚBLICO: ficha por QR */}
     <Route path="/ficha-worker/:id" element={<PublicWorkerPage />} />

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
