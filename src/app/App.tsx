import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ensureAuthListener } from "../features/auth/authStore";

export default function App() {
  useEffect(() => { ensureAuthListener(); }, []);
  return <RouterProvider router={router} />;
}
