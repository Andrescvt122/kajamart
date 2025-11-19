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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------- Tema (colores) ---------- */
const GRADIENT =
  "linear-gradient(90deg, rgba(196,243,221,0.95) 0%, rgba(188,236,205,0.92) 100%)";
const NAV_SHADOW = "0 4px 12px rgba(2,6,23,0.06)";
const ACTIVE_BG = "bg-emerald-900";
const ACTIVE_TEXT = "text-white";
const INACTIVE_TEXT = "text-emerald-900";
const HOVER_BG = "hover:bg-emerald-800 hover:text-white";

/* ---------- Datos del menú ---------- */
const devolucionesItem = {
  name: "Devoluciones / baja",
  icon: <RotateCcw className="w-4 h-4" />,
  path: "/app/dashboard/returns",
  base: "/app/dashboard/returns",
  submenu: [
    { name: "Devoluciones de clientes", path: "/app/dashboard/return/clients" },
    { name: "Bajas de productos", path: "/app/dashboard/return/low" },
    { name: "Devolución de productos", path: "/app/dashboard/return/products" },
  ],
};

const items = [
  {
    name: "Ventas",
    icon: <DollarSign className="w-4 h-4" />,
    path: "/app/dashboard/sales",
  },
  {
    name: "Compras",
    icon: <ShoppingCart className="w-4 h-4" />,
    path: "/app/dashboard/purchases",
  },
  {
    name: "Clientes",
    icon: <User className="w-4 h-4" />,
    path: "/app/dashboard/clients",
  },
  {
    name: "Productos",
    icon: <Box className="w-4 h-4" />,
    path: "/app/dashboard/products",
  },
  {
    name: "Proveedores",
    icon: <Truck className="w-4 h-4" />,
    path: "/app/dashboard/suppliers",
  },
  devolucionesItem,
];

/* ---------- Animaciones ---------- */
const dropdownMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.16 },
};

const panelMotion = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { type: "tween", duration: 0.22 },
};

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18 },
};

export default function NavBarDashboard() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [devolucionesOpen, setDevolucionesOpen] = useState(false);

  const devolucionesRef = useRef(null);

  const isActive = (path, base) => {
    const current = location.pathname;
    if (path && current === path) return true;
    if (base && current.startsWith(base)) return true;
    return false;
  };

  // Cerrar panel móvil cuando cambia la ruta
  useEffect(() => {
    setMobileOpen(false);
    setDevolucionesOpen(false);
  }, [location.pathname]);

  // Cerrar dropdown de devoluciones al hacer clic fuera
  useEffect(() => {
    if (!devolucionesOpen) return;

    const handleClick = (e) => {
      if (!devolucionesRef.current) return;
      if (!devolucionesRef.current.contains(e.target)) {
        setDevolucionesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [devolucionesOpen]);

  // Bloquear scroll cuando el panel móvil está abierto
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previous || "auto";
    }
    return () => {
      document.body.style.overflow = previous || "auto";
    };
  }, [mobileOpen]);

  const commonLinkBase =
    "inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors border focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200";

  return (
    // z-[10] -> SIEMPRE por debajo de la sidebar (z-[60])
    <header className="relative w-full z-[10]" role="banner">
      {/* Barra superior con gradiente */}
      <div
        className="w-full backdrop-blur-md"
        style={{
          background: GRADIENT,
          boxShadow: NAV_SHADOW,
        }}
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          {/* ===== FILA MOBILE ===== */}
          <div className="flex items-center justify-between gap-3 md:hidden">
            <div className="flex-1 min-w-0 text-center">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-900 uppercase">
                Panel de administración
              </p>
              <p className="text-sm font-semibold text-emerald-950 truncate">
                Dashboards &amp; métricas
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-900 text-white shadow-sm border border-emerald-900/80"
                aria-label={mobileOpen ? "Cerrar navegación" : "Abrir navegación"}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ===== FILA DESKTOP ===== */}
          <div className="hidden md:flex items-center justify-between gap-4">
            <nav className="flex items-center gap-1">
              {items.slice(0, items.length - 1).map((item) => {
                const active = isActive(item.path, item.base);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${commonLinkBase} ${
                      active
                        ? `${ACTIVE_BG} ${ACTIVE_TEXT} border-emerald-900/80 shadow-sm`
                        : `${INACTIVE_TEXT} ${HOVER_BG} border-transparent bg-transparent`
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Devoluciones / baja con dropdown */}
              <div className="relative" ref={devolucionesRef}>
                <button
                  type="button"
                  onClick={() => setDevolucionesOpen((v) => !v)}
                  className={`${commonLinkBase} ${
                    isActive(null, devolucionesItem.base)
                      ? `${ACTIVE_BG} ${ACTIVE_TEXT} border-emerald-900/80 shadow-sm`
                      : `${INACTIVE_TEXT} ${HOVER_BG} border-transparent bg-transparent`
                  }`}
                >
                  {devolucionesItem.icon}
                  <span>{devolucionesItem.name}</span>
                  {devolucionesOpen ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>

                <AnimatePresence>
                  {devolucionesOpen && (
                    <motion.div
                      {...dropdownMotion}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-lg border border-emerald-100/80 py-2 z-[15]"
                    >
                      {devolucionesItem.submenu.map((sub) => {
                        const active = isActive(sub.path, devolucionesItem.base);
                        return (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors ${
                              active
                                ? "bg-emerald-900 text-white"
                                : "text-emerald-950 hover:bg-emerald-50"
                            }`}
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* ===== Panel móvil lateral ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay del panel móvil: por debajo de la sidebar */}
            <motion.div
              className="fixed inset-0 bg-black/35 md:hidden z-[15]"
              {...overlayMotion}
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel móvil (dashboards) -> también por debajo de la sidebar */}
            <motion.aside
              className="fixed inset-y-0 right-0 w-72 max-w-[80%] bg-emerald-950 text-emerald-50 shadow-2xl md:hidden z-[25] flex flex-col"
              {...panelMotion}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-800">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">
                    Dashboards
                  </p>
                  <p className="text-sm font-semibold">Panel de administración</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900 text-emerald-50 border border-emerald-700"
                  aria-label="Cerrar navegación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-2 py-3">
                <p className="px-2 mb-2 text-[11px] font-semibold tracking-wide text-emerald-300/90 uppercase">
                  Secciones
                </p>
                <div className="space-y-1">
                  {items.slice(0, items.length - 1).map((item) => {
                    const active = isActive(item.path, item.base);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                          active
                            ? "bg-emerald-700 text-white"
                            : "text-emerald-100 hover:bg-emerald-900/60"
                        }`}
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-900/70">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-800/80">
                  <p className="px-2 mb-2 text-[11px] font-semibold tracking-wide text-emerald-300/90 uppercase">
                    Devoluciones / baja
                  </p>
                  <div className="space-y-1">
                    {devolucionesItem.submenu.map((sub) => {
                      const active = isActive(sub.path, devolucionesItem.base);
                      return (
                        <Link
                          key={sub.name}
                          to={sub.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm ${
                            active
                              ? "bg-emerald-700 text-white"
                              : "text-emerald-100 hover:bg-emerald-900/60"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>

              <div className="px-4 py-3 border-t border-emerald-800 flex items-center justify-between text-xs text-emerald-300/80">
                <span>Kajamart • Admin</span>
                <span className="text-[10px] uppercase tracking-[0.18em]">
                  v1.0
                </span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
