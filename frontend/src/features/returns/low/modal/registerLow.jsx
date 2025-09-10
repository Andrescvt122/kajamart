import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ClipboardList, Package } from "lucide-react";
import ProductSearch from "../../../../shared/components/searchBars/productSearch";

const RegisterLow = ({ isOpen, onClose, onConfirm }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reason, setReason] = useState("");

  const handleAddProduct = (product) => {
    // ProductSearch devuelve el producto ya con requestedQuantity
    setSelectedProduct(product);
  };

  const handleConfirm = () => {
    if (!selectedProduct || !reason) {
      alert("Selecciona producto y motivo");
      return;
    }
    onConfirm({ ...selectedProduct, reason });
    setSelectedProduct(null);
    setReason("");
    onClose();
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
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative p-6 space-y-6"
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
                {/* Aquí ya se ve como las imágenes 2 y 3 */}
                <ProductSearch onAddProduct={handleAddProduct} />

                {/* Dropdown motivos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Seleccione un motivo...</option>
                    <option value="Superó fecha de vencimiento">
                      Superó fecha de vencimiento
                    </option>
                    <option value="Producto dañado">Producto dañado</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
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
