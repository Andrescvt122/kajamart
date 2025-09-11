import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Paginator from "../../shared/components/paginator.jsx";

export default function SupplierDetailModal({ isOpen, onClose, supplier }) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const safeSupplier = supplier || {
    nombre: "",
    nit: "",
    tipoPersona: "",
    telefono: "",
    correo: "",
    direccion: "",
    productos: [],
  };
  const products = safeSupplier.productos || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [safeSupplier.nit]);

  const totalPages = Math.max(1, Math.ceil(products.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return products.slice(start, start + perPage);
  }, [products, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // Variantes de animación
  const overlayVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const modalVars = {
    hidden: { opacity: 0, y: -40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 20, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      y: 40,
      scale: 0.95,
      transition: { duration: 0.35 },
    },
  };

  // Variantes para filas de la tabla
  const rowVars = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    isOpen && (
      <motion.div
        key="overlay-container"
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVars}
        onClick={onClose}
      >
        {/* Overlay de fondo */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          variants={overlayVars}
        />

        {/* Modal */}
        <motion.div
          key="modal"
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6 z-10"
          variants={modalVars}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Detalles del Proveedor
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Información completa del proveedor
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              className="rounded-full p-2 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500">Nombre</p>
              <p className="font-medium">
                {safeSupplier.nombre || "— Ej: Distribuidora El Sol"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">NIT</p>
              <p className="font-medium">{safeSupplier.nit || "123456789"}</p>
            </div>
            <div>
              <p className="text-gray-500">Tipo de persona</p>
              <p className="font-medium">
                {safeSupplier.tipoPersona || "Jurídica"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Teléfono</p>
              <p className="font-medium">
                {safeSupplier.telefono || "+57 300 000 0000"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Correo electrónico</p>
              <p className="font-medium">
                {safeSupplier.correo || "contacto@ejemplo.com"}
              </p>
            </div>
            <div className="md:col-span-3">
              <p className="text-gray-500">Dirección</p>
              <p className="font-medium">
                {safeSupplier.direccion || "Cra 10 #20-30, Bogotá"}
              </p>
            </div>
          </div>

          {/* Tabla productos */}
          <h3 className="text-lg font-semibold mb-4">
            Productos Suministrados
          </h3>
          <div className="bg-gray-50 rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Precio Unitario</th>
                  <th className="px-6 py-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="wait" initial={false}>
                    {pageItems.map((p, i) => (
                      <motion.tr
                        key={currentPage + "-" + i} 
                        className="hover:bg-white"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{
                          duration: 0.3,
                          delay: i * 0.08, 
                        }}
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          {p.nombre}
                        </td>
                        <td className="px-6 py-3 text-sm text-green-700">
                          {p.categoria}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          ${Number(p.precio || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {p.stock ?? "-"}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          <div className="mt-4">
            <Paginator
              currentPage={currentPage}
              perPage={perPage}
              totalPages={totalPages}
              filteredLength={products.length}
              goToPage={goToPage}
            />
          </div>

          {/* Footer con solo Editar */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                console.log("Editar proveedor:", safeSupplier);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Editar
            </button>
          </div>
        </motion.div>
      </motion.div>
    ),
    document.body
  );
}
