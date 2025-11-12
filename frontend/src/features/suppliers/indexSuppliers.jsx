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
import Loading from "../../features/onboarding/loading.jsx"; // ⬅️ loader inline

// Hooks de proveedores (backend real)
import {
  useSuppliers as useSuppliersQuery,
  useDeleteSupplier,
} from "../../shared/components/hooks/suppliers/suppliers.hooks.js";

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
        try { Swal.close(); } catch (_) {}
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
        try { Swal.close(); } catch (_) {}
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
    document.body.style.overflow = isDetailOpen ? "hidden" : (originalOverflow || "auto");
    return () => { document.body.style.overflow = originalOverflow || "auto"; };
  }, [isDetailOpen]);

  // Buscador + paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  // Modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Normalizador
  const normalizeText = (text) =>
    text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
      return suppliers.filter((p) => normalizeText(String(p.estado)) === "activo");
    }
    if (/^inactivos?$/.test(s)) {
      return suppliers.filter((p) => normalizeText(String(p.estado)) === "inactivo");
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
  }, [filtered, currentPage, perPage]); // ⬅️ incluye perPage

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  // Animaciones
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  // === Error global (loader irá inline en la tabla) ===
  if (isError) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Error al cargar proveedores.";
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{msg}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Fondo decorativo */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      />

      {/* Contenido principal */}
      <div className="flex-1 relative min-h-screen p-8 overflow-auto">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-semibold">Proveedores</h2>
              <p className="text-sm text-gray-500 mt-1">Administrador de tienda</p>
            </div>
          </div>

          {/* Barra de búsqueda + acciones */}
          <div className="mb-6 flex items-center gap-3">
            <SearchBar
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 min-w-0"
            />

            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton event={() => exportSuppliersToExcel(filtered)}>
                Excel
              </ExportExcelButton>

              <ExportPDFButton event={() => exportSuppliersToPDF(filtered)}>
                PDF
              </ExportPDFButton>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              >
                Registrar Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* Tabla con animación */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            key={`wrap-${currentPage}-${searchTerm}-${filtered.length}`}
          >
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-6 py-4">NIT</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Teléfono</th>
                  <th className="px-6 py-4">Categorías</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>

              <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
                {isLoading ? (
                  // Loader SOLO dentro de la tabla
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <Loading inline heightClass="h-28" />
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
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
                        : `${catNames.slice(0, 2).join(", ")} +${catNames.length - 2}`;

                    return (
                      <motion.tr
                        key={(s.id_proveedor ?? s.nit ?? i) + "-" + i}
                        className="hover:bg-gray-50"
                        variants={rowVariants}
                      >
                        <td className="px-6 py-4 align-top text-sm text-gray-600">
                          {s.nit ?? "—"}
                        </td>
                        <td className="px-6 py-4 align-top text-sm font-medium text-gray-900">
                          {s.nombre ?? "—"}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-600">
                          {s.telefono ?? "—"}
                        </td>
                        <td className="px-6 py-4 align-top text-sm text-gray-700">
                          {displayCats}
                        </td>
                        <td className="px-6 py-4 align-top">
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
                        <td className="px-6 py-4 align-top text-right">
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
                            <DeleteButton event={() => handleDeleteClick(s)} />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
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
