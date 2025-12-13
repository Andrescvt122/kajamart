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
import { motion, AnimatePresence } from "framer-motion";
import { exportCategoriesToPDF } from "../../features/categories/helpers/exportToPdf";
import { exportCategoriesToExcel } from "../../features/categories/helpers/exportToXls";
import Loading from "../../features/onboarding/loading.jsx";
import { useCategories } from "../../shared/components/hooks/categories/categories.hooks.js";
import { useAuth } from "../../context/useAtuh.jsx";
// 🔔 Alerts para mostrar mensajes claros
import {
  showLoadingAlert,
  showErrorAlert,
  showSuccessAlert,
} from "../../shared/components/alerts";

// Config columnas
const DESC_COL_CHARS = 30;

// Easing / tiempos
const EXPAND_EASE = [0.22, 1, 0.36, 1];
const EXPAND_DURATION = 0.38;

// Textos seguros
const LONG_TEXT_CLS =
  "whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] hyphens-auto max-w-full overflow-hidden";
const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

// Animaciones (mismas de Proveedores)
const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.12 },
  },
};
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

// Chevron móvil
function ChevronIcon({ open }) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      className="text-gray-500"
    >
      <path
        d="M5.5 7.5l4.5 4 4.5-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

export default function IndexCategories() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { hasPermission } = useAuth();
  const canDelete = hasPermission("Eliminar categorías");
  const canCreate = hasPermission("Crear categorías");
  const canEdit = hasPermission("Editar categorías");
  // Acordeón (móvil/desktop)
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Filtro
  const filtered = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return categories;

    if (/^activos?$/.test(s)) {
      return categories.filter(
        (c) => String(c.estado).toLowerCase() === "activo"
      );
    }
    if (/^inactivos?$/.test(s)) {
      return categories.filter(
        (c) => String(c.estado).toLowerCase() === "inactivo"
      );
    }

    return categories.filter((c) =>
      Object.values(c).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(s)
      )
    );
  }, [categories, searchTerm]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);
  const goToPage = (n) => setCurrentPage(Math.min(Math.max(1, n), totalPages));

  // Helpers para sacar mensaje de error del backend
  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.message ||
    err?.message ||
    fallback ||
    "Ocurrió un error inesperado.";

  // 👉 Crear categoría
  const handleRegisterCategory = async (form) => {
    setCreating(true);
    try {
      showLoadingAlert && showLoadingAlert("Creando categoría...");
      await createCategory(form);
      showSuccessAlert &&
        showSuccessAlert("Categoría creada correctamente.");
      setIsModalOpen(false);
      setCurrentPage(1);
    } catch (err) {
      const msg = getErrorMessage(
        err,
        "Error al crear la categoría."
      );
      showErrorAlert && showErrorAlert(msg);
    } finally {
      setCreating(false);
    }
  };

  // 👉 Eliminar categoría
  const handleDeleteConfirm = async (category) => {
    if (!category) return;

    setDeleting(true);
    try {
      showLoadingAlert && showLoadingAlert("Eliminando categoría...");

      // Ajustar página si se queda sin elementos (solo si la eliminación tiene éxito)
      const afectaListadoActual = filtered.some(
        (c) => c.id_categoria === category.id_categoria
      );
      const newFilteredLength = afectaListadoActual
        ? filtered.length - 1
        : filtered.length;
      const newTotalPages = Math.max(
        1,
        Math.ceil(newFilteredLength / perPage)
      );
      const targetPage =
        currentPage > newTotalPages ? newTotalPages : currentPage;

      await deleteCategory(category.id_categoria);

      showSuccessAlert &&
        showSuccessAlert("Categoría eliminada correctamente.");

      setIsDeleteOpen(false);
      setSelectedCategory(null);

      if (currentPage !== targetPage) setCurrentPage(targetPage);
    } catch (err) {
      // 👇 Aquí, por ejemplo:
      // "No se puede eliminar la categoría porque tiene productos asociados..."
      const msg = getErrorMessage(
        err,
        "Error al eliminar la categoría."
      );
      showErrorAlert && showErrorAlert(msg);
    } finally {
      setDeleting(false);
    }
  };

  // 👉 Guardar edición
  const handleSaveEdit = async (updatedPayload) => {
    setUpdating(true);
    try {
      showLoadingAlert && showLoadingAlert("Actualizando categoría...");
      await updateCategory(updatedPayload);
      showSuccessAlert &&
        showSuccessAlert("Categoría actualizada correctamente.");
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      const msg = getErrorMessage(
        err,
        "Error al actualizar la categoría."
      );
      showErrorAlert && showErrorAlert(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600 text-center">
          {typeof error === "string"
            ? error
            : "Error al cargar categorías."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Fondo decorativo */}
      <div
        className="absolute bottom-0 inset-x-0 w-full pointer-events-none overflow-x-clip"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      >
        <div className="h-full w-full" />
      </div>

      {/* Contenido */}
      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
        <div className="relative z-10 mx-auto w-full max-w-screen-xl min-w-0">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Categorías
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Administrador de Tienda
            </p>
          </div>

          {/* Toolbar */}
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-3">
              {/* Buscar */}
              <div className="min-w-0">
                <SearchBar
                  placeholder="Buscar categorías..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10"
                />
              </div>

              {/* Exportar Excel */}
              <div className="flex justify-end">
                <ExportExcelButton
                  event={() => exportCategoriesToExcel(filtered)}
                >
                  Excel
                </ExportExcelButton>
              </div>

              {/* Exportar PDF */}
              <div className="flex justify-end">
                <ExportPDFButton
                  event={() => exportCategoriesToPDF(filtered)}
                >
                  PDF
                </ExportPDFButton>
              </div>

              {/* Registrar */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "auto" });
                    setIsModalOpen(true);
                  }}
                  className="h-10 px-4 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 w-full sm:w-auto"
                  disabled={creating}
                  hidden={!canCreate}
                >
                  {creating ? "Creando..." : "Registrar Nueva Categoría"}
                </button>
              </div>
            </div>
          </div>

          {/* ====== LISTADO ====== */}

          {/* MÓVIL: lista/accordion */}
          <motion.div
            className="md:hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <Loading inline heightClass="h-28" />
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron categorías.
              </div>
            ) : (
              <motion.ul
                className="space-y-3"
                variants={tableVariants}
                key={`m-${currentPage}-${filtered.length}-${searchTerm}`}
                initial="hidden"
                animate="visible"
              >
                {pageItems.map((c, i) => {
                  const isExpanded = expanded.has(c.id_categoria);
                  const panelId = `panel-${c.id_categoria}`;
                  const desc = c.descripcion || "";

                  return (
                    <motion.li
                      key={c.id_categoria + "-mobile-" + i}
                      variants={rowVariants}
                      className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(c.id_categoria)}
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                                ID {c.id_categoria}
                              </span>
                              <span
                                className={`inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${
                                  c.estado === "Activo"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {c.estado}
                              </span>
                            </div>
                            <p
                              className={
                                "mt-1 text-base font-semibold text-gray-900 " +
                                ONE_LINE_SAFE
                              }
                              title={c.nombre}
                            >
                              {c.nombre}
                            </p>
                          </div>
                          <ChevronIcon open={isExpanded} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            id={panelId}
                            initial={{ height: 0, opacity: 0, y: -4 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -2 }}
                            transition={{
                              duration: EXPAND_DURATION,
                              ease: EXPAND_EASE,
                            }}
                            className="overflow-hidden border-t border-gray-100"
                            aria-live="polite"
                          >
                            <div className="px-4 py-4">
                              <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                Descripción
                              </p>

                              <p
                                className={
                                  LONG_TEXT_CLS +
                                  " mt-1 text-sm text-gray-800"
                                }
                                style={{
                                  wordBreak: "break-word",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {desc || "—"}
                              </p>

                              <div className="mt-4 flex items-center gap-2">
                                <EditButton
                                  canEdit={canEdit}
                                  event={() => {
                                    setSelectedCategory(c);
                                    setIsEditModalOpen(true);
                                  }}
                                  disabled={updating}
                                  aria-label={`Editar categoría ${c.nombre}`}
                                />
                                <DeleteButton
                                  canDelete={canDelete}
                                  event={() => {
                                    setSelectedCategory(c);
                                    setIsDeleteOpen(true);
                                  }}
                                  disabled={deleting}
                                  aria-label={`Eliminar categoría ${c.nombre}`}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </motion.ul>
            )}
          </motion.div>

          {/* DESKTOP: tabla con cascada */}
          <motion.div
            className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto max-w-full">
              <table className="min-w-[720px] lg:min-w-[860px] w-full md:table-fixed">
                <colgroup>
                  <col style={{ width: 120 }} />
                  <col style={{ width: 240 }} />
                  <col style={{ width: `${DESC_COL_CHARS}ch` }} />
                  <col style={{ width: 140 }} />
                  <col style={{ width: 160 }} />
                </colgroup>

                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 lg:px-6 py-3 lg:py-4">
                      ID Categoría
                    </th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Nombre</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Descripción</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Estado</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <motion.tbody
                  key={`d-${currentPage}-${filtered.length}-${searchTerm}`}
                  className="divide-y divide-gray-100"
                  variants={tableVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12">
                        <Loading inline heightClass="h-28" />
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No se encontraron categorías.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((c, i) => {
                      const desc = c.descripcion || "";
                      const isLong = desc.length > DESC_COL_CHARS;
                      const isExpanded = expanded.has(c.id_categoria);

                      return (
                        <motion.tr
                          key={c.id_categoria + "-" + i}
                          className="hover:bg-gray-50 align-top"
                          variants={rowVariants}
                          layout
                        >
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {c.id_categoria}
                          </td>

                          <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="min-w-0 max-w-[28ch] lg:max-w-[34ch] xl:max-w-[42ch]">
                              <div className={ONE_LINE_SAFE} title={c.nombre}>
                                {c.nombre}
                              </div>
                            </div>
                          </td>

                          {/* Descripción con expand/collapse */}
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 align-top">
                            <div
                              style={{ width: `${DESC_COL_CHARS}ch` }}
                              className="max-w-full overflow-hidden"
                            >
                              {!isExpanded && (
                                <div
                                  className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                                  title={desc}
                                  style={{ minWidth: 0 }}
                                >
                                  {desc || "—"}
                                </div>
                              )}

                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="expanded"
                                    initial={{
                                      height: 0,
                                      opacity: 0,
                                      y: -4,
                                    }}
                                    animate={{
                                      height: "auto",
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      height: 0,
                                      opacity: 0,
                                      y: -2,
                                    }}
                                    transition={{
                                      duration: EXPAND_DURATION,
                                      ease: EXPAND_EASE,
                                    }}
                                    className="overflow-hidden"
                                    aria-live="polite"
                                  >
                                    <div
                                      id={`desc-${c.id_categoria}`}
                                      className={
                                        LONG_TEXT_CLS +
                                        " mt-1 text-gray-800 leading-relaxed"
                                      }
                                      style={{
                                        wordBreak: "break-word",
                                        overflowWrap: "anywhere",
                                      }}
                                    >
                                      {desc}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {isLong && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleExpand(c.id_categoria)
                                  }
                                  className="mt-1 block text-xs text-green-700 hover:underline"
                                  aria-expanded={isExpanded}
                                  aria-controls={`desc-${c.id_categoria}`}
                                >
                                  {isExpanded ? "Ocultar" : "Ver detalles"}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="px-4 lg:px-6 py-4">
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

                          <td className="px-4 lg:px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <EditButton
                                canEdit={canEdit}
                                event={() => {
                                  setSelectedCategory(c);
                                  setIsEditModalOpen(true);
                                }}
                                disabled={updating}
                              />
                              <DeleteButton
                                canDelete={canDelete}
                                event={() => {
                                  setSelectedCategory(c);
                                  setIsDeleteOpen(true);
                                }}
                                disabled={deleting}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </motion.tbody>
              </table>
            </div>
          </motion.div>

          {/* Paginador */}
          <div className="mt-4 sm:mt-6">
            <Paginator
              currentPage={currentPage}
              perPage={perPage}
              totalPages={totalPages}
              filteredLength={filtered.length}
              goToPage={goToPage}
            />
          </div>
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
