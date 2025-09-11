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
import ProductSearch from "../../../../../shared/components/searchBars/productSearch";
// Componente ProductSearch optimizado integrado

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

  // Al añadir, nos aseguramos de no permitir requestedQuantity > stock
  const handleAddProduct = (product) => {
    // normalize requestedQuantity
    const requested = Math.max(0, product.requestedQuantity || 0);
    const allowed = Math.min(requested, product.quantity || requested);

    if (requested > allowed) {
      alert(`No hay suficiente stock. Stock disponible: ${product.quantity}`);
    }

    const toAdd = { ...product, requestedQuantity: allowed };

    setNewProducts((prev) => {
      const existingProductIndex = prev.findIndex((p) => p.id === toAdd.id);
      if (existingProductIndex > -1) {
        const updatedProducts = [...prev];
        // Reemplazamos la cantidad del producto existente por la nueva (limitada)
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          requestedQuantity: toAdd.requestedQuantity,
        };
        return updatedProducts;
      }
      return [...prev, toAdd];
    });
  };

  const handleRemoveProduct = (productId) => {
    setNewProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateNewProductQuantity = (productId, amount) => {
    setNewProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.requestedQuantity || 0;
          const attempted = current + amount;

          // Si intentan aumentar por encima del stock
          if (amount > 0 && attempted > p.quantity) {
            alert(`No hay suficiente stock. Solo quedan ${p.quantity} unidades.`);
            return { ...p, requestedQuantity: p.quantity };
          }

          const newQty = Math.max(0, Math.min(p.quantity || attempted, attempted));
          return { ...p, requestedQuantity: newQty };
        }
        return p;
      })
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
                <h2 className="text-2xl font-bold text-gray-800">Devolución de Venta</h2>
                <motion.button
                  onClick={() => setIsOpen(false)}
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

              {/* Contenido del formulario */}
              <div className="flex-1 overflow-y-auto p-6">
                <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }}>
                  {/* Detalles de la venta */}
                  <motion.div className="flex justify-between items-center mb-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
                    <h3 className="text-lg font-semibold text-gray-800">Productos de la venta {selectedSale?.id}</h3>
                  </motion.div>

                  {/* Sección de productos de la venta original */}
                  <motion.div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
                    <motion.div className="max-h-52 overflow-y-auto space-y-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                      {productsToReturn?.map((product) => (
                        <motion.div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} whileHover={{ scale: 1.0, backgroundColor: "#f0f9ff", transition: { duration: 0.2 } }}>
                          <motion.div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center" whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}>
                            <Package className="w-4 h-4 text-green-700" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-800">{product.name}</p>
                            <p className="text-xs text-gray-500">Cant. a devolver: {product.returnQuantity}</p>
                          </div>
                          <motion.p className="font-semibold text-sm text-gray-800" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" }}>
                            {formatPrice(product.returnQuantity * product.salePrice)}
                          </motion.p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>

                  {/* Sección de nuevos productos */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Añadir nuevos productos</h3>
                      <motion.div animate={{ rotate: [0, 45, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                        <ArrowLeftRight size={20} className="text-gray-500" />
                      </motion.div>
                    </div>

                    <ProductSearch onAddProduct={handleAddProduct} />

                    <AnimatePresence>
                      {newProducts.length > 0 && (
                        <motion.div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mt-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                          <motion.div className="max-h-52 overflow-y-auto space-y-3" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                            <AnimatePresence mode="popLayout">
                              {newProducts.map((product) => (
                                <motion.div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg" variants={{ hidden: { opacity: 0, x: -20, scale: 0.8 }, visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20 } } }} exit={{ opacity: 0, x: 20, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } }} layout whileHover={{ scale: 1.00, backgroundColor: "#f0f9ff", transition: { duration: 0.2 } }}>
                                  <motion.div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center" whileHover={{ scale: 1.1, backgroundColor: "#dcfce7", transition: { duration: 0.2 } }}>
                                    <Package className="w-4 h-4 text-green-700" />
                                  </motion.div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-800">{product.name}</p>
                                    <p className="text-xs text-gray-500">{formatPrice(product.salePrice)} c/u</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      onClick={() => handleUpdateNewProductQuantity(product.id, -1)}
                                      disabled={product.requestedQuantity <= 1}
                                      className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                      whileHover={{ scale: 1.1, backgroundColor: "#a7f3d0" }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Minus size={14} />
                                    </motion.button>
                                    <motion.span className="font-bold text-sm text-gray-800 min-w-[20px] text-center" key={product.requestedQuantity} initial={{ scale: 1.2, color: "#16a34a" }} animate={{ scale: 1, color: "#1f2937" }} transition={{ duration: 0.2 }}>
                                      {product.requestedQuantity}
                                    </motion.span>
                                    <motion.button
                                      onClick={() => handleUpdateNewProductQuantity(product.id, 1)}
                                      disabled={product.requestedQuantity >= product.quantity}
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
                            </AnimatePresence>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Totales con animaciones */}
                  <motion.div className="space-y-2 mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
                    <motion.div className="flex justify-between font-semibold text-gray-700" whileHover={{ scale: 1.0 }} transition={{ duration: 0.2 }}>
                      <span>Total de productos a devolver:</span>
                      <motion.span key={returnTotal} initial={{ scale: 1.1, color: "#16a34a" }} animate={{ scale: 1, color: "#374151" }} transition={{ duration: 0.3 }}>
                        {formatPrice(returnTotal)}
                      </motion.span>
                    </motion.div>
                    <motion.div className="flex justify-between font-semibold text-gray-700" whileHover={{ scale: 1.0 }} transition={{ duration: 0.2 }}>
                      <span>Total de nuevos productos:</span>
                      <motion.span key={newProductsTotal} initial={{ scale: 1.1, color: "#16a34a" }} animate={{ scale: 1, color: "#374151" }} transition={{ duration: 0.3 }}>
                        {formatPrice(newProductsTotal)}
                      </motion.span>
                    </motion.div>
                    <motion.div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.3 }} whileHover={{ scale: 1.0 }}>
                      {returnTotal >= newProductsTotal ? (
                        <>
                          <span className="text-green-600">Monto a devolver:</span>
                          <motion.span className="text-green-600" key={`devolver-${montoDevolver}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.4, type: "spring" }}>
                            {formatPrice(montoDevolver)}
                          </motion.span>
                        </>
                      ) : (
                        <>
                          <span className="text-red-600">Monto a solicitar:</span>
                          <motion.span className="text-red-600" key={`solicitar-${montoSolicitar}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.4, type: "spring" }}>
                            {formatPrice(montoSolicitar)}
                          </motion.span>
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Footer con botones */}
              <motion.div className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.4 }}>
                <motion.button onClick={() => setIsOpen(false)} disabled={isProcessing} className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-sm hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" whileHover={{ scale: 1.00, backgroundColor: "#d1d5db" }} whileTap={{ scale: 0.98 }}>
                  Cancelar
                </motion.button>
                <motion.button onClick={handleConfirmReturn} disabled={isProcessing || (productsToReturn?.length === 0 && newProducts.length === 0)} className="flex-1 px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" whileHover={{ scale: 1.00, backgroundColor: "#15803d", boxShadow: "0 10px 25px rgba(22, 163, 74, 0.3)" }} whileTap={{ scale: 0.98 }}>
                  {isProcessing ? (
                    <>
                      <motion.div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Procesando...</motion.span>
                    </>
                  ) : (
                    <>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
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
                  <motion.div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                    <motion.div className="text-center" initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}>
                      <motion.div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </motion.div>
                      <motion.h3 className="text-xl font-bold text-gray-800 mb-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        ¡Devolución Procesada!
                      </motion.h3>
                      <motion.p className="text-gray-600" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
