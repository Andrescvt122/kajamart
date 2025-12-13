// src/routes/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useLogin } from "./shared/components/hooks/auth/useLogin.jsx";

export default function PublicRoute() {
  const { getToken } = useLogin();
  const token = getToken();

  if (token) return <Navigate to="/app" replace />;

  return <Outlet />;
}
