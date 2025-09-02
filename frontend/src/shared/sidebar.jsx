import {
  Users,
  DollarSign,
  List,
  Box,
  RotateCcw,
  Truck,
  ShoppingCart,
  Settings,
  ChevronDown,
  ChevronUp,
  Trash2,
  HandCoins,
  Undo2,
  ChevronLeft,
  ChevronRight,
  ArrowLeftToLine,
  Home,
  ShieldCheck, // nuevo ícono para Seguridad
} from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import ondas from "../assets/ondasVertical.jpg";

export default function Sidebar() {
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "Inicio", icon: <Home size={20} />, path: "/app" },
    { name: "Compras", icon: <ShoppingCart size={20} />, path: "/app/purchases" },
    { name: "Categorias", icon: <List size={20} />, path: "/app/categories" },
    { name: "Proveedores", icon: <Truck size={20} />, path: "/app/suppliers" },
    { name: "Productos", icon: <Box size={20} />, path: "/app/products" },
    { name: "Clientes", icon: <Users size={20} />, path: "/app/clients" },
    { name: "Ventas", icon: <DollarSign size={20} />, path: "/app/sales" },
    {
      name: "Devoluciones/baja",
      icon: <RotateCcw size={20} />,
      submenu: [
        {
          name: "Devoluciones de productos",
          icon: <Undo2 size={17} />,
          path: "/app/returns/products",
        },
        {
          name: "Devoluciones de clientes",
          icon: <HandCoins size={17} />,
          path: "/app/returns/clients",
        },
        {
          name: "Baja de productos",
          icon: <Trash2 size={17} />,
          path: "/app/returns/low",
        },
      ],
    },
    {
      name: "Seguridad",
      icon: <ShieldCheck size={20} />,
      submenu: [
        {
          name: "Usuarios",
          icon: <Users size={17} />,
          path: "/app/users",
        },
        {
          name: "Roles",
          icon: <Users size={17} />,
          path: "/app/roles",
        },
        {
          name: "Configuración",
          icon: <Settings size={17} />,
          path: "/app/settings",
        },
      ],
    },
    { name: "Salir", icon: <ArrowLeftToLine size={20} />, path: "/" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? "80px" : "260px" }}
      className="min-h-screen flex flex-col shadow-md relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(180,222,191,0.95), rgba(180,222,191,0.8)), url(${ondas})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "cover",
        boxShadow: "inset -3px 0 12px rgba(0,0,0,0.15)",
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Botón colapsar/expandir */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 rounded-full shadow-md p-1 z-20"
        style={{
          background: "linear-gradient(135deg, #047857, #10b981)",
          color: "#ffffff",
        }}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Logo */}
      <motion.img
        src={logo}
        alt="Logo"
        className="w-40 mt-6 mb-8 mx-auto block relative z-50 cursor-pointer"
        style={{
          filter: `
            drop-shadow(1px 1px 0 rgba(255,255,255,0.98))
            drop-shadow(-1px -1px 0 rgba(255,255,255,0.98))
            drop-shadow(0 12px 18px rgba(2,6,23,0.14))
          `,
          willChange: "transform, filter",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          y: [0, -10, 0],
          rotate: [-1, 2, -1],
          opacity: 1,
          scale: 1,
        }}
        transition={{
          y: { duration: 4.4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
          rotate: { duration: 9.4, repeat: Infinity, repeatType: "loop", ease: "easeInOut" },
        }}
        whileHover={{
          scale: 1.18,
          y: -12,
          rotate: -3,
          filter: `
            drop-shadow(2px 2px 0 rgba(255,255,255,1))
            drop-shadow(-2px -2px 0 rgba(255,255,255,1))
            drop-shadow(0 28px 44px rgba(2,6,23,0.28))
            drop-shadow(0 0 18px rgba(255, 255, 255, 0.28))
            brightness(1.12) saturate(1.15)
          `,
        }}
      />

      {/* Menú */}
      <motion.nav
        className="flex-1 flex flex-col gap-2 overflow-auto px-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuItems.map((item, i) => {
          const isActive = item.submenu
            ? item.submenu.some((sub) => location.pathname === sub.path)
            : location.pathname === item.path;

          return (
            <motion.div key={i} variants={itemVariants} className="relative">
              {item.submenu ? (
                <button
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className="flex items-center justify-between gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left relative z-10 text-black"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed &&
                    (openDropdown === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
                </button>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center justify-between gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left relative z-10 ${
                    isActive ? "text-black" : "text-gray-700 hover:text-black"
                  } ${isActive ? "pointer-events-none" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              )}

              {/* Fondo activo */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeHighlight"
                    className="absolute inset-0 rounded-md"
                    style={{ backgroundColor: "#B5F5CE" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </AnimatePresence>

              {/* Submenú */}
              <AnimatePresence>
                {item.submenu && openDropdown === i && !isCollapsed && (
                  <motion.ul
                    key="dropdown"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="ml-4 mt-1 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex flex-col gap-2 overflow-hidden shadow-inner"
                  >
                    {item.submenu.map((subItem, j) => (
                      <li key={j}>
                        <Link
                          to={subItem.path}
                          className="flex items-center gap-2 text-gray-700 hover:text-black text-sm"
                        >
                          {subItem.icon}
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.nav>
    </motion.aside>
  );
}
