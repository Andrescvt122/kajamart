import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Sidebar from "../shared/components/sidebar.jsx";
import logo from "../assets/logo.png";

export default function MainLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  useEffect(() => {
    document.body.style.overflow = isMobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50 lg:flex lg:overflow-hidden">
      <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-emerald-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            Menú
          </button>
          <img src={logo} alt="Kajamart" className="h-10 w-auto" />
        </div>
      </header>

      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 flex"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={closeMobileSidebar}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative flex h-full w-full max-w-xs"
            >
              <Sidebar isMobile onClose={closeMobileSidebar} />
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                aria-label="Cerrar menú de navegación"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8 overflow-x-hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
