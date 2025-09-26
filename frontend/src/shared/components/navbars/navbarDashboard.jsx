import React,{useState, useEffect, useRef} from "react";
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
  UserRound,
} from "lucide-react";

export default function NavBarDashboard() {
  const location = useLocation();
  const [openDevo, setOpenDevo] = useState(false);

  const items = [
    { name: "Ventas", icon: <DollarSign className="w-4 h-4" />, path: "/app/dashboard/sales" },
    { name: "Compras", icon: <ShoppingCart className="w-4 h-4" />, path: "/app/dashboard/purchases" },
    { name: "Clientes", icon: <UserRound className="w-4 h-4" />, path: "/app/dashboard/clients" },
    { name: "Categorías", icon: <List className="w-4 h-4" />, path: "/app/dashboard/categories" },
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

  const isActive = (pathOrBase) =>
    location.pathname === pathOrBase || location.pathname.startsWith(pathOrBase + "/");

  // Close dropdown when clicking outside
  const devoRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (devoRef.current && !devoRef.current.contains(e.target)) setOpenDevo(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <header
      className="w-full"
      style={{
        background: "linear-gradient(90deg, rgba(196,243,221,0.95) 0%, rgba(188,236,205,0.92) 100%)",
        boxShadow: "0 4px 12px rgba(2,6,23,0.06)",
        backdropFilter: "saturate(120%) blur(4px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="h-16 flex items-center gap-6">
          {/* Left: nav links */}
          <ul className="flex items-center gap-2">
            {items.map((it) => {
              const active = isActive(it.path);
              return (
                <li key={it.name}>
                  <Link
                    to={it.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      active
                        ? "bg-[#B5F5CE] text-black font-medium"
                        : "text-emerald-900 hover:bg-white/30"
                    }`}
                  >
                    <span className={`${active ? "text-black" : "text-emerald-800"}`}>{it.icon}</span>
                    <span className="text-sm">{it.name}</span>
                  </Link>
                </li>
              );
            })}

            {/* Devoluciones dropdown */}
            <li ref={devoRef} className="relative">
              <button
                onClick={() => setOpenDevo((s) => !s)}
                aria-expanded={openDevo}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive(devoluciones.base)
                    ? "bg-[#0f603f] text-white font-medium"
                    : "text-emerald-900 hover:bg-white/30"
                }`}
              >
                <span className={`${isActive(devoluciones.base) ? "text-white" : "text-emerald-800"}`}>
                  {devoluciones.icon}
                </span>
                <span className="text-sm">{devoluciones.name}</span>
                <span>{openDevo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
              </button>

              {/* Dropdown panel */}
              {openDevo && (
                <div
                  className="absolute left-0 mt-2 w-64 rounded-md shadow-lg z-40"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div
                    className="rounded-md border border-white/30 bg-white/95 py-2"
                    style={{ backdropFilter: "blur(6px)" }}
                  >
                    {devoluciones.submenu.map((s) => {
                      const active = location.pathname === s.path;
                      return (
                        <Link
                          key={s.path}
                          to={s.path}
                          className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                            active
                              ? "bg-[#B5F5CE] text-black font-medium"
                              : "text-emerald-900 hover:bg-emerald-50"
                          }`}
                          role="menuitem"
                          onClick={() => setOpenDevo(false)}
                        >
                          <span>{s.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
          </ul>

          {/* Fill space (center) */}
          <div className="flex-1" />

          {/* Right: optional area (search / actions) - left empty now */}
          <div className="flex items-center gap-3">
            {/* Placeholder: put search or user menu here if needed */}
          </div>
        </nav>
      </div>
    </header>
  );
}
