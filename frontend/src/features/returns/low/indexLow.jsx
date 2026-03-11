import React, { useMemo, useState, useEffect } from "react";
import {
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion, AnimatePresence } from "framer-motion";
import RegisterLow from "./modals/registerLow";
import DetailsLow from "./modals/detailsLow";
import generateProductLowsPDF from "./helpers/exportToPdf";
import generateProductLowsXLS from "./helpers/exportToXls";
import { useGetLowProducts } from "../../../shared/components/hooks/lowProducts/useGetLowProducts";
import { useAuth } from "../../../context/useAtuh";
import Loading from "../../onboarding/loading";
import Swal from "sweetalert2";
import { useAnnulLowProduct } from "../../../shared/components/hooks/lowProducts/useAnnulLowProduct";
import { useAnnulmentWindow } from "../../../shared/components/hooks/useAnnulmentWindow";
import StatusFilterDropdown from "../../../shared/components/StatusFilterDropdown";
// ===== Helpers de responsive (tomados de IndexCategories) =====
const REASON_COL_CHARS = 34; // ancho de referencia para la columna "Razón" en desktop
const EXPAND_EASE = [0.22, 1, 0.36, 1];
const EXPAND_DURATION = 0.38;

// Textos largos que no deben romper el layout
const LONG_TEXT_CLS =
  "whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere] hyphens-auto max-w-full overflow-hidden";

// Textos de una sola línea con ellipsis y seguridad de ancho
const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

const tableVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: EXPAND_EASE },
  },
};

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

export default function IndexLow() {
  const perPage = 6;
  const {
    fetchPage,
    pagesCache,
    meta,
    loading,
    error,
    reset,
    getTotalPages,
    getLoadedCount,
  } = useGetLowProducts(perPage);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLow, setSelectedLow] = useState(null);
  const [expanded, setExpanded] = useState(new Set()); // ids expandidos para móvil/desktop
  const [annulledMap, setAnnulledMap] = useState({});
  const [blockedAnnulMap, setBlockedAnnulMap] = useState({});
  const {hasPermission} = useAuth();

  // Permiso requerido para ver la página
  const canCreate = hasPermission('Crear baja productos');
  const { annulLowProduct, loading: annulling } = useAnnulLowProduct();
  const { getAnnulmentMeta } = useAnnulmentWindow();

  React.useEffect(() => {
    fetchPage(currentPage);
  }, [currentPage]);

  const buildAnnulErrorMessage = (err) => {
    const payload = err?.response?.data ?? {};
    const baseMessage =
      payload.error || payload.message || "No se pudo anular el registro.";

    const detailTables = Array.isArray(payload.tablas_detalle_relacionadas)
      ? payload.tablas_detalle_relacionadas
      : [];
    const productTables = Array.isArray(payload.tablas_producto_relacionadas)
      ? payload.tablas_producto_relacionadas
      : [];

    if (!detailTables.length && !productTables.length) return baseMessage;

    const parts = [baseMessage];
    if (detailTables.length) {
      parts.push(`Tablas detalle relacionadas: ${detailTables.join(", ")}`);
    }
    if (productTables.length) {
      parts.push(`Tablas producto relacionadas: ${productTables.join(", ")}`);
    }

    return parts.join("<br/>");
  };

  const isRelationConflict = (payload = {}) => {
    const text = `${payload.error || ""} ${payload.message || ""}`.toLowerCase();
    return payload.code === "LOW_PRODUCT_RELATION_CONFLICT" || text.includes("relacionad");
  };

  const getBlockKey = (id) => String(id);

  // Normalización de texto
  const normalizeText = (text) =>
    text
      ?.toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Filtrado + expansión por producto para la página actual
  const pageItems = useMemo(() => {
    const pageData = pagesCache[currentPage] || [];
    const s = normalizeText(searchTerm.trim());
    const match = (val) => normalizeText(String(val ?? "")).includes(s);

    const expandedRows = pageData.flatMap((low) =>
      (low.products || []).map((product) => ({
        ...low,
        currentProduct: product,
        _rowId: `${low.idLow}-${
          product.id ?? product.idProducto ?? product.name
        }`,
      }))
    );
    const byStatus = expandedRows.filter((item) => {
      const isActive = annulledMap[item.idLow] ?? item.isActive;
      if (statusFilter === "active") return isActive === true;
      if (statusFilter === "inactive") return isActive === false;
      return true;
    });

    if (!s) return byStatus;

    return byStatus.filter((item) =>
      Object.values(item).some((val) =>
        typeof val === "object"
          ? Object.values(val).some((v) => match(v))
          : match(val)
      )
    );
  }, [pagesCache, currentPage, searchTerm, statusFilter, annulledMap]);

  const totalPages = getTotalPages();
  const filteredLength = getLoadedCount();

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirmLow = () => {
    // after registering we want to refresh first page
    reset();
    setCurrentPage(1);
    fetchPage(1);
  };

  const handleAnnulLow = async (item) => {
    const itemKey = getBlockKey(item.idLow);
    const status = annulledMap[item.idLow] ?? item.isActive;
    const isBlockedByRelation = Boolean(blockedAnnulMap[itemKey]);
    const { isDisabled } = getAnnulmentMeta(item.createdAt || item.dateLow, status);
    if (isDisabled || isBlockedByRelation) return;

    let relationConflictDetected = false;

    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción es permanente y no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      allowEscapeKey: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          await annulLowProduct(item.idLow);
          setAnnulledMap((prev) => ({ ...prev, [item.idLow]: false }));
          await fetchPage(currentPage);
          return { ok: true };
        } catch (err) {
          const payload = err?.response?.data ?? {};
          relationConflictDetected = isRelationConflict(payload);
          return {
            ok: false,
            relationConflict: relationConflictDetected,
            message: buildAnnulErrorMessage(err),
          };
        }
      },
    });

    if (!result.isConfirmed) return;

    if (result.value?.ok) {
      await Swal.fire("Anulado", "El registro fue anulado correctamente.", "success");
      return;
    }

    await Swal.fire({
      title: "No se pudo anular",
      html: result.value?.message || "No se pudo anular el registro.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });

    if (relationConflictDetected || result.value?.relationConflict) {
      setBlockedAnnulMap((prev) => ({ ...prev, [itemKey]: true }));
    }
  };

  const ToggleSwitch = ({ checked, disabled, onChange }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled || annulling}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-green-600" : "bg-gray-300"
      } ${(disabled || annulling) ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Fondo decorativo: no expande el layout */}
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
        <div className="relative z-10 mx-auto w-full max-w-screen-xl min-w-0 text-gray-900">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Productos de baja
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Administrador de tienda
            </p>
          </div>

          {/* Toolbar responsive */}
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <div className="relative min-w-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar bajas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>
              <StatusFilterDropdown
                value={statusFilter}
                onChange={(nextStatus) => {
                  setStatusFilter(nextStatus);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-[220px]"
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <ExportExcelButton event={() => generateProductLowsXLS(pageItems)}>
                Excel
              </ExportExcelButton>

              <ExportPDFButton event={() => generateProductLowsPDF(pageItems)}>
                PDF
              </ExportPDFButton>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "auto" });
                  setIsOpen(true);
                }}
                hidden={!canCreate}
                className="px-4 py-2.5 rounded-full bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
              >
                Registrar nueva baja
              </button>
            </div>
          </div>

          {/* ===== LISTADO RESPONSIVE ===== */}

          {/* Móvil: tarjetas / acordeón */}
          <motion.div
            className="md:hidden"
            variants={tableVariants}
          >
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <Loading inline heightClass="h-28" />
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-red-500">
                Error al cargar las bajas
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron productos dados de baja.
              </div>
            ) : (
              <motion.ul className="space-y-3" variants={tableVariants}>
                {pageItems.map((item, i) => {
                  const id = item._rowId || `${item.idLow}-${i}`;
                  const isExpanded = expanded.has(id);
                  const panelId = `panel-${id}`;
                  const reason = item.currentProduct?.reason ?? "—";

                  return (
                    <motion.li
                      key={id + "-mobile"}
                      variants={rowVariants}
                      className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(id)}
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                                Baja #{item.idLow}
                              </span>
                              <span className="inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full bg-green-50 text-green-700">
                                {item.dateLow}
                              </span>
                              <span className="inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full bg-gray-100 text-gray-700">
                                Resp. {item.responsible}
                              </span>
                            </div>
                            <p
                              className={
                                "mt-1 text-base font-semibold text-gray-900 " +
                                ONE_LINE_SAFE
                              }
                              title={item.currentProduct?.name}
                            >
                              {item.currentProduct?.name}
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
                            <div className="px-4 py-4 text-sm text-gray-800">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                    Cantidad
                                  </p>
                                  <p className="mt-1">
                                    {item.currentProduct?.lowQuantity ?? "—"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                    Razón
                                  </p>
                                  <p className={LONG_TEXT_CLS + " mt-1"}>
                                    {reason}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-2">
                                <ViewDetailsButton
                                  event={() => {
                                    setSelectedLow(item);
                                    setIsOpen(true);
                                  }}
                                />
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">Anular</span>
                                  <ToggleSwitch
                                    checked={annulledMap[item.idLow] ?? item.isActive}
                                    disabled={
                                      getAnnulmentMeta(
                                        item.createdAt || item.dateLow,
                                        annulledMap[item.idLow] ?? item.isActive
                                      ).isDisabled || blockedAnnulMap[getBlockKey(item.idLow)]
                                    }
                                    onChange={() => handleAnnulLow(item)}
                                  />
                                </div>
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

          {/* Desktop: tabla con scroll x si hace falta */}
          <motion.div
            className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
            variants={tableVariants}
          >
            <div className="overflow-x-auto max-w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Baja</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Fecha</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Producto</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Cantidad</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Razón</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Responsable</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Estado</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <motion.tbody
                  className="divide-y divide-gray-100 text-gray-700"
                  variants={tableVariants}
                >
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <Loading inline heightClass="h-28" />
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-12 text-center text-red-500"
                      >
                        Error al cargar las bajas
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        No se encontraron productos dados de baja.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item, i) => {
                      const id =
                        item._rowId ||
                        `${item.idLow}-${item.currentProduct?.id ?? i}`;
                      const isExpanded = expanded.has(id);
                      const reason = item.currentProduct?.reason ?? "—";
                      const isLong = String(reason).length > REASON_COL_CHARS;

                      return (
                        <motion.tr
                          key={id}
                          className="hover:bg-gray-50 align-top"
                          variants={rowVariants}
                        >
                          <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {item.idLow}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-green-700 whitespace-nowrap">
                            {item.dateLow}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                            <div className="min-w-0 max-w-[34ch] xl:max-w-[42ch]">
                              <div
                                className={ONE_LINE_SAFE}
                                title={item.currentProduct?.name}
                              >
                                {item.currentProduct?.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {item.currentProduct?.lowQuantity}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 align-top">
                            <div className="min-w-0 max-w-[36ch] xl:max-w-[46ch]">
                              {!isExpanded && (
                                <div
                                  className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                                  title={reason}
                                  style={{ minWidth: 0 }}
                                >
                                  {reason}
                                </div>
                              )}

                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="expanded-reason"
                                    initial={{ height: 0, opacity: 0, y: -4 }}
                                    animate={{
                                      height: "auto",
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{ height: 0, opacity: 0, y: -2 }}
                                    transition={{
                                      duration: EXPAND_DURATION,
                                      ease: EXPAND_EASE,
                                    }}
                                    className="overflow-hidden"
                                    aria-live="polite"
                                  >
                                    <div
                                      id={`reason-${id}`}
                                      className={
                                        LONG_TEXT_CLS +
                                        " mt-1 text-gray-800 leading-relaxed"
                                      }
                                    >
                                      {reason}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {isLong && (
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(id)}
                                  className="mt-1 block text-xs text-green-700 hover:underline"
                                  aria-expanded={isExpanded}
                                  aria-controls={`reason-${id}`}
                                >
                                  {isExpanded ? "Ocultar" : "Ver detalles"}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 whitespace-nowrap">
                              {item.responsible}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <ToggleSwitch
                                checked={annulledMap[item.idLow] ?? item.isActive}
                                disabled={
                                  getAnnulmentMeta(
                                    item.createdAt || item.dateLow,
                                    annulledMap[item.idLow] ?? item.isActive
                                  ).isDisabled || blockedAnnulMap[getBlockKey(item.idLow)]
                                }
                                onChange={() => handleAnnulLow(item)}
                              />
                              <span className="text-xs text-gray-500">
                                {(annulledMap[item.idLow] ?? item.isActive) ? "Activo" : "Anulado"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <ViewDetailsButton
                                event={() => {
                                  setSelectedLow(item);
                                  setIsOpen(true);
                                }}
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
              filteredLength={filteredLength}
              goToPage={goToPage}
            />
          </div>
        </div>
      </div>

      {/* Modal de registro */}
      <RegisterLow
        isOpen={isOpen && !selectedLow}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirmLow}
      />

      {/* Modal de detalles */}
      <DetailsLow
        isOpen={isOpen && selectedLow !== null}
        onClose={() => {
          setIsOpen(false);
          setSelectedLow(null);
        }}
        lowData={selectedLow}
      />
    </div>
  );
}
