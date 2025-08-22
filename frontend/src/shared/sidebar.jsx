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
} from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

export default function Sidebar() {
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [activeItem, setActiveItem] = React.useState(0);

  const menuItems = [
    { name: "Clientes", icon: <Users size={20} /> },
    { name: "Ventas", icon: <DollarSign size={20} /> },
    { name: "Categorias", icon: <List size={20} /> },
    { name: "Productos", icon: <Box size={20} /> },
    {
      name: "Devoluciones/baja",
      icon: <RotateCcw size={20} />,
      submenu: [
        { name: "Devoluciones de productos", icon: <Undo2 size={17} /> },
        { name: "Devoluciones de clientes", icon: <HandCoins size={17} /> },
        { name: "Baja de productos", icon: <Trash2 size={17} /> },
      ],
    },
    { name: "Proveedores", icon: <Truck size={20} /> },
    { name: "Compras", icon: <ShoppingCart size={20} /> },
    { name: "Usuarios", icon: <Users size={20} /> },
    { name: "Configuración", icon: <Settings size={20} /> },
  ];

  const handleMenuClick = (index) => {
    if (menuItems[index].submenu) {
      setOpenDropdown(openDropdown === index ? null : index);
    } else {
      setActiveItem(index);
      console.log("Navigating to", menuItems[index].name);
    }
  };

  // Variantes para animación inicial del nav
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <aside
      className="w-64 h-screen shadow-md p-5 relative"
      style={{ backgroundColor: "#b4debf" }}
    >
      {/* Logo con animación */}
      <motion.img
        src={logo}
        alt="Logo"
        className="w-20 mb-6 mx-auto cursor-pointer"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        transition={{ type: "spring", stiffness: 300 }}
      />

      {/* Menú con animaciones */}
      <motion.nav
        className="flex flex-col gap-2 relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuItems.map((item, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="relative"
          >
            <button
              onClick={() => handleMenuClick(i)}
              className="flex items-center justify-between gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left relative z-10"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                {item.name}
              </div>
              {item.submenu && (
                <span>
                  {openDropdown === i ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </span>
              )}
            </button>

            {/* Fondo animado al seleccionar */}
            <AnimatePresence>
              {activeItem === i && (
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

            {/* Submenú animado */}
            <AnimatePresence>
              {item.submenu && openDropdown === i && (
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
                      <a
                        href="#"
                        className="flex items-center gap-2 text-gray-700 hover:text-black text-sm"
                      >
                        {subItem.icon}
                        {subItem.name}
                      </a>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.nav>
    </aside>
  );
}
