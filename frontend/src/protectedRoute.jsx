import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./context/useAtuh.jsx";
export default function ProtectedRoute() {
  const {isAuthenticated, loading} = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // manda a /auth y guarda a qué ruta quería entrar
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}