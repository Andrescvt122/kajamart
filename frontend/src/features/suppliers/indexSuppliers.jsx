import React, { useMemo, useState, useEffect } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons.jsx";
import ondas from "../../assets/ondasHorizontal.png";
import Paginator from "../../shared/components/paginator.jsx";
import SupplierDetailModal from "./SuplliersDetailModal.jsx";
import SuppliersEditModal from "./SuplliersEditModal.jsx";
import { motion, AnimatePresence } from "framer-motion";
import SuplliersRegisterModal from "./SuplliersRegisterModal.jsx";
import SuppliersDeleteModal from "./SuplliersDeleteModal.jsx";
import Swal from "sweetalert2";
import {
  showLoadingAlert,
  showErrorAlert,
} from "../../shared/components/alerts.jsx";
import { exportSuppliersToExcel } from "./helpers/exportToXls";
import { exportSuppliersToPDF } from "./helpers/exportToPdf";
import SearchBar from "../../shared/components/searchBars/searchbar";
import Loading from "../../features/onboarding/loading.jsx";

// Hooks de proveedores (backend real)
import {
  useSuppliers as useSuppliersQuery,
  useDeleteSupplier,
} from "../../shared/components/hooks/suppliers/suppliers.hooks.js";

// ==== utilidades de layout/texto ultra-responsive ====
const LONG_TEXT_CLS =
  "whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] hyphens-auto max-w-full overflow-hidden";
const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

// Animaciones
const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

// Chevron acordeón móvil
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

export default function IndexSuppliers() {
  // === CARGA DESDE BACKEND ===
  const {
    data: suppliersRaw = [],
    isLoading,
    isError,
    error,
  } = useSuppliersQuery();

  // Mapeo para UI
  const suppliers = useMemo(() => {
    if (!Array.isArray(suppliersRaw)) return [];
    return suppliersRaw.map((s) => ({
      ...s,
      nit: s?.nit != null ? String(s.nit) : "",
      estado: s?.estado ? "Activo" : "Inactivo",
      categorias: Array.isArray(s?.categorias) ? s.categorias : [],
    }));
  }, [suppliersRaw]);

  const deleteMutation = useDeleteSupplier();

  // Estado de modales
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplierToDelete, setSelectedSupplierToDelete] =
    useState(null);

  const handleDeleteConfirm = (supplier) => {
    const id = supplier?.id_proveedor;
    if (!id) {
      showErrorAlert && showErrorAlert("No se encontró id_proveedor.");
      return;
    }

    showLoadingAlert("Eliminando proveedor...");
    deleteMutation.mutate(id, {
      onSuccess: () => {
        try {
          Swal.close();
        } catch (_) {}
        Swal.fire({
          icon: "success",
          title: "Proveedor eliminado",
          text: `${supplier?.nombre} se eliminó correctamente.`,
          background: "#e8f5e9",
          color: "#1b5e20",
          showConfirmButton: false,
          timer: 1800,
          timerProgressBar: true,
        });
        setIsDeleteModalOpen(false);
        setSelectedSupplierToDelete(null);
      },
      onError: (err) => {
        try {
          Swal.close();
        } catch (_) {}
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Error al eliminar el proveedor.";
        showErrorAlert && showErrorAlert(msg);
      },
    });
  };

  const handleDeleteClick = (supplier) => {
    setSelectedSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  // Bloquear scroll cuando el modal de detalles está abierto
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = isDetailOpen
      ? "hidden"
      : originalOverflow || "auto";
    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [isDetailOpen]);

  // Buscador + paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // Modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalizador
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Helper: nombres de categorías del proveedor
  const getSupplierCategoryNames = (s) => {
    if (!s || !Array.isArray(s.categorias)) return [];
    return s.categorias.map((c) => c?.nombre_categoria).filter(Boolean);
  };

  // Filtro
  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return suppliers;

    if (/^activos?$/.test(s)) {
      return suppliers.filter(
        (p) => normalizeText(String(p.estado)) === "activo"
      );
    }
    if (/^inactivos?$/.test(s)) {
      return suppliers.filter(
        (p) => normalizeText(String(p.estado)) === "inactivo"
      );
    }

    return suppliers.filter((p) => {
      const inSupplier = Object.entries(p).some(([key, value]) => {
        if (key === "categorias") return false;
        return normalizeText(String(value ?? "")).includes(s);
      });
      if (inSupplier) return true;

      const catNames = getSupplierCategoryNames(p).map((n) => normalizeText(n));
      return catNames.some((name) => name.includes(s));
    });
  }, [suppliers, searchTerm]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // Acordeón (móvil)
  const [expanded, setExpanded] = useState(new Set());
  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // === Error global ===
  if (isError) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Error al cargar proveedores.";
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600 text-center">{msg}</p>
      </div>
    );
  }

  return (
    // ⬇️ Nunca permitir overflow horizontal global
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Fondo decorativo, sin empujar ancho */}
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

      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
        <div className="relative z-10 mx-auto w-full max-w-screen-xl min-w-0">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">Proveedores</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Administrador de tienda
            </p>
          </div>

          {/* Barra de búsqueda + acciones (alineada) */}
          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-3">
              {/* Buscar (se estira) */}
              <div className="min-w-0">
                <SearchBar
                  placeholder="Buscar proveedores..."
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
                  event={() => exportSuppliersToExcel(filtered)}
                >
                  Excel
                </ExportExcelButton>
              </div>

              {/* Exportar PDF */}
              <div className="flex justify-end">
                <ExportPDFButton event={() => exportSuppliersToPDF(filtered)}>
                  PDF
                </ExportPDFButton>
              </div>

              {/* Registrar */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="h-10 px-4 rounded-full bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                >
                  Registrar Nuevo Proveedor
                </button>
              </div>
            </div>
          </div>

          {/* ====== LISTADO RESPONSIVE ====== */}

          {/* Móvil: tarjetas / acordeón */}
          <motion.div
            className="md:hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <Loading inline heightClass="h-28" />
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron proveedores.
              </div>
            ) : (
              <motion.ul className="space-y-3" variants={tableVariants}>
                {pageItems.map((s, i) => {
                  const isOpen = expanded.has(s.id_proveedor ?? s.nit ?? i);
                  const pid = `sup-${s.id_proveedor ?? s.nit ?? i}`;
                  const catNames = getSupplierCategoryNames(s);
                  const displayCats =
                    catNames.length === 0
                      ? "—"
                      : catNames.length <= 2
                      ? catNames.join(", ")
                      : `${catNames.slice(0, 2).join(", ")} +${
                          catNames.length - 2
                        }`;

                  return (
                    <motion.li
                      key={(s.id_proveedor ?? s.nit ?? i) + "-m"}
                      variants={rowVariants}
                      className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleExpand(s.id_proveedor ?? s.nit ?? i)
                        }
                        aria-expanded={isOpen}
                        aria-controls={pid}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                                NIT {s.nit || "—"}
                              </span>
                              <span
                                className={`inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${
                                  s.estado === "Activo"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {s.estado}
                              </span>
                            </div>
                            <p
                              className={
                                "mt-1 text-base font-semibold text-gray-900 " +
                                ONE_LINE_SAFE
                              }
                              title={s.nombre}
                            >
                              {s.nombre || "—"}
                            </p>
                          </div>
                          <ChevronIcon open={isOpen} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={pid}
                            initial={{ height: 0, opacity: 0, y: -4 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -2 }}
                            transition={{
                              duration: 0.32,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="overflow-hidden border-t border-gray-100"
                            aria-live="polite"
                          >
                            <div className="px-4 py-4 space-y-2">
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Teléfono
                                </p>
                                <p className="text-sm text-gray-800">
                                  {s.telefono || "—"}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Categorías
                                </p>
                                <p
                                  className={
                                    "text-sm text-gray-800 " + LONG_TEXT_CLS
                                  }
                                >
                                  {displayCats}
                                </p>
                              </div>

                              <div className="pt-2 flex items-center gap-2">
                                <ViewButton
                                  event={() => {
                                    setSelectedSupplier(s);
                                    setIsDetailOpen(true);
                                  }}
                                />
                                <EditButton
                                  event={() => {
                                    setSelectedSupplier(s);
                                    setIsEditOpen(true);
                                  }}
                                />
                                <DeleteButton
                                  event={() => handleDeleteClick(s)}
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

          {/* Desktop: tabla con scroll horizontal si hace falta */}
          <motion.div
            className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto max-w-full">
              <table className="min-w-[720px] lg:min-w-[860px] w-full md:table-fixed">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 lg:px-6 py-3 lg:py-4">NIT</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Nombre</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Teléfono</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Categorías</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Estado</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <motion.tbody
                  className="divide-y divide-gray-100"
                  variants={tableVariants}
                >
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12">
                        <Loading inline heightClass="h-28" />
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No se encontraron proveedores.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((s, i) => {
                      const catNames = getSupplierCategoryNames(s);
                      const displayCats =
                        catNames.length === 0
                          ? "—"
                          : catNames.length <= 2
                          ? catNames.join(", ")
                          : `${catNames.slice(0, 2).join(", ")} +${
                              catNames.length - 2
                            }`;

                      return (
                        <motion.tr
                          key={(s.id_proveedor ?? s.nit ?? i) + "-" + i}
                          className="hover:bg-gray-50 align-top"
                          variants={rowVariants}
                        >
                          <td className="px-4 lg:px-6 py-4 align-top text-sm text-gray-600 whitespace-nowrap">
                            {s.nit ?? "—"}
                          </td>

                          <td className="px-4 lg:px-6 py-4 align-top text-sm font-medium text-gray-900">
                            {/* Nombre a prueba de largos */}
                            <div className="min-w-0 max-w-[28ch] lg:max-w-[34ch] xl:max-w-[42ch]">
                              <div className={ONE_LINE_SAFE} title={s.nombre}>
                                {s.nombre ?? "—"}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 lg:px-6 py-4 align-top text-sm text-gray-600 whitespace-nowrap">
                            {s.telefono ?? "—"}
                          </td>

                          <td className="px-4 lg:px-6 py-4 align-top text-sm text-gray-700">
                            <div className={LONG_TEXT_CLS}>{displayCats}</div>
                          </td>

                          <td className="px-4 lg:px-6 py-4 align-top">
                            {s.estado === "Activo" ? (
                              <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700">
                                Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700">
                                Inactivo
                              </span>
                            )}
                          </td>

                          <td className="px-4 lg:px-6 py-4 align-top text-right">
                            <div className="inline-flex items-center gap-2">
                              <ViewButton
                                event={() => {
                                  setSelectedSupplier(s);
                                  setIsDetailOpen(true);
                                }}
                              />
                              <EditButton
                                event={() => {
                                  setSelectedSupplier(s);
                                  setIsEditOpen(true);
                                }}
                              />
                              <DeleteButton
                                event={() => handleDeleteClick(s)}
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

      {/* Modal Detalle */}
      <AnimatePresence>
        {isDetailOpen && selectedSupplier && (
          <SupplierDetailModal
            isOpen={isDetailOpen}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedSupplier(null);
            }}
            supplier={selectedSupplier}
            onEdit={(sup) => {
              setSelectedSupplier(sup);
              setIsDetailOpen(false);
              setIsEditOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal Eliminar */}
      <SuppliersDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        supplier={selectedSupplierToDelete}
      />

      {/* Modal Editar */}
      <AnimatePresence>
        {isEditOpen && selectedSupplier && (
          <SuppliersEditModal
            isModalOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            supplierData={selectedSupplier}
            onSubmit={(updated) => {
              // ejemplo: useUpdateSupplier().mutate({ id: selectedSupplier.id_proveedor, ...updated })
              setIsEditOpen(false);
            }}
            categoriasOptions={Array.from(
              new Set(
                suppliers.flatMap((s) =>
                  (s.categorias || [])
                    .map((c) => (c?.nombre_categoria || "").trim())
                    .filter(Boolean)
                )
              )
            ).sort((a, b) => a.localeCompare(b))}
          />
        )}
      </AnimatePresence>

      {/* Modal Registrar */}
      <SuplliersRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
