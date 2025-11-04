import React, { useState, useMemo, useEffect } from "react";
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
import ProductSearch from "../../../../../shared/components/searchBars/productSearch"
import { usePostReturnProducts } from "../../../../../shared/components/hooks/returnProducts/usePostReturnProducts";
import { useFetchReturnProducts } from "../../../../../shared/components/hooks/returnProducts/useFetchReturnProducts";


const ProductReturnModal = ({ isOpen, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [productToRegister, setProductToRegister] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const { postReturnProducts, loading, error, success } = usePostReturnProducts();
  const { refetch } = useFetchReturnProducts();

  const returnReasons = [
    { value: "cerca de vencer", label: "Cerca de vencer" },
    { value: "vencido", label: "Vencido" }
  ];

  const actionTypes = [
    { value: "descuento", label: "Descuento" },
    { value: "registrar", label: "Registrar" }
  ];

  const handleAddProduct = (product) => {
    const existingIndex = selectedProducts.findIndex(p => p.id === product.id);
    const safeQuantity = product.returnQuantity ?? 1;

    if (existingIndex > -1) {
      const updated = [...selectedProducts];
      updated[existingIndex] = { ...updated[existingIndex], returnQuantity: safeQuantity };
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([...selectedProducts, { ...product, returnQuantity: safeQuantity }]);
    }
  };


  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleUpdateQuantity = (productId, delta) => {
    setSelectedProducts(selectedProducts.map(p => {
      if (p.id === productId) {
        const current = (typeof p.returnQuantity === "number" && !isNaN(p.returnQuantity)) ? p.returnQuantity : 1;
        const newQuantity = Math.max(1, Math.min(p.quantity, current + delta));
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
const handleConfirmReturn = async () => {
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

  const id_responsable = 1; // ⚠️ reemplazar con el ID real del usuario logueado
  const isDiscount = actionType === "descuento";

  const result = await postReturnProducts(id_responsable, selectedProducts, returnReason, isDiscount);
  console.log("result");
  if (result) {
    refetch();
    alert("✅ Devolución registrada exitosamente");
    handleCloseModal();
  }
};


  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  useEffect(() => {
    // Si ya no hay productos seleccionados, reiniciamos razón y acción
    if (selectedProducts.length === 0) {
      setReturnReason("");
      setActionType("");
    }
  }, [selectedProducts.length]);

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
                  className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <motion.div
                        className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1, backgroundColor: "#dcfce7" }}
                      >
                        <Package size={18} className="text-green-700" />
                      </motion.div>
                      Devolución de Productos
                    </h3>
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
                  </div>
                </motion.div>

                {/* Contenido */}
                <div className="flex flex-col p-6 space-y-4 flex-grow max-h-[70vh]">
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
                                  <p className="font-medium text-sm text-gray-800">{product.productos.nombre}</p>
                                  <p className="text-xs text-gray-500">{formatPrice(product.productos.precio_venta)} c/u</p>
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
                    {selectedProducts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                      >
                        <h4 className="font-semibold text-gray-800 mb-3">Razón de la devolución</h4>
                        <div className="space-y-3">
                          {returnReasons.map((reason) => {
                            const isSelected = returnReason === reason.value;
                            return (
                              <label
                                key={reason.value}
                                className={`flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-all select-none ${isSelected
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
                                  className={`w-5 h-5 flex items-center justify-center rounded-md border transition ${isSelected
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
                                <span
                                  className={`text-sm font-medium transition ${isSelected ? "text-emerald-700" : "text-gray-700"
                                    }`}
                                >
                                  {reason.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* Acción a realizar */}
                    {selectedProducts.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>
                        <h4 className="font-semibold text-gray-800 mb-3">Acción a realizar</h4>
                        <div className="space-y-3">
                          {actionTypes.map((action) => {
                            const isSelected = actionType === action.value;
                            const isDisabled = !returnReason; // <-- deshabilitado si no hay razón
                            return (
                              <label
                                key={action.value}
                                className={`flex items-center gap-3 rounded-lg border p-3 transition-all select-none ${isDisabled
                                  ? "border-gray-200 bg-white opacity-60 cursor-not-allowed"
                                  : isSelected
                                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                    : "border-gray-200 hover:bg-gray-50"
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="actionType"
                                  value={action.value}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (isDisabled) return;
                                    const value = e.target.value;
                                    setActionType(value);

                                    if (value === "registrar") {
                                      if (selectedProducts.length === 0) {
                                        alert("Debe seleccionar al menos un producto antes de registrar.");
                                        setActionType("");
                                        return;
                                      }
                                      handleOpenRegistration(0);
                                    } else {
                                      // cerrar modal de registro si estaba abierto
                                      setIsRegistrationModalOpen(false);
                                      setProductToRegister(null);
                                      setCurrentProductIndex(0);
                                    }
                                  }}
                                  className="hidden"
                                  disabled={isDisabled}
                                />
                                <div
                                  className={`w-5 h-5 flex items-center justify-center rounded-md border transition ${isDisabled
                                    ? "bg-gray-100 border-gray-200"
                                    : isSelected
                                      ? "bg-emerald-600 border-emerald-600"
                                      : "bg-white border-gray-300"
                                    }`}
                                >
                                  {/* Solo mostramos el check si está seleccionado y no está deshabilitado */}
                                  {isSelected && !isDisabled && (
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-sm font-medium transition ${isDisabled ? "text-gray-400" : isSelected ? "text-emerald-700" : "text-gray-700"}`}>
                                  {action.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Mensaje de ayuda cuando aún no se ha seleccionado una razón */}
                        {!returnReason && (
                          <p className="mt-2 text-sm text-gray-500">Selecciona una razón de devolución para habilitar las acciones.</p>
                        )}
                      </motion.div>
                    )}
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
