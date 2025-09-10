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

// Componente ProductSearch optimizado integrado
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
      quantity: 50,
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

const CompleteReturn = ({
  isOpen,
  setIsOpen,
  selectedSale,
  productsToReturn,
  returnTotal,
}) => {
  const [newProducts, setNewProducts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const newProductsTotal = useMemo(
    () =>
      newProducts.reduce((t, p) => t + p.requestedQuantity * p.salePrice, 0),
    [newProducts]
  );

  const montoDevolver = Math.max(returnTotal - newProductsTotal, 0);
  const montoSolicitar = Math.max(newProductsTotal - returnTotal, 0);

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddProduct = (product) => {
    setNewProducts((prev) => {
      const existingProductIndex = prev.findIndex(
        (p) => p.id === product.id
      );
      if (existingProductIndex > -1) {
        // Se reemplaza la cantidad del producto existente
        const updatedProducts = [...prev];
        updatedProducts[existingProductIndex].requestedQuantity = product.requestedQuantity;
        return updatedProducts;
      }
      // Se añade el nuevo producto
      return [...prev, product];
    });
  };

  const handleRemoveProduct = (productId) => {
    setNewProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateNewProductQuantity = (productId, amount) => {
    setNewProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              requestedQuantity: Math.max(0, p.requestedQuantity + amount),
            }
          : p
      )
    );
  };

  const handleConfirmReturn = () => {
    // Simulación de una llamada a la API
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessMessage(true);
      console.log("Devolución procesada con éxito.");
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsOpen(false);
      }, 3000);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh]"
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
                <h2 className="text-2xl font-bold text-gray-800">
                  Devolución de Venta
                </h2>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-all p-2 rounded-full"
                  aria-label="Cerrar modal"
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: "#f3f4f6",
                    rotate: 90 
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} />
                </motion.button>
              </motion.div>

              {/* Contenido del formulario */}
              <div className="flex-1 overflow-y-auto p-6">
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {/* Detalles de la venta */}
                  <motion.div 
                    className="flex justify-between items-center mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <h3 className="text-lg font-semibold text-gray-800">
                      Productos de la venta {selectedSale?.id}
                    </h3>
                  </motion.div>

                  {/* Sección de productos de la venta original */}
                  <motion.div 
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <motion.div 
                      className="max-h-52 overflow-y-auto space-y-3"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      {productsToReturn?.map((product, index) => (
                        <motion.div
                          key={product.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                          whileHover={{ 
                            scale: 1.0,
                            backgroundColor: "#f0f9ff",
                            transition: { duration: 0.2 }
                          }}
                        >
                          <motion.div 
                            className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}
                          >
                            <Package className="w-4 h-4 text-green-700" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Cant. a devolver: {product.returnQuantity}
                            </p>
                          </div>
                          <motion.p 
                            className="font-semibold text-sm text-gray-800"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                          >
                            {formatPrice(product.returnQuantity * product.salePrice)}
                          </motion.p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Sección de nuevos productos */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Añadir nuevos productos
                      </h3>
                      <motion.div
                        animate={{ rotate: [0, 45, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <ArrowLeftRight
                          size={20}
                          className="text-gray-500"
                        />
                      </motion.div>
                    </div>
                    <ProductSearch onAddProduct={handleAddProduct} />
                    
                    <AnimatePresence>
                      {newProducts.length > 0 && (
                        <motion.div 
                          className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mt-4"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <motion.div 
                            className="max-h-52 overflow-y-auto space-y-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                              visible: {
                                transition: {
                                  staggerChildren: 0.1
                                }
                              }
                            }}
                          >
                            <AnimatePresence mode="popLayout">
                              {newProducts.map((product) => (
                                <motion.div
                                  key={product.id}
                                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                                  variants={{
                                    hidden: { opacity: 0, x: -20, scale: 0.8 },
                                    visible: { 
                                      opacity: 1, 
                                      x: 0, 
                                      scale: 1,
                                      transition: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20
                                      }
                                    }
                                  }}
                                  exit={{ 
                                    opacity: 0, 
                                    x: 20, 
                                    scale: 0.8,
                                    transition: { 
                                      duration: 0.2,
                                      ease: "easeIn"
                                    }
                                  }}
                                  layout
                                  whileHover={{ 
                                    scale: 1.00,
                                    backgroundColor: "#f0f9ff",
                                    transition: { duration: 0.2 }
                                  }}
                                >
                                  <motion.div 
                                    className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                                    whileHover={{ 
                                      scale: 1.1,
                                      backgroundColor: "#dcfce7",
                                      transition: { duration: 0.2 }
                                    }}
                                  >
                                    <Package className="w-4 h-4 text-green-700" />
                                  </motion.div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-800">
                                      {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatPrice(product.salePrice)} c/u
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      onClick={() => handleUpdateNewProductQuantity(product.id, -1)}
                                      disabled={product.requestedQuantity <= 1}
                                      className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                      whileHover={{ 
                                        scale: 1.1,
                                        backgroundColor: "#a7f3d0"
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Minus size={14} />
                                    </motion.button>
                                    <motion.span 
                                      className="font-bold text-sm text-gray-800 min-w-[20px] text-center"
                                      key={product.requestedQuantity}
                                      initial={{ scale: 1.2, color: "#16a34a" }}
                                      animate={{ scale: 1, color: "#1f2937" }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      {product.requestedQuantity}
                                    </motion.span>
                                    <motion.button
                                      onClick={() => handleUpdateNewProductQuantity(product.id, 1)}
                                      className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                      whileHover={{ 
                                        scale: 1.1,
                                        backgroundColor: "#a7f3d0"
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Plus size={14} />
                                    </motion.button>
                                  </div>
                                  <motion.button
                                    onClick={() => handleRemoveProduct(product.id)}
                                    className="text-gray-400 hover:text-red-500 transition-all p-1 rounded-full"
                                    whileHover={{ 
                                      scale: 1.2,
                                      backgroundColor: "#fee2e2",
                                      color: "#dc2626"
                                    }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  {/* Totales con animaciones */}
                  <motion.div 
                    className="space-y-2 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <motion.div 
                      className="flex justify-between font-semibold text-gray-700"
                      whileHover={{ scale: 1.0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>Total de productos a devolver:</span>
                      <motion.span
                        key={returnTotal}
                        initial={{ scale: 1.1, color: "#16a34a" }}
                        animate={{ scale: 1, color: "#374151" }}
                        transition={{ duration: 0.3 }}
                      >
                        {formatPrice(returnTotal)}
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between font-semibold text-gray-700"
                      whileHover={{ scale: 1.0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>Total de nuevos productos:</span>
                      <motion.span
                        key={newProductsTotal}
                        initial={{ scale: 1.1, color: "#16a34a" }}
                        animate={{ scale: 1, color: "#374151" }}
                        transition={{ duration: 0.3 }}
                      >
                        {formatPrice(newProductsTotal)}
                      </motion.span>
                    </motion.div>
                    <motion.div 
                      className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                      whileHover={{ scale: 1.0 }}
                    >
                      {returnTotal >= newProductsTotal ? (
                        <>
                          <span className="text-green-600">Monto a devolver:</span>
                          <motion.span 
                            className="text-green-600"
                            key={`devolver-${montoDevolver}`}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, type: "spring" }}
                          >
                            {formatPrice(montoDevolver)}
                          </motion.span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-600">Monto a solicitar:</span>
                          <motion.span 
                            className="text-red-600"
                            key={`solicitar-${montoSolicitar}`}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.4, type: "spring" }}
                          >
                            {formatPrice(montoSolicitar)}
                          </motion.span>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Footer con botones */}
              <motion.div 
                className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <motion.button
                  onClick={() => setIsOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ 
                    scale: 1.00,
                    backgroundColor: "#d1d5db"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={handleConfirmReturn}
                  disabled={
                    isProcessing ||
                    (productsToReturn?.length === 0 && newProducts.length === 0)
                  }
                  className="flex-1 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ 
                    scale: 1.00,
                    backgroundColor: "#15803d",
                    boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? (
                    <>
                      <motion.div 
                        className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        Procesando...
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <CheckCircle size={20} />
                      </motion.div>
                      Confirmar Devolución
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Mensaje de éxito */}
              <AnimatePresence>
                {showSuccessMessage && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="text-center"
                      initial={{ y: 20 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.1,
                          type: "spring",
                          stiffness: 300,
                          damping: 20
                        }}
                      >
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <motion.h3 
                        className="text-xl font-bold text-gray-800 mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        ¡Devolución Procesada!
                      </motion.h3>
                      <motion.p 
                        className="text-gray-600"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        La devolución se ha procesado exitosamente.
                      </motion.p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompleteReturn;