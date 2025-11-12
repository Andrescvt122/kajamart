import React, { useMemo, useState } from "react";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search, Check, XCircle, Loader2 } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion, AnimatePresence } from "framer-motion";
import ProductReturnModal from "./modals/register/ProductReturnModal";
import DetailsReturnProduct from "./modals/details/detailsReturnProduct";
import { generateProductReturnsPDF } from "./helper/exportToPdf";
import { generateProductReturnsXLS } from "./helper/exportToXls";
import { useFetchReturnProducts } from "../../../shared/components/hooks/returnProducts/useFetchReturnProducts";

// ===== Helpers de responsive (tomados de IndexLow) =====
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EXPAND_EASE } },
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

export default function IndexProductReturns() {
  const { returns = [], loading, error, refetch } = useFetchReturnProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReturnData, setSelectedReturnData] = useState(null);
  const [expanded, setExpanded] = useState(new Set()); // ids expandidos para móvil/desktop
  const perPage = 6;

  // Normalización de texto
  const normalizeText = (text) =>
    (text ?? "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Aplanar datos y mostrar productos individuales con un id de fila estable
  const flattenedProducts = useMemo(() => {
    return (returns || []).flatMap((returnItem) =>
      (returnItem.products || []).map((product, idx) => ({
        idReturn: returnItem.idReturn,
        dateReturn: returnItem.dateReturn,
        responsable: returnItem.responsable,
        _rowId:
          `${returnItem.idReturn}-` +
          (product.idProduct ?? product.id ?? product.name ?? idx),
        ...product,
      }))
    );
  }, [returns]);

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return flattenedProducts;

    return flattenedProducts.filter((product) =>
      Object.values(product).some((value) => normalizeText(value).includes(s))
    );
  }, [flattenedProducts, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

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

  const handleOpenReturnModal = () => setIsReturnModalOpen(true);
  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
    refetch?.();
  };

  const handleOpenDetailsModal = (productData) => {
    const returnItem = (returns || []).find(
      (r) => r.idReturn === productData.idReturn
    );
    if (returnItem) {
      setSelectedReturnData(returnItem);
      setIsDetailsModalOpen(true);
    }
  };
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReturnData(null);
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Fondo de ondas (decorativo) */}
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
            <h2 className="text-2xl sm:text-3xl font-semibold">Devoluciones de productos</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Administrador de tienda</p>
          </div>

          {/* Toolbar responsive */}
          <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between min-w-0">
            <div className="relative w-full min-w-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar productos en devoluciones..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end min-w-0">
              <ExportExcelButton event={() => generateProductReturnsXLS(filtered)}>
                Excel
              </ExportExcelButton>
              <ExportPDFButton event={() => generateProductReturnsPDF(filtered)}>
                PDF
              </ExportPDFButton>
              <motion.button
                onClick={handleOpenReturnModal}
                className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-all font-medium w-full sm:w-auto"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Registrar nueva devolución
              </motion.button>
            </div>
          </div>

          {/* ===== LISTADO RESPONSIVE ===== */}

          {/* Móvil: tarjetas / acordeón */}
          <motion.div className="md:hidden" variants={tableVariants} initial="hidden" animate="visible">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-red-500">
                Error al cargar las devoluciones
              </div>
            ) : pageItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron productos en devoluciones.
              </div>
            ) : (
              <motion.ul className="space-y-3" variants={tableVariants}>
                {pageItems.map((item, i) => {
                  const id = item._rowId || `${item.idReturn}-${i}`;
                  const isExpanded = expanded.has(id);
                  const panelId = `panel-${id}`;
                  const reason = item.reason ?? "—";

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
                                Devolución #{item.idReturn}
                              </span>
                              {item.dateReturn && (
                                <span className="inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full bg-green-50 text-green-700">
                                  {item.dateReturn}
                                </span>
                              )}
                              {item.responsable && (
                                <span className="inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full bg-gray-100 text-gray-700">
                                  Resp. {item.responsable}
                                </span>
                              )}
                            </div>
                            <p
                              className={"mt-1 text-base font-semibold text-gray-900 " + ONE_LINE_SAFE}
                              title={item.name}
                            >
                              {item.name}
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
                            transition={{ duration: EXPAND_DURATION, ease: EXPAND_EASE }}
                            className="overflow-hidden border-t border-gray-100"
                            aria-live="polite"
                          >
                            <div className="px-4 py-4 text-sm text-gray-800">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Cantidad</p>
                                  <p className="mt-1">{item.quantity ?? "—"}</p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Razón</p>
                                  <p className={LONG_TEXT_CLS + " mt-1"}>{reason}</p>
                                </div>
                                <div>
                                  <p className="text-[11px] uppercase tracking-wide text-gray-500">Descuento</p>
                                  <p className="mt-1">
                                    {item.discount ? (
                                      <span className="inline-flex items-center gap-1"><Check size={16} className="text-green-600" /> Sí</span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1"><XCircle size={16} className="text-red-500" /> No</span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center gap-2">
                                <ViewDetailsButton
                                  event={() => handleOpenDetailsModal(item)}
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

          {/* Desktop: tabla con scroll x si hace falta */}
          <motion.div
            className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto max-w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Devolución</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Producto</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Cantidad</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Descuento</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Razón</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4">Responsable</th>
                    <th className="px-4 lg:px-6 py-3 lg:py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12">
                        <div className="flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                        Error al cargar las devoluciones
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No se encontraron productos en devoluciones.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item, i) => {
                      const id = item._rowId || `${item.idReturn}-${item.idProduct ?? i}`;
                      const isExpanded = expanded.has(id);
                      const reason = item.reason ?? "—";
                      const isLong = String(reason).length > REASON_COL_CHARS;

                      return (
                        <motion.tr
                          key={id}
                          className="hover:bg-gray-50 align-top"
                          variants={rowVariants}
                        >
                          <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            #{String(item.idReturn).padStart(4, "0")}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">
                            <div className="min-w-0 max-w-[34ch] xl:max-w-[42ch]">
                              <div className={ONE_LINE_SAFE} title={item.name}>
                                {item.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm whitespace-nowrap">
                            {item.discount ? (
                              <Check size={18} className="text-green-600 inline-block align-middle" />
                            ) : (
                              <XCircle size={18} className="text-red-500 inline-block align-middle" />
                            )}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 align-top">
                            <div
                              style={{ width: `${REASON_COL_CHARS}ch` }}
                              className="max-w-full overflow-hidden"
                            >
                              {/* Vista truncada */}
                              {!isExpanded && (
                                <div
                                  className="overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
                                  title={reason}
                                  style={{ minWidth: 0 }}
                                >
                                  {reason}
                                </div>
                              )}

                              {/* Vista expandida segura */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    key="expanded-reason"
                                    initial={{ height: 0, opacity: 0, y: -4 }}
                                    animate={{ height: "auto", opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -2 }}
                                    transition={{ duration: EXPAND_DURATION, ease: EXPAND_EASE }}
                                    className="overflow-hidden"
                                    aria-live="polite"
                                  >
                                    <div
                                      id={`reason-${id}`}
                                      className={LONG_TEXT_CLS + " mt-1 text-gray-800 leading-relaxed"}
                                      style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
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
                          <td className="px-4 lg:px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 whitespace-nowrap">
                              {item.responsable}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <ViewDetailsButton event={() => handleOpenDetailsModal(item)} />
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

      {/* Modal de devolución de productos */}
      <ProductReturnModal isOpen={isReturnModalOpen} onClose={handleCloseReturnModal} />

      {/* Modal de detalles de devolución */}
      <DetailsReturnProduct
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        returnData={selectedReturnData}
      />
    </div>
  );
}
