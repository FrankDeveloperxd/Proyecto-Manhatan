import AdminWorkersWidget from "./components/AdminWorkersWidget";
import WorkersInlineList from "../workers/WorkersInlineList";

export default function Inicio() {
  return (
    <div className="p-4 space-y-6">
      {/* ...tu encabezado existente */}
      <AdminWorkersWidget />
      <WorkersInlineList />   {/* ⬅️ Lista siempre visible debajo */}
    </div>
  );
}
