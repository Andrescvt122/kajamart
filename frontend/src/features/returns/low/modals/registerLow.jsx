import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Package, Trash2, Minus, Plus } from "lucide-react";
import ProductSearch from "../../../../shared/components/searchBars/productSearch";

const RegisterLow = ({ isOpen, onClose, onConfirm }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productReasonDropdowns, setProductReasonDropdowns] = useState({});

  const reasonOptions = [
    { value: "vencido", label: "Superó fecha de vencimiento" },
    { value: "danado", label: "Producto dañado" },
    { value: "requerido_personal", label: "Requerido personal" },
  ];

  const handleAddProduct = (product) => {
    // Aseguramos que requestedQuantity no exceda el stock (product.quantity)
    const requested = Math.max(1, product.requestedQuantity || 1);
    const allowed = Math.min(requested, product.quantity || requested);

    if (requested > allowed) {
      alert(`No hay suficiente stock. Stock disponible: ${product.quantity}`);
    }

    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex((p) => p.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].requestedQuantity = allowed;
        return updated;
      }
      return [...prev, { ...product, requestedQuantity: allowed, reason: "" }];
    });
  };

  const toggleProductReasonDropdown = (productId) => {
    setProductReasonDropdowns((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleProductReasonSelect = (productId, reason) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, reason: reason.value } : p))
    );
    setProductReasonDropdowns((prev) => ({ ...prev, [productId]: false }));
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleUpdateProductQuantity = (productId, delta) => {
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.requestedQuantity || 1;
          const attempted = current + delta;

          // Si intentan aumentar por encima del stock, bloquear y alertar
          if (delta > 0 && attempted > p.quantity) {
            alert(`No hay suficiente stock. Stock disponible: ${p.quantity}`);
            return { ...p, requestedQuantity: p.quantity };
          }

          const newQty = Math.max(
            1,
            Math.min(p.quantity || attempted, attempted)
          );
          return { ...p, requestedQuantity: newQty };
        }
        return p;
      })
    );
  };

  const handleConfirm = () => {
    if (selectedProducts.length === 0) {
      alert("Selecciona al menos un producto");
      return;
    }

    const productsWithoutReason = selectedProducts.filter((p) => !p.reason);
    if (productsWithoutReason.length > 0) {
      alert("Todos los productos deben tener un motivo de baja");
      return;
    }

    onConfirm(selectedProducts);
    setSelectedProducts([]);
    setProductReasonDropdowns({});
    onClose();
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Contenedor del modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative p-6 space-y-6 overflow-visible"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  Registrar Baja de Producto
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <ProductSearch onAddProduct={handleAddProduct} />

                {/* Lista de productos seleccionados */}
                <AnimatePresence>
                  {selectedProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mt-2 relative overflow-visible"
                    >
                      <div className="max-h-52 overflow-y-auto space-y-3 overflow-x-visible">
                        {selectedProducts.map((p) => (
                          <motion.div
                            key={p.id}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-3 relative"
                          >
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-green-700" />
                              </div>

                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-800">
                                  {p.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatPrice(p.salePrice)} c/u
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <motion.button
                                  onClick={() =>
                                    handleUpdateProductQuantity(p.id, -1)
                                  }
                                  disabled={(p.requestedQuantity || 1) <= 1}
                                  className="w-8 h-8 rounded-full bg-emerald-100 text-black flex items-center justify-center disabled:opacity-50 transition-all"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  aria-label="Disminuir cantidad"
                                >
                                  <Minus size={14} />
                                </motion.button>

                                <span className="font-bold text-sm text-gray-800 min-w-[28px] text-center">
                                  {p.requestedQuantity || 1}
                                </span>

                                <motion.button
                                  onClick={() =>
                                    handleUpdateProductQuantity(p.id, 1)
                                  }
                                  disabled={
                                    (p.requestedQuantity || 1) >=
                                    (p.quantity || Infinity)
                                  }
                                  className="w-8 h-8 rounded-full bg-emerald-100 text-black flex items-center justify-center transition-all"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus size={14} />
                                </motion.button>
                              </div>

                              <button
                                onClick={() => handleRemoveProduct(p.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full"
                                aria-label="Eliminar producto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            {/* Selector de razón por producto - fuera del contenedor */}
                            <div className="pl-12 pr-4">
                              <div className="relative">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Motivo de la baja:
                                </label>
                                <div className="flex flex-col gap-2">
                                  {reasonOptions.map((reason) => {
                                    const isSelected =
                                      p.reason === reason.value;
                                    return (
                                      <label
                                        key={reason.value}
                                        className={`flex items-center gap-3 cursor-pointer rounded-lg border p-2 transition select-none
          ${
            isSelected
              ? "border-emerald-500 bg-emerald-50 shadow-sm"
              : "border-gray-200 hover:bg-gray-50"
          }`}
                                      >
                                        {/* input radio oculto */}
                                        <input
                                          type="radio"
                                          name={`reason-${p.id}`}
                                          checked={isSelected}
                                          onChange={() =>
                                            handleProductReasonSelect(
                                              p.id,
                                              reason
                                            )
                                          }
                                          className="hidden"
                                        />

                                        {/* cuadrado con check */}
                                        <div
                                          className={`w-5 h-5 flex items-center justify-center rounded-md border transition
                                            ${
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

                                        {/* texto de la opción */}
                                        <span
                                          className={`text-sm font-medium transition
            ${isSelected ? "text-emerald-700" : "text-gray-700"}`}
                                        >
                                          {reason.label}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>

                                {!p.reason && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Debe seleccionar un motivo para este
                                    producto
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 transition-colors"
                >
                  <Package size={18} />
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RegisterLow;
