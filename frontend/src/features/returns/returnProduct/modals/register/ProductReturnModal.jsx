import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Trash2,
  Minus,
  Plus,
  CheckCircle,
  AlertCircle,
  Search
} from "lucide-react";
import ProductRegistrationModal from "./ProductRegistrationModal";

// Componente ProductSearch integrado
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
      image: "/api/placeholder/60/60"
    },
    {
      id: 2,
      barcode: "7501234567891",
      name: "Producto Básico B",
      expiryDate: "2025-06-20",
      quantity: 120,
      salePrice: 22999,
      category: "Bebidas",
      image: "/api/placeholder/60/60"
    },
    {
      id: 3,
      barcode: "7501234567892",
      name: "Producto Especial C",
      expiryDate: "2025-09-10",
      quantity: 75,
      salePrice: 65000,
      category: "Cuidado Personal",
      image: "/api/placeholder/60/60"
    },
    {
      id: 4,
      barcode: "7501234567893",
      name: "Producto Tecnológico D",
      expiryDate: "2025-11-30",
      quantity: 25,
      salePrice: 125000,
      category: "Tecnología",
      image: "/api/placeholder/60/60"
    },
    {
      id: 5,
      barcode: "7501234567894",
      name: "Producto Hogar E",
      expiryDate: "2025-08-15",
      quantity: 90,
      salePrice: 45000,
      category: "Hogar",
      image: "/api/placeholder/60/60"
    }
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

    const newProduct = { ...selectedProduct, returnQuantity: quantity };
    onAddProduct(newProduct);

    setAlertMessage(`${selectedProduct.name} añadido exitosamente`);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2500);

    setSelectedProduct(null);
    setSearchTerm("");
    setQuantity(1);
  };

  return (
    <div className="relative mb-6">
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative flex-1">
          <motion.div 
            className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          >
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </motion.div>
          <input
            type="text"
            className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-400 transition-all bg-white"
            placeholder="Buscar por producto o código de barras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
          />
        </div>
        
        <motion.div className="flex-shrink-0">
          <label className="text-sm font-semibold text-gray-700">Cantidad:</label>
          <motion.input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-24 mt-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-black text-center focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </motion.div>
        
        <motion.button
          onClick={handleAddProduct}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Añadir producto
        </motion.button>
      </motion.div>

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
                          Cód. {product.barcode} • Stock: {product.quantity}
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

const ProductReturnModal = ({ isOpen, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [productToRegister, setProductToRegister] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const returnReasons = [
    { value: "cerca_vencer", label: "Cerca de vencer" },
    { value: "vencido", label: "Vencido" }
  ];

  const actionTypes = [
    { value: "descuento", label: "Descuento" },
    { value: "registrar", label: "Registrar" }
  ];

  const handleAddProduct = (product) => {
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      updated[existingIndex] = { ...updated[existingIndex], returnQuantity: product.returnQuantity };
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleUpdateQuantity = (productId, delta) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        const newQuantity = Math.max(1, Math.min(p.quantity, p.returnQuantity + delta));
        return { ...p, returnQuantity: newQuantity };
      }
      return p;
    }));
  };

  const handleOpenRegistration = (index = 0) => {
    if (selectedProducts.length > index) {
      setProductToRegister(selectedProducts[index]);
      setCurrentProductIndex(index);
      setIsRegistrationModalOpen(true);
    }
  };

  const handleConfirmRegistration = (registeredProduct) => {
    console.log("Producto registrado:", registeredProduct);
    
    // Verificar si hay más productos por registrar
    const nextIndex = currentProductIndex + 1;
    if (nextIndex < selectedProducts.length) {
      setCurrentProductIndex(nextIndex);
      setProductToRegister(selectedProducts[nextIndex]);
    } else {
      setIsRegistrationModalOpen(false);
      setProductToRegister(null);
      setCurrentProductIndex(0);
      
      // Procesar toda la devolución
      console.log("Todos los productos registrados. Procesando devolución completa...");
      alert("Devolución procesada exitosamente");
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setSelectedProducts([]);
    setReturnReason("");
    setActionType("");
    setIsRegistrationModalOpen(false);
    setProductToRegister(null);
    setCurrentProductIndex(0);
    onClose();
  };

  const handleConfirmReturn = () => {
    if (selectedProducts.length === 0) {
      alert("Debe seleccionar al menos un producto para devolver");
      return;
    }

    if (!returnReason) {
      alert("Debe seleccionar una razón para la devolución");
      return;
    }

    if (!actionType) {
      alert("Debe seleccionar una acción a realizar");
      return;
    }

    if (actionType === "registrar") {
      // Iniciar proceso de registro para cada producto
      handleOpenRegistration(0);
      return;
    }

    // Si es descuento, procesar directamente
    console.log("Devolución confirmada:", {
      products: selectedProducts,
      reason: returnReason,
      action: actionType
    });

    alert("Devolución procesada exitosamente");
    handleCloseModal();
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);


  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />

            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl relative flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
                initial={{ y: 50 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              >
                {/* Header */}
                <motion.div
                  className="p-6 border-b border-gray-200 flex items-center justify-between"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-gray-800">Devolución de Productos</h2>
                  <motion.button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 transition-all p-2 rounded-full"
                    aria-label="Cerrar modal"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "#f3f4f6",
                      rotate: 90,
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={24} />
                  </motion.button>
                </motion.div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6">
                  <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                    {/* Búsqueda y listado de productos */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Buscar y agregar productos</h3>
                      <ProductSearch onAddProduct={handleAddProduct} />
                    </motion.div>

                    {/* Lista de productos seleccionados */}
                    <AnimatePresence>
                      {selectedProducts.length > 0 && (
                        <motion.div
                          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <h4 className="font-semibold text-gray-800 mb-3">Productos a devolver</h4>
                          <motion.div className="space-y-3 max-h-60 overflow-y-auto" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                            {selectedProducts.map((product) => (
                              <motion.div
                                key={product.id}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.0, backgroundColor: "#f0f9ff", transition: { duration: 0.2 } }}
                              >
                                <motion.div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center" whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}>
                                  <Package className="w-4 h-4 text-green-700" />
                                </motion.div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-gray-800">{product.name}</p>
                                  <p className="text-xs text-gray-500">{formatPrice(product.salePrice)} c/u</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <motion.button
                                    onClick={() => handleUpdateQuantity(product.id, -1)}
                                    disabled={product.returnQuantity <= 1}
                                    className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                    whileHover={{ scale: 1.1, backgroundColor: "#a7f3d0" }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Minus size={14} />
                                  </motion.button>
                                  <motion.span className="font-bold text-sm text-gray-800 min-w-[20px] text-center" key={product.returnQuantity} initial={{ scale: 1.2, color: "#16a34a" }} animate={{ scale: 1, color: "#1f2937" }} transition={{ duration: 0.2 }}>
                                    {product.returnQuantity}
                                  </motion.span>
                                  <motion.button
                                    onClick={() => handleUpdateQuantity(product.id, 1)}
                                    disabled={product.returnQuantity >= product.quantity}
                                    className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                    whileHover={{ scale: 1.1, backgroundColor: "#a7f3d0" }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Plus size={14} />
                                  </motion.button>
                                </div>
                                <motion.button onClick={() => handleRemoveProduct(product.id)} className="text-gray-400 hover:text-red-500 transition-all p-1 rounded-full" whileHover={{ scale: 1.2, backgroundColor: "#fee2e2", color: "#dc2626" }} whileTap={{ scale: 0.9 }}>
                                  <Trash2 size={16} />
                                </motion.button>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Razón de la devolución */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
                      <h4 className="font-semibold text-gray-800 mb-3">Razón de la devolución</h4>
                      <div className="space-y-3">
                        {returnReasons.map((reason) => {
                          const isSelected = returnReason === reason.value;
                          return (
                            <label
                              key={reason.value}
                              className={`flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-all select-none ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="returnReason"
                                value={reason.value}
                                checked={isSelected}
                                onChange={(e) => setReturnReason(e.target.value)}
                                className="hidden"
                              />
                              <div
                                className={`w-5 h-5 flex items-center justify-center rounded-md border transition ${
                                  isSelected
                                    ? "bg-emerald-600 border-emerald-600"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-sm font-medium transition ${isSelected ? "text-emerald-700" : "text-gray-700"}`}>
                                {reason.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>

                    {/* Acción a realizar */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
                      <h4 className="font-semibold text-gray-800 mb-3">Acción a realizar</h4>
                      <div className="space-y-3">
                        {actionTypes.map((action) => {
                          const isSelected = actionType === action.value;
                          return (
                            <label
                              key={action.value}
                              className={`flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-all select-none ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="actionType"
                                value={action.value}
                                checked={isSelected}
                                onChange={(e) => setActionType(e.target.value)}
                                className="hidden"
                              />
                              <div
                                className={`w-5 h-5 flex items-center justify-center rounded-md border transition ${
                                  isSelected
                                    ? "bg-emerald-600 border-emerald-600"
                                    : "bg-white border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-sm font-medium transition ${isSelected ? "text-emerald-700" : "text-gray-700"}`}>
                                {action.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Footer */}
                <motion.div className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.4 }}>
                  <motion.button onClick={handleCloseModal} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors" whileHover={{ scale: 1.00, backgroundColor: "#d1d5db" }} whileTap={{ scale: 0.98 }}>
                    Cancelar
                  </motion.button>
                  <motion.button onClick={handleConfirmReturn} disabled={selectedProducts.length === 0 || !returnReason || !actionType} className="flex-1 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" whileHover={{ scale: 1.00, backgroundColor: "#15803d", boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)" }} whileTap={{ scale: 0.98 }}>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <CheckCircle size={20} />
                    </motion.div>
                    Confirmar Devolución
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de registro de producto */}
      <ProductRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        product={productToRegister}
        onConfirm={handleConfirmRegistration}
      />
    </>
  );
};

export default ProductReturnModal;