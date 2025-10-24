// src/main.tsx
import ReactDOM from "react-dom/client";
import App from "./app/App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <HashRouter>
        <App />
    </HashRouter>
);
