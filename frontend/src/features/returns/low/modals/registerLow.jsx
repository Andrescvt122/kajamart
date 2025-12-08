import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ClipboardList,
  Package,
  Trash2,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ProductSearch from "../../../../shared/components/searchBars/productSearch";
import { usePostLowProducts } from "../../../../shared/components/hooks/lowProducts/usePostLowProducts";
import UnitTransferProductModal from "./UnitTransferProductModal";

const RegisterLow = ({ isOpen, onClose, onConfirm }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productReasonDropdowns, setProductReasonDropdowns] = useState({});
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [openConfigProductId, setOpenConfigProductId] = useState(null);
  const [isUnitTransferModalOpen, setIsUnitTransferModalOpen] = useState(false);
  const [activeUnitTransferProductId, setActiveUnitTransferProductId] =
    useState(null);

  const toggleConfigDropdown = (productId) => {
    setOpenConfigProductId((prev) => (prev === productId ? null : productId));
  };

  const { postLowProducts, loading } = usePostLowProducts();
  const id_responsable = 1;

  const reasonOptions = [
    { value: "vencido", label: "Superó fecha de vencimiento" },
    { value: "dañado", label: "Producto dañado" },
    { value: "venta unitaria", label: "Venta unitaria" },
    { value: "requerido personal", label: "Requerido personal" },
  ];

  const handleAddProduct = (product) => {
    const adaptedProduct = {
      id: product.id_detalle_producto,
      name: product.productos?.nombre || "Sin nombre",
      quantity: product.stock_producto || 0,
      salePrice: product.productos?.precio_venta || 0,
      requestedQuantity: 1,
      unitCost: product.productos?.costo_unitario || 0,
      cantidad_unitaria: product?.productos?.cantidad_unitaria ?? null,
      reason: "",
    };
    setSelectedProducts((prev) => [...prev, adaptedProduct]);
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    if (openConfigProductId === id) setOpenConfigProductId(null);
  };

  const handleUpdateProductQuantity = (id, delta) =>
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              requestedQuantity: Math.max(
                1,
                Math.min(p.quantity, (p.requestedQuantity || 1) + delta)
              ),
            }
          : p
      )
    );

  const handleProductReasonSelect = (productId, reason) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, reason } : p))
    );

    // Si el motivo es venta unitaria, abre modal para elegir producto destino
    if (reason === "venta unitaria") {
      setActiveUnitTransferProductId(productId);
      setIsUnitTransferModalOpen(true);
    } else {
      // si cambia a otro motivo, limpiamos campos de traslado por seguridad
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, id_producto_traslado: null, cantidad_traslado: null }
            : p
        )
      );
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);

  // 🔹 Paso 1: Mostrar alerta de confirmación
  const handleConfirmLow = () => {
    if (selectedProducts.length === 0)
      return alert("Selecciona al menos un producto.");
    if (selectedProducts.some((p) => !p.reason))
      return alert("Todos los productos deben tener un motivo de baja.");
    const invalidUnitSale = selectedProducts.some(
      (p) =>
        p.reason === "venta unitaria" &&
        (p.id_producto_traslado == null || p.cantidad_traslado == null)
    );

    if (invalidUnitSale) {
      alert(
        "Para 'venta unitaria' debes seleccionar el producto destino y el producto caja debe tener cantidad_unitaria."
      );
      return;
    }
    setShowConfirmAlert(true);
  };

  // 🔹 Paso 2: Cancelar alerta
  const handleCancelAlert = () => setShowConfirmAlert(false);

  // 🔹 Paso 3: Confirmar alerta → Enviar POST y mostrar éxito
  const handleAcceptAlert = async () => {
    setShowConfirmAlert(false);
    const response = await postLowProducts(id_responsable, selectedProducts);
    if (response) {
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setSelectedProducts([]);
        onClose();
        onConfirm();
      }, 2500);
    }
  };

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
            className="fixed inset-0 flex items-center justify-center z-50 p-4 "
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <ClipboardList className="w-5 h-5 text-green-600" />
                  Registrar Baja de Productos
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido */}
              <div className="flex flex-col p-6 space-y-4 flex-grow max-h-[70vh]">
                <ProductSearch onAddProduct={handleAddProduct} />

                {selectedProducts.length > 0 && (
                  <div
                    className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 
                 flex-1 overflow-y-auto max-h-[45vh] space-y-2 pr-2 custom-scroll"
                  >
                    {selectedProducts.map((p) => (
                      <motion.div
                        key={p.id}
                        className="flex flex-col gap-3 bg-gray-50 p-3 rounded-lg"
                        layout
                      >
                        {/* Producto */}
                        <div className="flex items-center gap-4">
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
                              className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Minus size={14} />
                            </motion.button>

                            <span className="font-bold text-sm text-gray-800">
                              {p.requestedQuantity}
                            </span>

                            <motion.button
                              onClick={() =>
                                handleUpdateProductQuantity(p.id, 1)
                              }
                              className="w-7 h-7 rounded-full bg-emerald-100 text-black flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>

                          {/* Botón dropdown estilo ProductReturnModal */}
                          <button
                            type="button"
                            onClick={() => toggleConfigDropdown(p.id)}
                            className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full hover:bg-emerald-100 transition"
                          >
                            Opciones
                            {openConfigProductId === p.id ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </button>

                          <button
                            onClick={() => handleRemoveProduct(p.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Dropdown por producto: Motivos */}
                        <AnimatePresence>
                          {openConfigProductId === p.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 border-t pt-3 space-y-3 pl-12"
                            >
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                Motivo de baja
                              </p>

                              <div className="space-y-2">
                                {reasonOptions.map((r) => {
                                  const isSelected = p.reason === r.value;

                                  return (
                                    <label
                                      key={r.value}
                                      className={`flex items-center gap-3 cursor-pointer rounded-lg border p-2 transition-all select-none ${
                                        isSelected
                                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                          : "border-gray-200 hover:bg-gray-50"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={`reason-${p.id}`}
                                        checked={isSelected}
                                        onChange={() =>
                                          handleProductReasonSelect(
                                            p.id,
                                            r.value
                                          )
                                        }
                                        className="hidden"
                                      />

                                      <div
                                        className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all ${
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

                                      <span
                                        className={`text-sm font-medium ${
                                          isSelected
                                            ? "text-emerald-700"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {r.label}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <motion.div className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-black hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleConfirmLow}
                  disabled={loading}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                >
                  <CheckCircle size={18} />
                  Confirmar Baja
                </motion.button>
              </motion.div>

              {/* 🔸 Alerta de confirmación */}
              <AnimatePresence>
                {showConfirmAlert && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center text-center p-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <AlertTriangle className="text-yellow-500 w-14 h-14 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      ¿Estás seguro de darle de baja a los productos?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Será un cambio{" "}
                      <span className="font-semibold text-red-500">
                        irreversible
                      </span>
                      .
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelAlert}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                      >
                        Cancelar
                      </button>
                      <motion.button
                        onClick={handleAcceptAlert}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <CheckCircle size={18} />
                        Confirmar
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 🔹 Animación de éxito */}
              <AnimatePresence>
                {showSuccessMessage && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-2xl flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <motion.div
                      className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                    >
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      ¡Baja confirmada!
                    </h3>
                    <p className="text-gray-600">
                      Los productos fueron dados de baja exitosamente.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <UnitTransferProductModal
              isOpen={isUnitTransferModalOpen}
              onClose={() => {
                // Si se cierra el modal, deselecciona "venta unitaria" del producto activo
                if (activeUnitTransferProductId != null) {
                  setSelectedProducts((prev) =>
                    prev.map((p) =>
                      p.id === activeUnitTransferProductId
                        ? {
                            ...p,
                            reason: "", // <- deselecciona venta unitaria
                            id_producto_traslado: null,
                            cantidad_traslado: null,
                          }
                        : p
                    )
                  );
                }

                setIsUnitTransferModalOpen(false);
                setActiveUnitTransferProductId(null);
              }}
              currentBoxProductName={
                selectedProducts.find(
                  (p) => p.id === activeUnitTransferProductId
                )?.name
              }
              onConfirmDestination={(detalleDestino) => {
                setSelectedProducts((prev) =>
                  prev.map((p) => {
                    if (p.id !== activeUnitTransferProductId) return p;

                    return {
                      ...p,
                      id_producto_traslado: detalleDestino.id_detalle_producto,
                      // ✅ cantidad_traslado = cantidad_unitaria de la caja
                      cantidad_traslado: p.cantidad_unitaria ?? null,
                    };
                  })
                );

                setIsUnitTransferModalOpen(false);
                setActiveUnitTransferProductId(null);
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RegisterLow;
