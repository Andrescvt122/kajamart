// kajamart/frontend/src/shared/sidebar.jsx
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
  ShieldUser,
  X,
} from "lucide-react";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import ondasHorizontal from "../../assets/ondasHorizontal.png";
import { showConfirmAlert } from "./alerts";
import { useAuth } from "../../context/useAtuh.jsx";
export default function Sidebar({ isMobileOpen = false, onMobileClose }) {
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { hasPermission, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const handleLogout = () => {
    showConfirmAlert("¿Estás seguro de que quieres cerrar la sesión?").then(
      (confirmed) => {
        if (confirmed) {
          navigate("/");
          signOut();
          if (onMobileClose) onMobileClose();
        }
      }
    );
  };
  const canView = {
    users: hasPermission("Ver usuarios"),
    roles: hasPermission("Ver roles"),
    products: hasPermission("Ver productos"),
    categories: hasPermission("Ver categorías"),
    suppliers: hasPermission("Ver proveedores"),
    clients: hasPermission("Ver clientes"),
    purchases: hasPermission("Ver compras"),
    sales: hasPermission("Ver ventas"),
    returnClients: hasPermission("Ver devolución clientes"),
    returnProducts: hasPermission("Ver Gestión devolución productos"),
    low: hasPermission("Ver baja productos"),
  };
  console.log("can view client", canView.clients);
  console.log("can view users", canView.users);
  const menuItems = [
    { name: "Inicio", icon: <Home size={20} />, path: "/app" },
    {
      name: "Ventas",
      icon: <DollarSign size={20} />,
      path: "/app/sales",
      hidden: !canView.sales,
    },
    {
      name: "Compras",
      icon: <ShoppingCart size={20} />,
      path: "/app/purchases",
      hidden: !canView.purchases,
    },
    {
      name: "Categorias",
      icon: <List size={20} />,
      path: "/app/categories",
      hidden: !canView.categories,
    },
    {
      name: "Productos",
      icon: <Box size={20} />,
      path: "/app/products",
      hidden: !canView.products,
    },
    {
      name: "Proveedores",
      icon: <Truck size={20} />,
      path: "/app/suppliers",
      hidden: !canView.suppliers,
    },
    {
      name: "Clientes",
      icon: <Users size={20} />,
      path: "/app/clients",
      hidden: !canView.clients,
    },
    {
      name: "Devoluciones/baja",
      icon: <RotateCcw size={20} />,
      submenu: [
        {
          name: "Devoluciones de productos",
          icon: <Undo2 size={17} />,
          path: "/app/returns/products",
          hidden: !canView.returnProducts,
        },
        {
          name: "Devoluciones de clientes",
          icon: <HandCoins size={17} />,
          path: "/app/returns/clients",
          hidden: !canView.returnClients,
        },
        {
          name: "Baja de productos",
          icon: <Trash2 size={17} />,
          path: "/app/returns/low",
          hidden: !canView.low,
        },
      ],
    },
    {
      name: "Configuración",
      icon: <Settings size={20} />,
      submenu: [
        {
          name: "Usuarios",
          icon: <Users size={20} />,
          path: "/app/settings/users",
          hidden: !canView.users,
        },
        {
          name: "Roles",
          icon: <ShieldUser size={20} />,
          path: "/app/settings/roles",
          hidden: !canView.roles,
        },
      ],
    },
    {
      name: "Salir",
      icon: <ArrowLeftToLine size={20} />,
      action: handleLogout,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -18 },
    visible: { opacity: 1, x: 0 },
  };

  const handleItemClick = () => {
    if (onMobileClose) onMobileClose();
  };
  const visibleMenuItems = menuItems
    .map((item) => {
      if (!item.submenu) return item;

      const visibleSubmenu = item.submenu.filter((sub) => !sub.hidden);

      return {
        ...item,
        submenu: visibleSubmenu,
        hidden: item.hidden || visibleSubmenu.length === 0, // si no hay hijos visibles, ocultar padre
      };
    })
    .filter((item) => !item.hidden);

  return (
    <motion.aside
      animate={{ width: isCollapsed ? "80px" : "260px" }}
      className={`
        fixed inset-y-0 left-0
        flex flex-col shadow-md min-h-[100vh]
        z-[40]
        inset-0
        bg-[#b4debf]
        transform transition-transform duration-300
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative
        z-[40]  /* Sidebar > navbar (z-10) pero < modales (z-50) */
      `}
      style={{
        boxShadow: "inset -3px 0 12px rgba(0,0,0,0.15)",
      }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* Fondo inferior borroso */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{
          width: isCollapsed ? "80px" : "260px",
          height: "50%",
          backgroundImage: `url(${ondasHorizontal})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "0% bottom",
          backgroundSize: "cover",
          filter: "blur(18px) contrast(1.15) brightness(0.95)",
          zIndex: 0,
          opacity: 0.5,
        }}
      />

      {/* Botón colapsar/expandir (solo desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute top-5 rounded-full shadow-lg p-2 items-center justify-center z-30 transition-all hover:scale-110 hover:shadow-xl"
        style={{
          background: "linear-gradient(135deg, #047857, #065f46)",
          color: "#fff",
          right: "-16px",
        }}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Botón cerrar en mobile */}
      <button
        onClick={onMobileClose}
        className="md:hidden absolute top-4 right-4 rounded-full p-2 bg-emerald-800 text-white z-40 shadow-lg"
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <motion.img
        src={logo}
        alt="Logo"
        className={`w-40 mt-6 mb-8 mx-auto block relative z-20 cursor-pointer ${
          isCollapsed ? "pointer-events-none" : ""
        }`}
        style={{
          filter: `drop-shadow(1px 1px 0 rgba(255,255,255,0.98))
                       drop-shadow(-1px -1px 0 rgba(255,255,255,0.98))
                       drop-shadow(0 12px 18px rgba(2,6,23,0.14))`,
          willChange: "transform, filter",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{
          y: [0, -5, 0],
          rotate: [-1, 2, -1],
          opacity: 1,
          scale: 1,
        }}
        transition={{
          y: {
            duration: 4.4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          },
          rotate: {
            duration: 9.4,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          },
        }}
        whileHover={{
          scale: isCollapsed ? 1 : 1.18,
          y: isCollapsed ? 0 : -12,
          rotate: isCollapsed ? 0 : -3,
          filter: isCollapsed
            ? `drop-shadow(1px 1px 0 rgba(255,255,255,0.98))`
            : `drop-shadow(2px 2px 0 rgba(255,255,255,1))
               drop-shadow(-2px -2px 0 rgba(255,255,255,1))
               drop-shadow(0 28px 44px rgba(2,6,23,0.28))
               drop-shadow(0 0 18px rgba(255, 255, 255, 0.28))
               brightness(1.12) saturate(1.15)`,
        }}
      />

      {/* Menú */}
      <motion.nav
        className="flex-1 flex flex-col gap-2 overflow-auto px-2 min-h-0 relative z-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleMenuItems.map((item, i) => {
          const isActive = item.submenu
            ? item.submenu.some((sub) => location.pathname === sub.path)
            : location.pathname === item.path;

          return (
            <motion.div key={i} variants={itemVariants} className="relative">
              {item.submenu ? (
                <button
                  onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                  className={`flex items-center justify-between gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left relative z-10 transition-colors duration-200
                    ${
                      isActive
                        ? "bg-emerald-800 text-white"
                        : "text-gray-700 hover:text-white hover:bg-emerald-600/40"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {item.icon} {!isCollapsed && <span>{item.name}</span>}
                  </div>
                  {!isCollapsed &&
                    (openDropdown === i ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    ))}
                </button>
              ) : item.action ? (
                <button
                  onClick={item.action}
                  className="flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left relative z-10 transition-colors duration-200 text-gray-700 hover:text-white hover:bg-emerald-600/40"
                >
                  {item.icon} {!isCollapsed && <span>{item.name}</span>}
                </button>
              ) : (
                <Link
                  to={item.path}
                  onClick={handleItemClick}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium relative z-10 transition-colors duration-200
                    ${
                      isActive
                        ? "bg-emerald-800 text-white"
                        : "text-gray-700 hover:text-white hover:bg-emerald-600/40"
                    }
                  `}
                >
                  {item.icon} {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )}

              {/* Fondo activo */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeHighlight"
                    className="absolute inset-0 rounded-md pointer-events-none"
                    style={{ backgroundColor: "rgba(6,95,70,0.3)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Submenú */}
              <AnimatePresence>
                {item.submenu && openDropdown === i && !isCollapsed && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="ml-4 mt-1 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex flex-col gap-2 overflow-hidden"
                  >
                    {item.submenu.map((subItem, j) => {
                      const subActive = location.pathname === subItem.path;
                      return (
                        <li key={j}>
                          <Link
                            to={subItem.path}
                            onClick={handleItemClick}
                            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md transition-colors duration-200
                              ${
                                subActive
                                  ? "bg-emerald-800 text-white font-medium"
                                  : "text-gray-700 hover:bg-emerald-600/40 hover:text-white"
                              }
                            `}
                          >
                            {subItem.icon} {subItem.name}
                          </Link>
                        </li>
                      );
                    })}
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
