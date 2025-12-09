import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../shared/components/sidebar.jsx';
import { Menu } from 'lucide-react';
import logo from '../assets/logo.png';
import NavBarDashboard from '../shared/components/navbars/navbarDashboard.jsx';
export default function MainLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  // Opcional: si vuelves a desktop, aseguramos que no quede modo "drawer"
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar (drawer en mobile, fija en desktop) */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Overlay oscuro cuando la sidebar está abierta en mobile */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
          {/* Botón para abrir sidebar en mobile */}
          <button
            className="md:hidden inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium shadow bg-emerald-700 text-white"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu size={18} />
            <span>Menú</span>
          </button>
        
        
        <main className="flex-1 p-4 md:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
