// NavBarDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DollarSign,
  ShoppingCart,
  List,
  Box,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  User,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Tema (colores ajustados) ---------- */
const GRADIENT =
  "linear-gradient(90deg, rgba(196,243,221,0.95) 0%, rgba(188,236,205,0.92) 100%)";
const NAV_SHADOW = "0 4px 12px rgba(2,6,23,0.06)";
const ACTIVE_BG = "bg-emerald-900";
const ACTIVE_TEXT = "text-white";
const INACTIVE_TEXT = "text-emerald-900";
const HOVER_BG = "hover:bg-emerald-800 hover:text-white";

/* ---------- Datos nav ---------- */
const items = [
  { name: "Ventas", icon: <DollarSign className="w-4 h-4" />, path: "/app/dashboard/sales" },
  { name: "Compras", icon: <ShoppingCart className="w-4 h-4" />, path: "/app/dashboard/purchases" },
  { name: "Clientes", icon: <User className="w-4 h-4" />, path: "/app/dashboard/clients" },
  { name: "Productos", icon: <Box className="w-4 h-4" />, path: "/app/dashboard/products" },
  { name: "Proveedores", icon: <Truck className="w-4 h-4" />, path: "/app/dashboard/suppliers" },
];

const devoluciones = {
  name: "Devoluciones",
  icon: <RotateCcw className="w-4 h-4" />,
  base: "/app/dashboard/devo",
  submenu: [
    { name: "Devolución de clientes", path: "/app/dashboard/return/clients" },
    { name: "Devolución de productos", path: "/app/dashboard/return/products" },
    { name: "Baja de productos", path: "/app/dashboard/return/low" },
  ],
};

/* ---------- Animations ---------- */
const dropdownMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } },
};

const panelMotion = {
  initial: { x: "100%" },
  animate: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "100%", transition: { duration: 0.18 } },
};

/* ---------- Componente ---------- */
export default function NavBarDashboard() {
  const location = useLocation();
  const [openDevo, setOpenDevo] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const devoRef = useRef(null);

  const isActive = (pathOrBase) =>
    location.pathname === pathOrBase || location.pathname.startsWith(pathOrBase + "/");

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    const handleDocClick = (e) => {
      if (devoRef.current && !devoRef.current.contains(e.target)) {
        setOpenDevo(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenDevo(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // Evitar scroll cuando el panel móvil está abierto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header
      className="w-full"
      style={{
        background: GRADIENT,
        boxShadow: NAV_SHADOW,
        backdropFilter: "saturate(120%) blur(4px)",
      }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center gap-4" aria-label="Main navigation">
          {/* Left: brand + desktop nav */}
          <div className="flex items-center gap-4 w-full">
            {/* Brand (solo logo, sin nombre YarcestaHot) */}
           
            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-2 ml-4" role="menubar">
              {items.map((it) => {
                const active = isActive(it.path);
                return (
                  <li key={it.name} role="none">
                    <Link
                      to={it.path}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                        active ? `${ACTIVE_BG} ${ACTIVE_TEXT} font-medium` : `${INACTIVE_TEXT} ${HOVER_BG}`
                      }`}
                    >
                      <span className={`${active ? "text-white" : "text-emerald-800"}`}>{it.icon}</span>
                      <span className="text-sm">{it.name}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Devoluciones dropdown */}
              <li ref={devoRef} className="relative" role="none">
                <button
                  onClick={() => setOpenDevo((s) => !s)}
                  aria-expanded={openDevo}
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
                    isActive(devoluciones.base)
                      ? "bg-emerald-900 text-white font-medium"
                      : `${INACTIVE_TEXT} ${HOVER_BG}`
                  }`}
                >
                  <span className={`${isActive(devoluciones.base) ? "text-white" : "text-emerald-800"}`}>
                    {devoluciones.icon}
                  </span>
                  <span className="text-sm">{devoluciones.name}</span>
                  <span className="ml-1">
                    {openDevo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence>
                  {openDevo && (
                    <motion.div
                      role="menu"
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={dropdownMotion}
                      className="absolute left-0 mt-2 w-56 rounded-md shadow-lg z-40"
                      style={{ minWidth: 220 }}
                    >
                      <div className="rounded-md border border-emerald-800/30 bg-white py-1">
                        {devoluciones.submenu.map((s) => {
                          const active = location.pathname === s.path;
                          return (
                            <Link
                              key={s.path}
                              to={s.path}
                              role="menuitem"
                              aria-current={active ? "page" : undefined}
                              onClick={() => setOpenDevo(false)}
                              className={`flex items-center justify-between px-4 py-2 text-sm transition-colors focus:outline-none ${
                                active ? `${ACTIVE_BG} ${ACTIVE_TEXT} font-medium` : `text-emerald-900 ${HOVER_BG}`
                              }`}
                            >
                              <span>{s.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            </ul>
          </div>

          {/* Right: acciones (queda igual, solo hover oscuros) */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className={`md:hidden p-2 rounded-md ${HOVER_BG}`}
              aria-label="Abrir menú"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
