// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "./contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <AuthProvider>
    <App />
    </AuthProvider>
);
