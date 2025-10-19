// pages/categories/IndexCategories.jsx
import React, { useMemo, useState } from "react";
import {
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator";
import CategoryDetailModal from "./CategoryDetailModal";
import CategoryEditModal from "./CategoryEditModal";
import CategoryDeleteModal from "./CategoryDeleteModal";
import SearchBar from "../../shared/components/searchBars/searchbar";
import CategoryRegisterModal from "./CategoryRegisterModal";
import { motion } from "framer-motion"; // 👈 igual que en productos (sin AnimatePresence)
import Swal from "sweetalert2";
import { exportCategoriesToPDF } from "../../features/categories/helpers/exportToPdf";
import { exportCategoriesToExcel } from "../../features/categories/helpers/exportToXls";

// Hooks personalizados
import { useCategories } from "../../shared/components/hooks/categories/useCategories";
import { useCreateCategory } from "../../shared/components/hooks/categories/useCreateCategories";
import { useDeleteCategory } from "../../shared/components/hooks/categories/useDeleteCategories";
import { useUpdateCategory } from "../../shared/components/hooks/categories/useUpdateCategories";

export default function IndexCategories() {
  // Hooks de datos
  const {
    categories,
    loading,
    error,
    refresh,
    addLocal,
    updateLocal,
    removeLocal,
  } = useCategories();

  const { createCategory, creating } = useCreateCategory({
    onCreated: addLocal,
  });

  const { deleteCategory, deleting } = useDeleteCategory({
    onDeleted: removeLocal,
  });

  const { updateCategory, updating } = useUpdateCategory({
    onUpdated: updateLocal,
  });

  // Estado UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FILTRO
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return categories;
    if (/^activos?$/.test(s)) {
      return categories.filter((c) => c.estado.toLowerCase() === "activo");
    }
    if (/^inactivos?$/.test(s)) {
      return categories.filter((c) => c.estado.toLowerCase() === "inactivo");
    }
    return categories.filter((c) =>
      Object.values(c).some((value) => String(value).toLowerCase().includes(s))
    );
  }, [categories, searchTerm]);

  // PAGINACIÓN
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // REGISTRAR
  const handleRegisterCategory = async (form) => {
    try {
      await createCategory(form);
      setIsModalOpen(false);
      setCurrentPage(1);
    } catch {
      /* errores ya gestionados */
    }
  };

  // ELIMINAR (con corrección de paginación; animación idéntica a productos: sin exit)
  const handleDeleteConfirm = async (category) => {
    try {
      const afectaListadoActual = filtered.some(
        (c) => c.id_categoria === category.id_categoria
      );
      const newFilteredLength = afectaListadoActual
        ? filtered.length - 1
        : filtered.length;
      const newTotalPages = Math.max(1, Math.ceil(newFilteredLength / perPage));
      const targetPage =
        currentPage > newTotalPages ? newTotalPages : currentPage;

      await deleteCategory(category);

      setIsDeleteOpen(false);
      setSelectedCategory(null);

      if (currentPage !== targetPage) setCurrentPage(targetPage);
    } catch {
      /* errores ya gestionados */
    }
  };

  // EDITAR
  const handleSaveEdit = async (updatedPayload) => {
    try {
      await updateCategory(updatedPayload);
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch {
      /* errores ya gestionados */
    }
  };

  // ─────────── ANIMACIONES (copiadas de indexProducts.jsx) ───────────
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen">
      {/* Fondo decorativo (igual que en productos) */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.15)",
          zIndex: 0,
        }}
      />

      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Categorías</h2>
              <p className="text-sm text-gray-500 mt-1">Administrador de Tienda</p>
            </div>
          </div>

          {/* Barra búsqueda + acciones */}
          <div className="flex justify-between items-center mb-6 gap-4">
            <div className="flex-grow">
              <SearchBar
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton event={() => exportCategoriesToExcel(filtered)}>
                Excel
              </ExportExcelButton>
              <ExportPDFButton event={() => exportCategoriesToPDF(filtered)}>
                PDF
              </ExportPDFButton>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "auto" });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                disabled={creating}
              >
                {creating ? "Creando..." : "Registrar Nueva Categoría"}
              </button>
            </div>
          </div>

          {/* Tabla categorías (misma animación que productos) */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <table key={currentPage} className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">ID Categoría</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-gray-100"
                variants={tableVariants}
              >
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No se encontraron categorías.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((c, i) => (
                    <motion.tr
                      key={c.id_categoria + "-" + i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{c.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {c.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {c.descripcion}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full ${
                            c.estado === "Activo"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {c.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <EditButton
                            event={() => {
                              setSelectedCategory(c);
                              setIsEditModalOpen(true);
                            }}
                            disabled={updating}
                          />
                          <DeleteButton
                            event={() => {
                              setSelectedCategory(c);
                              setIsDeleteOpen(true);
                            }}
                            disabled={deleting}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </motion.div>

          {/* Paginador */}
          <Paginator
            currentPage={currentPage}
            perPage={perPage}
            totalPages={totalPages}
            filteredLength={filtered.length}
            goToPage={goToPage}
          />
        </div>
      </div>

      {/* Modales */}
      <CategoryDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />

      <CategoryEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={selectedCategory}
        onSave={handleSaveEdit}
      />

      <CategoryDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
        category={selectedCategory}
      />

      <CategoryRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegister={handleRegisterCategory}
      />
    </div>
  );
}
