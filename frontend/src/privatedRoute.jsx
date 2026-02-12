import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./context/useAtuh.jsx";
import Loading from "./features/onboarding/loading.jsx";
export default function PrivatedRoute({permission}) {
  const {isAuthenticated, loading} = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!permission) {
    // manda a /auth y guarda a qué ruta quería entrar
    return <Navigate to="/403" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
