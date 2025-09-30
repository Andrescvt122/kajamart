import react from "react";
import { Outlet } from "react-router-dom";
import NavBarDashboard from "../../shared/components/navbars/navbarDashboard.jsx";

export default function returnClientLayout() {
  return (
    <div className="flex flex-col flex-1">
      {/* Navbar que se extiende al lado de la sidebar */}
      <div className="sticky top-0 z-50 w-full">
        <NavBarDashboard />
      </div>
      
      {/* Contenido de las páginas */}
      <main className="flex-grow p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}