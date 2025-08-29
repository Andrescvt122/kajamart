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
} from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "Clientes", icon: <Users size={20} />, path: "/clients" },
    { name: "Ventas", icon: <DollarSign size={20} />, path: "/sales" },
    { name: "Categorias", icon: <List size={20} />, path: "/categories" },
    { name: "Productos", icon: <Box size={20} />, path: "/products" },
    {
      name: "Devoluciones/baja",
      icon: <RotateCcw size={20} />,
      submenu: [
        { name: "Devoluciones de productos", icon: <Undo2 size={17} />, path: "/returns/products" },
        { name: "Devoluciones de clientes", icon: <HandCoins size={17} />, path: "/returns/clients" },
        { name: "Baja de productos", icon: <Trash2 size={17} />, path: "/returns/low" },
      ],
    },
    { name: "Proveedores", icon: <Truck size={20} />, path: "/suppliers" },
    { name: "Compras", icon: <ShoppingCart size={20} />, path: "/purchases" },
    { name: "Usuarios", icon: <Users size={20} />, path: "/users" },
    { name: "Configuración", icon: <Settings size={20} />, path: "/settings" },
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
      style={{ backgroundColor: "#b4debf" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Botón colapsar/expandir */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 bg-white rounded-full shadow-md p-1 z-20"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Logo */}
      <motion.img
        src={logo}
        alt="Logo"
        className="w-20 mt-5 mb-6 mx-auto flex-shrink-0 cursor-pointer"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      {/* Menú */}
      <motion.nav
        className="flex-1 flex flex-col gap-2 overflow-auto px-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuItems.map((item, i) => {
          let isActive = item.submenu
            ? item.submenu.some((sub) => location.pathname.startsWith(sub.path))
            : location.pathname.startsWith(item.path || "");

          return (
            <motion.div key={i} variants={itemVariants} className="relative">
              {item.submenu ? (
                <button
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className="flex items-center justify-between gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left relative z-10"
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed && (openDropdown === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
                </button>
              ) : (
                <Link to={item.path}>
                  <button
                    className={`flex items-center justify-between gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left relative z-10 ${
                      isActive ? "text-black" : "text-gray-700 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                  </button>
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
                    className="ml-4 mt-1 p-2 rounded-lg bg-[#b4debf] shadow-md border border-[#a7d4b1] flex flex-col gap-2 overflow-hidden"
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
