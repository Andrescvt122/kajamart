import React from "react";
import { Outlet } from "react-router-dom";
import NavBarDashboard from "../../shared/components/navbars/navbarDashboard"

export default function DashboardLayout() {
  return (
    <div className="flex flex-col flex-1">
      {/* Navbar que se extiende al lado de la sidebar */}
      <div className="sticky top-0 z-30 w-full md:z-50">
         <NavBarDashboard />
      </div>
      
      {/* Contenido de las páginas */}
      <main className="flex-grow p-8 relative">
        <Outlet />
      </main>
    </div>
  );
}
