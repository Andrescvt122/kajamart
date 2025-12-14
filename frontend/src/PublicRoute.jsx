// src/routes/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/useAtuh.jsx";
export default function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/app" replace />;

  return <Outlet />;
}
