// SupplierDetailModal.jsx
import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Paginator from "../../shared/components/paginator.jsx";
import { Search } from "lucide-react";

export default function SupplierDetailModal({
  isOpen,
  onClose,
  supplier,
  onEdit,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  // buscador dentro del modal
  const [searchTerm, setSearchTerm] = useState("");
  // mostrar panel de categorias
  const [showCategories, setShowCategories] = useState(false);

  const safeSupplier = supplier || {
    nombre: "",
    nit: "",
    tipoPersona: "",
    telefono: "",
    correo: "",
    direccion: "",
    productos: [],
    categorias: [],
  };
  const products = safeSupplier.productos || [];

  // derivar categorías: si el objeto trae `categorias` úsalo, si no, saca desde productos
  const categories = useMemo(() => {
    if (
      Array.isArray(safeSupplier.categorias) &&
      safeSupplier.categorias.length > 0
    ) {
      // normalizar a strings (puede venir como objetos)
      return Array.from(
        new Set(
          safeSupplier.categorias
            .map((c) => (typeof c === "string" ? c : c.nombre || "").trim())
            .filter(Boolean)
        )
      );
    }
    return Array.from(
      new Set(
        products.map((p) => String(p.categoria || "").trim()).filter(Boolean)
      )
    );
  }, [safeSupplier.categorias, products]);

  useEffect(() => {
    // reset páginas y buscador cuando cambia el proveedor
    setCurrentPage(1);
    setSearchTerm("");
    setShowCategories(false);
  }, [safeSupplier.nit]);

  // Filtrado de productos por searchTerm (nombre, categoría, precio, stock)
  const filteredProducts = useMemo(() => {
    const s = (searchTerm || "").trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      const name = String(p.nombre || "").toLowerCase();
      const cat = String(p.categoria || "").toLowerCase();
      const price = String(p.precio ?? "").toLowerCase();
      const stock = String(p.stock ?? "").toLowerCase();
      return (
        name.includes(s) ||
        cat.includes(s) ||
        price.includes(s) ||
        stock.includes(s)
      );
    });
  }, [products, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredProducts.slice(start, start + perPage);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    // if currentPage > totalPages because filtering shrank results, clamp it
    setCurrentPage((p) => Math.min(p, Math.max(1, totalPages)));
  }, [totalPages]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // Animations
  const overlayVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.22 } },
    exit: { opacity: 0, transition: { duration: 0.22 } },
  };

  const modalVars = {
    hidden: { opacity: 0, y: -24, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", damping: 22, stiffness: 300 },
    },
    exit: { opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.2 } },
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
        {/* Overlay */}
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
          {/* Header + buscador + ver categorias */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Detalles del Proveedor
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Información completa del proveedor
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* cerrar */}
              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="rounded-full p-2 hover:bg-gray-100 ml-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Info general */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-500">NIT</p>
              <p className="font-medium">{safeSupplier.nit || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Nombre</p>
              <p className="font-medium">{safeSupplier.nombre || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Tipo de persona</p>
              <p className="font-medium">{safeSupplier.tipoPersona || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Teléfono</p>
              <p className="font-medium">{safeSupplier.telefono || "—"}</p>
            </div>
            <div>
              <p className="text-gray-500">Correo electrónico</p>
              <p className="font-medium">{safeSupplier.correo || "—"}</p>
            </div>

            <div>
              <p className="text-gray-500">Dirección</p>
              <p className="font-medium">{safeSupplier.direccion || "—"}</p>
            </div>

            {/* botón ver categorías */}
            <div>
              <button
                type="button"
                onClick={() => setShowCategories((s) => !s)}
                className="px-4 py-2 rounded-full bg-white text-sm text-gray-800 font-medium
             border border-transparent hover:bg-gray-50 focus:outline-none transition"
                style={{ boxShadow: "0 0 0 1px rgba(17,24,39,0.12)" }}
                aria-expanded={showCategories}
              >
                {showCategories
                  ? "Ocultar categorías"
                  : `Ver categorías (${categories.length})`}
              </button>
            </div>
          </div>
          {/* buscador pequeño */}
          <div className="relative flex-1 sm:flex-none w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-3 py-2 w-full rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* Panel de categorías (colapsable) */}
          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-gray-50 rounded-lg border border-gray-100 p-4">
                  <h4 className="text-sm font-semibold mb-2">
                    Categorías del proveedor
                  </h4>
                  {categories.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No tiene categorías asignadas.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c, idx) => (
                        <span
                          key={c + "-" + idx}
                          className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Productos */}
          <h3 className="text-lg font-semibold mb-3">
            Productos Suministrados
          </h3>
          <div className="bg-gray-50 rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-3">Producto</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Costo Unitario</th>
                  <th className="px-6 py-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
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
                        key={p.nombre + "-" + i + "-" + currentPage}
                        className="hover:bg-white"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.24, delay: i * 0.03 }}
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
              filteredLength={filteredProducts.length}
              goToPage={goToPage}
            />
          </div>

          {/* Footer: editar */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                // cerrar detalle y delegar la edición al padre (si lo requiere)
                if (onEdit) onEdit(safeSupplier);
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
