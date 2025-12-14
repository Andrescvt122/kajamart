import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./context/useAtuh.jsx";
export default function PrivatedRoute({permission}) {
  const {isAuthenticated, loading} = useAuth();
  const location = useLocation();

  if (!permission) {
    // manda a /auth y guarda a qué ruta quería entrar
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return <Outlet />;
}