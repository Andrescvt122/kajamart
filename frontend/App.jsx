import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './auth/login';

// Importa los layouts que ya tienes
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Componente de ejemplo para las rutas que sí tendrán sidebar
const Dashboard = () => <div><h1>Dashboard</h1><p>Esta página ya estaría dentro del layout con Sidebar.</p></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Grupo de Rutas Públicas (sin Sidebar) --- */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          {/* Aquí puedes añadir más rutas públicas como /register */}
        </Route>

        {/* --- Grupo de Rutas Privadas (con Sidebar) --- */}
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          {/* Aquí puedes añadir más rutas privadas como /app/perfil */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;