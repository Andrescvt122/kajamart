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
    // más productos...
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
      return;
    }
    if (quantity <= 0) {
      setAlertMessage("La cantidad debe ser mayor a 0.");
      setShowAlert(true);
      return;
    }
    const newProduct = { ...selectedProduct, requestedQuantity: quantity };
    onAddProduct(newProduct);
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
      <div className="flex items-center gap-4">
        {/* Campo de búsqueda */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-lg border-0 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-400 transition-all bg-white"
            placeholder="Buscar por producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
          />
        </div>
        {/* Campo de cantidad con nuevos estilos */}
        <div className="flex-shrink-0">
          <label className="text-sm font-semibold text-gray-700">Cantidad:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            min="1"
            className="w-24 mt-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white text-black text-center focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>
        <button
          onClick={handleAddProduct}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition"
        >
          Añadir producto
        </button>
      </div>

      {/* Alerta de validación */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            className="mt-4 p-4 flex items-center gap-3 bg-red-100 text-red-700 rounded-lg shadow-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{alertMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown de resultados */}
      {showDropdown && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0"
                onClick={() => handleSelectProduct(product)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      Cód. {product.barcode} • {formatPrice(product.salePrice)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              No se encontraron coincidencias.
            </div>
          )}
        </div>
      )}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Devolución de Venta
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-all"
                  aria-label="Cerrar modal"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido del formulario */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Detalles de la venta */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Productos de la venta {selectedSale.id}
                    </h3>
                  </div>

                  {/* Sección de productos de la venta original */}
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="max-h-52 overflow-y-auto space-y-3">
                      {productsToReturn.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-green-700" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Cant. a devolver: {product.returnQuantity}
                            </p>
                          </div>
                          <p className="font-semibold text-sm text-gray-800">
                            {formatPrice(product.returnQuantity * product.salePrice)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sección de nuevos productos */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Añadir nuevos productos
                      </h3>
                      <ArrowLeftRight
                        size={20}
                        className="text-gray-500 transform rotate-45"
                      />
                    </div>
                    <ProductSearch onAddProduct={handleAddProduct} />
                    {newProducts.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mt-4">
                        <div className="max-h-52 overflow-y-auto space-y-3">
                          {newProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-green-700" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatPrice(product.salePrice)} c/u
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateNewProductQuantity(product.id, -1)}
                                  disabled={product.requestedQuantity <= 1}
                                  className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="font-bold text-sm text-gray-800 min-w-[20px] text-center">
                                  {product.requestedQuantity}
                                </span>
                                <button
                                  onClick={() => handleUpdateNewProductQuantity(product.id, 1)}
                                  className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveProduct(product.id)}
                                className="text-gray-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Totales */}
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Total de productos a devolver:</span>
                      <span>{formatPrice(returnTotal)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-700">
                      <span>Total de nuevos productos:</span>
                      <span>{formatPrice(newProductsTotal)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                      {returnTotal >= newProductsTotal ? (
                        <>
                          <span className="text-green-600">Monto a devolver:</span>
                          <span className="text-green-600">
                            {formatPrice(montoDevolver)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-600">Monto a solicitar:</span>
                          <span className="text-red-600">
                            {formatPrice(montoSolicitar)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer con botones */}
              <div className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReturn}
                  disabled={
                    isProcessing ||
                    (productsToReturn.length === 0 && newProducts.length === 0)
                  }
                  className="flex-1 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirmar Devolución
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CompleteReturn;
