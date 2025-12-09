import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, CheckCircle, AlertTriangle } from "lucide-react";
import ProductSearchSelect from "../../../../shared/components/searchBars/productSearchSelect";
import ProductRegisterModal from "../../../products/productRegisterModal";
import ProductRegistrationModal from "../../returnProduct/modals/register/ProductRegistrationModal";
import { usePostDetailProduct } from "../../../../shared/components/hooks/productDetails/usePostDetailProduct";
const UnitTransferProductModal = ({
  isOpen,
  onClose,
  onConfirmDestination,
  currentBoxProductName, // opcional para mostrar contexto
}) => {
  const isReturnModal = false;
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [error, setError] = useState("");
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isDetailRegistrationOpen, setIsDetailRegistrationOpen] =
    useState(false);

  const [createdProduct, setCreatedProduct] = useState(null); // producto base creado
  const [existingBarcodes, setExistingBarcodes] = useState([]); // opcional, si lo usas
  const { postDetailProduct } = usePostDetailProduct();

  const handlePickDestination = (detalleProducto) => {
    setSelectedDestination(detalleProducto);
    setError("");
  };

  const handleConfirm = () => {
    if (!selectedDestination) {
      setError("Selecciona el producto (unidad) destino del traslado.");
      return;
    }
    console.log("DESTINO ENVIADO A REGISTERLOW:", selectedDestination);
    onConfirmDestination(selectedDestination);
    setSelectedDestination(null);
    setError("");
    onClose(); // <- esto es clave
  };

  const handleClose = () => {
    setSelectedDestination(null);
    setError("");
    onClose();
  };
  console.log("si", createdProduct);
  const adaptedCreatedForRegistration = createdProduct
    ? {
        id_producto:
          createdProduct.id_producto ?? createdProduct.productos?.id_producto,
        productos: {
          nombre: createdProduct.nombre ?? createdProduct.productos?.nombre,
          precio_venta:
            createdProduct.precio_venta ??
            createdProduct.productos?.precio_venta ??
            0,
        },
      }
    : null;
  console.log(adaptedCreatedForRegistration);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[51] p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  <Package className="w-5 h-5 text-green-600" />
                  Seleccionar producto destino (unidad)
                </h2>

                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                {currentBoxProductName && (
                  <p className="text-sm text-gray-600">
                    Traslado desde:{" "}
                    <span className="font-semibold text-gray-800">
                      {currentBoxProductName}
                    </span>
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  Busca el producto “unidad suelta” al que se le incrementará
                  stock cuando el motivo sea{" "}
                  <span className="font-semibold">venta unitaria</span>.
                </p>

                {/* Buscador existente */}
                <ProductSearchSelect
                  onSelect={(detalle) => {
                    setSelectedDestination(detalle);
                    setError("");
                  }}
                  onCreateProduct={() => setIsCreateProductOpen(true)}
                />

                {/* Preview seleccionado */}
                {selectedDestination && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Seleccionado:
                        <span className="ml-2 text-gray-900">
                          {selectedDestination?.productos?.nombre}
                        </span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        id_detalle_producto:{" "}
                        <span className="font-semibold">
                          {selectedDestination?.id_detalle_producto}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDestination(null)}
                      className="px-3 py-2 text-xs rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition"
                    >
                      Cambiar
                    </button>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-white px-6 py-4 flex gap-4 border-t border-gray-200 rounded-b-2xl">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-black hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Confirmar destino
                </button>
              </div>
            </motion.div>
          </motion.div>
          <ProductRegisterModal
            isOpen={isCreateProductOpen}
            onClose={() => setIsCreateProductOpen(false)}
            onCreated={(newProduct) => {
              // 1) guardar producto creado
              setCreatedProduct(newProduct);

              // 2) cerrar modal de creación
              setIsCreateProductOpen(false);

              // 3) abrir modal de registro de detalle
              setIsDetailRegistrationOpen(true);
            }}
          />
          <ProductRegistrationModal
            isOpen={isDetailRegistrationOpen}
            onClose={() => setIsDetailRegistrationOpen(false)}
            onCancelRegistration={() => {
              setIsDetailRegistrationOpen(false);
              setCreatedProduct(null);
            }}
            product={adaptedCreatedForRegistration}
            isReturnProduct={false}
            existingBarcodes={[]}
            onConfirm={(createdDetail) => {
              // el modal puede llamarte con createdDetail (si posteó internamente)
              setSelectedDestination(createdDetail);
              setError("");
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default UnitTransferProductModal;
