import {
  Users,
  DollarSign,
  List,
  Box,
  RotateCcw,
  Truck,
  ShoppingCart,
  Settings,
} from "lucide-react";

export default function Sidebar() {
  const menuItems = [
    { name: "Clientes", icon: <Users size={20} /> },
    { name: "Ventas", icon: <DollarSign size={20} /> },
    { name: "Categorias", icon: <List size={20} /> },
    { name: "Productos", icon: <Box size={20} /> },
    { name: "Devoluciones/Baja", icon: <RotateCcw size={20} /> },
    { name: "Proveedores", icon: <Truck size={20} /> },
    { name: "Compras", icon: <ShoppingCart size={20} /> },
    { name: "Usuarios", icon: <Users size={20} /> },
    { name: "Configuración", icon: <Settings size={20} /> },
  ];

  return (
    <aside
      className="w-64 h-screen shadow-md p-5" // Eliminamos "text-white"
      style={{ backgroundColor: "#b4debf" }} // Cambiamos el color de fondo
    >
      <h1 className="text-lg font-semibold mb-6 text-black">KajaMart</h1>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium w-full text-left
              ${
                item.active
                  ? "text-black font-semibold"
                  : "text-gray-600 hover:bg-gray-200" // Ajustamos los colores del menú
              }
            `}
            style={item.active ? { backgroundColor: "#cbf0d5ff" } : {}}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}