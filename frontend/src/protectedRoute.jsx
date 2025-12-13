import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useLogin } from "./shared/components/hooks/auth/useLogin.jsx";

export default function ProtectedRoute() {
  const { getToken } = useLogin();
  const token = getToken();
  const location = useLocation();

  if (!token) {
    // manda a /auth y guarda a qué ruta quería entrar
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}