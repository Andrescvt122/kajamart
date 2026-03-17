// src/routes/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/useAtuh.jsx";
import Loading from "./features/onboarding/loading.jsx";
export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) return <Navigate to="/app" replace />;

  return <Outlet />;
}
