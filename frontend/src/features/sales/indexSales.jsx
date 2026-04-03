// src/features/sales/indexSales.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import Swal from "sweetalert2";

import ondas from "../../assets/ondasHorizontal.png";
import { exportSaleReceiptPDF } from "./helper/exportSaleReceiptPDF";
import Paginator from "../../shared/components/paginator";
import {
  ViewButton,
  PrinterButton,
  ExportExcelButton,
  ExportPDFButton,
} from "../../shared/components/buttons";
import SaleDetailModal from "./SaleDetailModal";
import { useSales } from "../../shared/components/hooks/sales/useSales";
import { useUpdateSaleStatus } from "../../shared/components/hooks/sales/useUpdateSaleStatus";
import { useFetchSales } from "../../shared/components/hooks/search/useFetchSales";
import { useAuth } from "../../context/useAtuh";
import Loading from "../../features/onboarding/loading.jsx";
import { exportSalesToExcel } from "./helper/exportSalesExcel";
import { exportSalesToPDF } from "./helper/exportSalesPDF";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(value);
  }
};

// ✅ para ordenar seguro por fecha (si falta fecha, lo manda al final)
const getDateTs = (v) => {
  const raw = v?.fecha_venta ?? v?.fecha ?? null;
  const d = raw ? new Date(raw) : null;
  const ts = d && !Number.isNaN(d.getTime()) ? d.getTime() : Number.POSITIVE_INFINITY;
  return ts;
};

const isSaleAnnulled = (estado) => {
  const value = String(estado || "").toLowerCase();
  return value === "anulada" || value === "anulado" || value === "cancelada";
};

const getSaleStatusClasses = (estado) => {
  if (isSaleAnnulled(estado)) return "bg-red-100 text-red-700";
  if (estado === "Pendiente") return "bg-yellow-50 text-yellow-700";
  return "bg-green-50 text-green-700";
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

const mapSalesForUI = (list) => {
  const arr = (list || []).map((v) => {
    const idVenta = v.id_venta ?? v.id ?? "";
    const idCliente = v?.id_cliente ?? null;

    const clienteNombre =
      v?.clientes?.nombre_cliente ??
      v?.clientes?.nombre ??
      v?.cliente ??
      (idCliente ? `Cliente #${idCliente}` : "Cliente de Caja");

    return {
      raw: v,
      id_ui: String(idVenta),
      fecha_ui: formatDate(v.fecha_venta ?? v.fecha ?? ""),
      cliente_ui: clienteNombre,
      medioPago_ui: v.metodo_pago ?? v.medioPago ?? v.metodoPago ?? "",
      estado_ui: v.estado_venta ?? v.estado ?? "",
      total_ui: Number(v.total || 0),
      productos_ui: v.detalle_venta ?? v.productos ?? [],
      _ts: getDateTs(v),
    };
  });

  arr.sort((a, b) => {
    if (a._ts !== b._ts) return a._ts - b._ts;
    const ia = Number(a.raw?.id_venta ?? a.raw?.id ?? 0);
    const ib = Number(b.raw?.id_venta ?? b.raw?.id ?? 0);
    return ia - ib;
  });

  return arr.map(({ _ts, ...rest }) => rest);
};

export default function IndexSales() {
  const navigate = useNavigate();
  const {
    sales,
    loading,
    error,
    refetch,
    page,
    totalPages,
    totalItems,
    perPage,
    setPage,
  } = useSales();
  const { updateStatus } = useUpdateSaleStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("Crear venta");
  const canAnnular = hasPermission("Anular venta");
  const trimmedSearchTerm = searchTerm.trim();
  const isSearchMode = trimmedSearchTerm.length > 0;
  const { data: searchedSales, loading: searchLoading, error: searchError } =
    useFetchSales(trimmedSearchTerm);

  const normalizedSales = useMemo(() => mapSalesForUI(sales), [sales]);
  const normalizedSearchedSales = useMemo(
    () => mapSalesForUI(searchedSales),
    [searchedSales]
  );

  const pageSize = perPage || 6;
  const searchTotalPages = Math.max(
    1,
    Math.ceil(normalizedSearchedSales.length / pageSize)
  );
  const safeSearchPage = Math.min(searchPage, searchTotalPages);
  const searchPageStart = (safeSearchPage - 1) * pageSize;

  const displayedSales = useMemo(() => {
    if (!isSearchMode) return normalizedSales;
    return normalizedSearchedSales.slice(searchPageStart, searchPageStart + pageSize);
  }, [
    isSearchMode,
    normalizedSales,
    normalizedSearchedSales,
    searchPageStart,
    pageSize,
  ]);

  const currentPageValue = isSearchMode ? safeSearchPage : page;
  const currentTotalPages = isSearchMode ? searchTotalPages : totalPages;
  const currentTotalItems = isSearchMode ? normalizedSearchedSales.length : totalItems;
  const currentLoading = isSearchMode ? searchLoading : loading;
  const currentError = isSearchMode ? searchError : error;


  const tableVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const PrintSaleButton = ({ sale }) => (
    <PrinterButton
      alert={() => {
        exportSaleReceiptPDF({
          sale: sale.raw,
          filename: `recibo_venta_${sale.id_ui}.pdf`,
          empresa: "KAJAMART",
        });
      }}
    />
  );

  const exportRows = useMemo(() => {
    return displayedSales.map((v) => ({
      id: v.id_ui,
      fecha: v.fecha_ui,
      cliente: v.cliente_ui,
      total: v.total_ui,
      medioPago: v.medioPago_ui,
      estado: v.estado_ui,
    }));
  }, [displayedSales]);

  const handleExportExcel = () => {
    exportSalesToExcel({
      rows: exportRows,
      filename: `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`,
    });
  };

  const handleExportPDF = () => {
    exportSalesToPDF({
      rows: exportRows,
      filename: `ventas_${new Date().toISOString().slice(0, 10)}.pdf`,
    });
  };

  const handleAnnulSale = async (event, saleRaw) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const id = saleRaw?.id_venta ?? saleRaw?.id;
    if (!id) return;

    const current = saleRaw?.estado_venta ?? saleRaw?.estado ?? "";
    if (current === "Anulada") {
      await Swal.fire({
        icon: "info",
        title: "Ya está anulada",
        text: `La venta #${id} ya se encuentra anulada.`,
        confirmButtonColor: "#16a34a",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "¿Anular venta?",
      html: `Se anulará la venta <b>#${id}</b> y se devolverá el stock.`,
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "No",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      setUpdatingId(id);

      Swal.fire({
        title: "Anulando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await updateStatus(id, "Anulada");
      await refetch();

      if ((selectedSale?.id_venta ?? selectedSale?.id) === id) {
        setSelectedSale(null);
      }

      Swal.close();
      await Swal.fire({
        icon: "success",
        title: "Venta anulada",
        text: `La venta #${id} fue anulada correctamente.`,
        confirmButtonColor: "#16a34a",
      });
    } catch (e) {
      Swal.close();

      const code = e?.response?.data?.code;
      const diffMinutes = e?.response?.data?.diffMinutes;

      if (code === "ANULAR_TIEMPO_EXCEDIDO") {
        await Swal.fire({
          icon: "info",
          title: "No se puede anular",
          text: `Ya han pasado ${
            diffMinutes ?? "varios"
          } minutos desde esta venta. Solo se puede anular dentro de 30 minutos.`,
          confirmButtonColor: "#16a34a",
        });
      } else {
        const msg =
          e?.response?.data?.message || e?.message || "Error actualizando estado";
        await Swal.fire({
          icon: "error",
          title: "No se pudo anular",
          text: msg,
          confirmButtonColor: "#16a34a",
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePageChange = (nextPage) => {
    if (isSearchMode) {
      const targetPage = Math.min(Math.max(1, nextPage), searchTotalPages);
      setSearchPage(targetPage);
      return;
    }

    setPage(nextPage);
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <div
        className="absolute bottom-0 inset-x-0 w-full pointer-events-none overflow-x-clip"
        style={{
          height: "50%",
          backgroundImage: `url(${ondas})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center bottom",
          backgroundSize: "cover",
          transform: "scaleX(1.15)",
          zIndex: 0,
        }}
      >
        <div className="h-full w-full" />
      </div>

      <div className="flex-1 relative min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip">
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-screen-xl min-w-0 flex-col">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold">Ventas</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Historial de ventas
            </p>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-3">
              <div className="relative min-w-0">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar ventas..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSearchPage(1);
                  }}
                  className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <ExportExcelButton event={handleExportExcel}>Excel</ExportExcelButton>
              </div>

              <div className="flex justify-end">
                <ExportPDFButton event={handleExportPDF}>PDF</ExportPDFButton>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/app/sales/register")}
                  className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                  hidden={!canCreate}
                >
                  Registrar Nueva Venta
                </button>
              </div>
            </div>
          </div>

          <motion.div
            className="md:hidden"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            {currentLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
                <Loading inline heightClass="h-28" />
              </div>
            ) : currentError ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-red-500">
                {currentError}
              </div>
            ) : displayedSales.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
                No se encontraron ventas.
              </div>
            ) : (
              <motion.ul className="space-y-3" variants={tableVariants}>
                {displayedSales.map((v, i) => {
                  const rawId = v.raw?.id_venta ?? v.raw?.id ?? v.id_ui;
                  const isOpen = expanded.has(rawId);
                  const isUpdating = updatingId === rawId;
                  const isAnnulled = isSaleAnnulled(v.estado_ui);
                  const rowNumber = (currentPageValue - 1) * pageSize + i + 1;

                  return (
                    <motion.li
                      key={`${v.id_ui}-mobile-${i}`}
                      variants={rowVariants}
                      className="bg-white rounded-xl shadow-sm border border-gray-100"
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(rawId)}
                        aria-expanded={isOpen}
                        aria-controls={`sale-${rawId}`}
                        className="w-full p-4 text-left"
                      >
                        <div className="flex items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] uppercase tracking-wide text-gray-500">
                                Venta #{rowNumber}
                              </span>
                              <span
                                className={`inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${getSaleStatusClasses(
                                  v.estado_ui
                                )}`}
                              >
                                {v.estado_ui}
                              </span>
                            </div>
                            <p
                              className="mt-1 text-base font-semibold text-gray-900 truncate"
                              title={v.cliente_ui}
                            >
                              {v.cliente_ui}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {v.fecha_ui} · {v.medioPago_ui || "Sin método de pago"}
                            </p>
                          </div>
                          <ChevronIcon open={isOpen} />
                        </div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`sale-${rawId}`}
                            initial={{ height: 0, opacity: 0, y: -4 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -2 }}
                            transition={{ duration: 0.32 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="px-4 py-4 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Total
                                </p>
                                <p className="text-sm text-gray-800">
                                  {formatMoney(v.total_ui)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Productos
                                </p>
                                <p className="text-sm text-gray-800">
                                  {v.productos_ui?.length || 0}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                                  Estado
                                </p>
                                <button
                                  type="button"
                                  onClick={(event) => handleAnnulSale(event, v.raw)}
                                  disabled={isUpdating || isAnnulled || !canAnnular}
                                  title={
                                    isAnnulled
                                      ? "Esta venta ya está anulada"
                                      : "Click para anular"
                                  }
                                  className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full transition ${
                                    isUpdating || isAnnulled
                                      ? "opacity-60 cursor-not-allowed"
                                      : "cursor-pointer"
                                  } ${getSaleStatusClasses(v.estado_ui)}`}
                                >
                                  {isUpdating ? "Actualizando..." : v.estado_ui}
                                </button>
                              </div>
                              <div className="col-span-2 pt-1 flex items-center gap-2">
                                <ViewButton event={() => setSelectedSale(v.raw)} />
                                <PrintSaleButton sale={v} />
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

          <motion.div
            className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100"
            variants={tableVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="overflow-x-auto max-w-full">
              <table key={page} className="min-w-[900px] lg:min-w-[1080px] w-full md:table-fixed">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Medio de Pago</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>

                <motion.tbody
                  className="divide-y divide-gray-100"
                  variants={tableVariants}
                  animate="visible"
                >
                  {currentLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Loading inline heightClass="h-28" />
                      </td>
                    </tr>
                  ) : currentError ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                        {currentError}
                      </td>
                    </tr>
                  ) : displayedSales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                        No se encontraron ventas.
                      </td>
                    </tr>
                  ) : (
                    displayedSales.map((v, i) => {
                      const rawId = v.raw?.id_venta ?? v.raw?.id;
                      const isUpdating = updatingId === rawId;
                      const isAnnulled = isSaleAnnulled(v.estado_ui);
                      const rowNumber = (currentPageValue - 1) * pageSize + i + 1;

                      return (
                        <motion.tr
                          key={`${v.id_ui}-${i}`}
                          className="hover:bg-gray-50"
                          variants={rowVariants}
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {rowNumber}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {v.fecha_ui}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {v.cliente_ui}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatMoney(v.total_ui)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {v.medioPago_ui}
                          </td>

                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={(event) => handleAnnulSale(event, v.raw)}
                              disabled={isUpdating || isAnnulled || !canAnnular}
                              title={
                                isAnnulled
                                  ? "Esta venta ya está anulada"
                                  : "Click para anular"
                              }
                              className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full transition ${
                                isUpdating || isAnnulled
                                  ? "opacity-60 cursor-not-allowed"
                                  : "cursor-pointer"
                              } ${getSaleStatusClasses(v.estado_ui)}`}
                            >
                              {isUpdating ? "Actualizando..." : v.estado_ui}
                            </button>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <ViewButton event={() => setSelectedSale(v.raw)} />
                              <PrintSaleButton sale={v} />
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

          <div className="mt-4 sm:mt-6">
            <Paginator
              currentPage={currentPageValue}
              perPage={pageSize}
              totalPages={currentTotalPages}
              filteredLength={displayedSales.length}
              totalItems={currentTotalItems}
              goToPage={handlePageChange}
            />
          </div>
          <SaleDetailModal
            sale={selectedSale}
            onClose={() => setSelectedSale(null)}
          />
        </div>
      </div>
    </div>
  );
}
