import React, { useState, useMemo } from "react";
import {
  Search,
  Receipt,
  X,
  Minus,
  Plus,
  ArrowLeftRight,
  Package,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductSearch = ({ onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const products = [
    {
      id: 1,
      barcode: "7501234567890",
      name: "Producto Premium A",
      expiryDate: "2025-12-15",
      quantity: 5,
      salePrice: 35500,
      category: "Alimentación",
    },
    {
      id: 2,
      barcode: "7501234567891",
      name: "Producto Básico B",
      expiryDate: "2025-06-20",
      quantity: 120,
      salePrice: 22999,
      category: "Bebidas",
    },
    {
      id: 3,
      barcode: "7501234567892",
      name: "Producto Especial C",
      expiryDate: "2025-09-10",
      quantity: 75,
      salePrice: 65000,
      category: "Cuidado Personal",
    },
    {
      id: 4,
      barcode: "7501234567893",
      name: "Producto Tecnológico D",
      expiryDate: "2025-11-30",
      quantity: 25,
      salePrice: 125000,
      category: "Tecnología",
    },
    {
      id: 5,
      barcode: "7501234567894",
      name: "Producto Hogar E",
      expiryDate: "2025-08-15",
      quantity: 90,
      salePrice: 45000,
      category: "Hogar",
    },
  ];

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        p.barcode.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setShowDropdown(false);
    setQuantity(1);
  };

const handleAddProduct = () => {
  if (!selectedProduct) {
    setAlertMessage("Por favor, selecciona un producto.");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
    return;
  }
  if (quantity <= 0) {
    setAlertMessage("La cantidad debe ser mayor a 0.");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
    return;
  }
  if (quantity > selectedProduct.quantity) {
    setAlertMessage(
      `No hay suficiente stock. Solo quedan ${selectedProduct.quantity} unidades disponibles.`
    );
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
    return;
  }

  const newProduct = { ...selectedProduct, requestedQuantity: quantity };
  onAddProduct(newProduct);

  // Mostrar mensaje de éxito
  setAlertMessage(`${selectedProduct.name} añadido exitosamente`);
  setShowAlert(true);
  setTimeout(() => setShowAlert(false), 2500);

  setSelectedProduct(null);
  setSearchTerm("");
  setQuantity(1);
};


  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="relative mb-6">
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Campo de búsqueda */}
        <div className="relative flex-1">
          <motion.div 
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </motion.div>
          <motion.input
            type="text"
            className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-400 transition-all bg-white"
            placeholder="Buscar por producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
            whileFocus={{ scale: 1.0 }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        {/* Campo de cantidad con nuevos estilos */}
        <motion.div 
          className="flex-shrink-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <label className="text-sm font-semibold text-gray-700">Cantidad:</label>
          <motion.input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            className="w-24 mt-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-black text-center focus:ring-2 focus:ring-green-400 focus:outline-none"
            whileFocus={{ scale: 1.05, borderColor: "#16a34a" }}
          />
        </motion.div>
        
        <motion.button
          onClick={handleAddProduct}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200"
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)" 
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Añadir producto
        </motion.button>
      </motion.div>

      {/* Alerta de validación con animaciones mejoradas */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            className={`mt-4 p-4 flex items-center gap-3 rounded-lg shadow-sm ${
              alertMessage.includes("exitosamente") 
                ? "bg-green-100 text-green-700 border border-green-200" 
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            >
              {alertMessage.includes("exitosamente") ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </motion.div>
            <motion.p 
              className="text-sm font-medium"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {alertMessage}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown de resultados con animaciones */}
      <AnimatePresence>
        {showDropdown && searchTerm && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {filteredProducts.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors duration-200"
                    onClick={() => handleSelectProduct(product)}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    whileHover={{ 
                      scale: 1.0,
                      backgroundColor: "#dcfce7",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"
                        whileHover={{ 
                          backgroundColor: "#dcfce7",
                          scale: 1.1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <Package className="w-5 h-5 text-gray-500" />
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          Cód. {product.barcode} • {formatPrice(product.salePrice)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                className="p-4 text-center text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                No se encontraron coincidencias.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSearch;