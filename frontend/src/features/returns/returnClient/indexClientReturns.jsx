import React, { useMemo, useState } from "react";
import {
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion, AnimatePresence } from "framer-motion";
import ReturnSalesComponent from "./modals/registerClientReturn/returnSaleComponent";
import DetailsClientReturn from "./modals/detailsClientReturn/detailsClientReturn";
import generateProductReturnsPDF from "./helpers/exportToPdf";
import generateProductReturnsXLS from "./helpers/exportToXls";
import { useAuth } from "../../../context/useAtuh";
import { useFetchReturnClients } from "../../../shared/components/hooks/returnClients/useFetchReturnClients";
import { useSearchReturnClients } from "../../../shared/components/hooks/returnClients/useSearchReturnClients";
import Swal from "sweetalert2";
import { useAnnulReturnClient } from "../../../shared/components/hooks/returnClients/useAnnulReturnClient";
import { useAnnulmentWindow } from "../../../shared/components/hooks/useAnnulmentWindow";
import StatusFilterDropdown from "../../../shared/components/StatusFilterDropdown";

const ONE_LINE_SAFE =
  "truncate break-words break-all [overflow-wrap:anywhere] max-w-full";

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

export default function IndexClientReturns() {
  // pagination hook handles loading pages from backend
  const perPage = 6;
  const {
    fetchPage,
    pagesCache,
    loading,
    error,
    reset,
    getTotalPages,
    getLoadedCount,
  } = useFetchReturnClients(perPage);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: searchedReturnClients = [],
    loading: searchLoading,
    error: searchError,
  } = useSearchReturnClients(searchTerm);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState(new Set());
  const [annulledMap, setAnnulledMap] = useState({});
  const {hasPermission} = useAuth();
  const canCreate = hasPermission('Crear devolucion clientes');
  const canAnnul = hasPermission('Anular devolucion cliente');
  const { annulReturnClient, loading: annulling } = useAnnulReturnClient();
  const { getAnnulmentMeta } = useAnnulmentWindow();
  const isSearching = searchTerm.trim() !== "";

  // data-fetching effect
  React.useEffect(() => {
    if (!isSearching) {
      fetchPage(currentPage);
    }
  }, [currentPage, isSearching]);

  // Función para abrir el modal de detalles (busca sólo en página actual)
  const handleViewDetails = (rowData) => {
    const pageData = isSearching ? searchedReturnClients : pagesCache[currentPage] || [];
    const found = pageData.find((r) => r.idReturn === rowData.idReturn);
    setSelectedReturn(found || rowData);
    setIsDetailsModalOpen(true);
  };

  // Función para cerrar el modal de detalles
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedReturn(null);
  };

  // Normalización de texto
  const normalizeText = (text) =>
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // build items for UI from current page and apply filters locally
  const filteredItems = useMemo(() => {
    const pageData = isSearching ? searchedReturnClients : pagesCache[currentPage] || [];
    return pageData
      .flatMap((returnItem) => {
        const returnedRows = (returnItem.productsReturned || []).map((product) => ({
          ...returnItem,
          currentProduct: {
            ...product,
            category: "devuelto",
          },
        }));
        const deliveredRows = (returnItem.productsDelivered || []).map((product) => ({
          ...returnItem,
          currentProduct: {
            ...product,
            category: "entregado",
          },
        }));
        const rows = [...returnedRows, ...deliveredRows];

        if (rows.length > 0) {
          return rows;
        }

        return [
          {
            ...returnItem,
            currentProduct: {
              idProduct: `fallback-${returnItem.idReturn}`,
              name: "Sin productos asociados",
              quantity: 0,
              totalValue:
                Number(returnItem.totalDevolucionCliente) ||
                Number(returnItem.totalDevolucionProducto) ||
                0,
              reason: "",
              condition: "",
              category: "sin-detalle",
            },
          },
        ];
      })
      .filter((row) => {
        const isActive = annulledMap[row.idReturn] ?? row.isActive;
        if (statusFilter === "active") return isActive;
        if (statusFilter === "annulled") return !isActive;
        return true;
      })
      .filter((row) => {
        const s = normalizeText(searchTerm.trim());
        if (!s) return true;
        return (
          normalizeText(row.idReturn).includes(s) ||
          normalizeText(row.idSale).includes(s) ||
          normalizeText(row.client).includes(s) ||
          normalizeText(row.currentProduct?.name).includes(s)
        );
      });
  }, [pagesCache, currentPage, searchTerm, statusFilter, annulledMap, isSearching, searchedReturnClients]);

  const totalPages = isSearching
    ? Math.max(1, Math.ceil(filteredItems.length / perPage))
    : getTotalPages();
  const filteredLength = isSearching ? filteredItems.length : getLoadedCount();
  const pageItems = useMemo(() => {
    if (!isSearching) return filteredItems;
    const start = (currentPage - 1) * perPage;
    return filteredItems.slice(start, start + perPage);
  }, [filteredItems, currentPage, perPage, isSearching]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };
  const toggleExpand = (rowId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(rowId) ? next.delete(rowId) : next.add(rowId);
      return next;
    });
  };

  const handleAnnulReturn = async (row) => {
    const status = annulledMap[row.idReturn] ?? row.isActive;
    const { isDisabled } = getAnnulmentMeta(row.createdAt || row.dateISO, status);
    if (isDisabled) return;

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
          await annulReturnClient(row.idReturn);
          setAnnulledMap((prev) => ({ ...prev, [row.idReturn]: false }));
          // recarga la página actual luego de anular
          await fetchPage(currentPage, { force: true });
          return true;
        } catch {
          Swal.showValidationMessage("No se pudo anular el registro.");
          return false;
        }
      },
    });

    if (result.isConfirmed) {
      await Swal.fire("Anulado", "El registro fue anulado correctamente.", "success");
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

  // Animaciones
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <>
      {/* Fondo de ondas */}
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

      {/* Contenido */}
      <div className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8 overflow-x-clip text-gray-900">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold">Devoluciones de clientes</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Administrador de tienda
            </p>
          </div>
        </div>

        {/* Barra de búsqueda + botones */}
        <div className="mb-4 sm:mb-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_auto_auto] items-center gap-3">
            <div className="relative min-w-0">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar devoluciones..."
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
              className="w-full xl:w-[220px]"
            />

            <div className="flex gap-2">
              <ExportExcelButton event={() => generateProductReturnsXLS(pageItems)}>
                Excel
              </ExportExcelButton>
              <ExportPDFButton event={() => generateProductReturnsPDF(pageItems)}>
                PDF
              </ExportPDFButton>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 w-full xl:w-auto"
              hidden={!canCreate}
            >
              Registrar nueva devolución
            </button>
          </div>
        </div>

        <motion.div
          className="md:hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          {loading || (isSearching && searchLoading) ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
              Cargando devoluciones...
            </div>
          ) : pageItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
              {searchError || error || "No se encontraron devoluciones."}
            </div>
          ) : (
            <motion.ul className="space-y-3" variants={tableVariants}>
              {pageItems.map((s, i) => {
                const rowId =
                  `${s.idReturn}-${s.currentProduct?.idProduct ?? s.currentProduct?.name ?? i}`;
                const isExpanded = expanded.has(rowId);
                const status = annulledMap[s.idReturn] ?? s.isActive;
                const unitValue =
                  s.currentProduct.quantity > 0
                    ? s.currentProduct.totalValue / s.currentProduct.quantity
                    : 0;

                return (
                  <motion.li
                    key={`${rowId}-mobile`}
                    variants={rowVariants}
                    className="bg-white rounded-xl shadow-sm border border-gray-100"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(rowId)}
                      className="w-full p-4 text-left"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] uppercase tracking-wide text-gray-500">
                              Devolución #{s.idReturn}
                            </span>
                            <span
                              className={`inline-flex items-center justify-center px-2 py-[2px] text-[11px] font-semibold rounded-full ${
                                status
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {status ? "Activo" : "Anulado"}
                            </span>
                          </div>
                          <p className={`mt-1 text-base font-semibold text-gray-900 ${ONE_LINE_SAFE}`}>
                            {s.client}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {s.currentProduct.name}
                          </p>
                        </div>
                        <ChevronIcon open={isExpanded} />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-gray-100"
                        >
                          <div className="px-4 py-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">Venta</p>
                                <p className="mt-1 font-medium text-gray-800">#{s.idSale}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">Fecha</p>
                                <p className="mt-1 font-medium text-gray-800">{s.dateReturn}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">Razón</p>
                                <p className="mt-1 text-gray-700">{s.currentProduct.reason || "N/A"}</p>
                              </div>
                              <div>
                                <p className="text-[11px] uppercase tracking-wide text-gray-500">Total</p>
                                <p className="mt-1 font-medium text-gray-800">{formatCurrency(s.currentProduct.totalValue)}</p>
                                <p className="text-xs text-gray-500">{formatCurrency(unitValue)} c/u</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                              <div className="flex items-center gap-2">
                                <ToggleSwitch
                                  checked={status}
                                  disabled={
                                    !canAnnul ||
                                    getAnnulmentMeta(
                                      s.createdAt || s.dateISO,
                                      status
                                    ).isDisabled
                                  }
                                  onChange={() => handleAnnulReturn(s)}
                                />
                                <span className="text-xs text-gray-500">
                                  {status ? "Activo" : "Anulado"}
                                </span>
                              </div>
                              <ViewDetailsButton event={() => handleViewDetails(s)} />
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

        {/* Tabla desktop */}
        <motion.div
          className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">Devolución</th>
                <th className="px-6 py-4">Venta</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Razón</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-100 text-gray-700"
              variants={tableVariants}
            >
              {loading || (isSearching && searchLoading) ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    Cargando devoluciones...
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    {searchError || error || "No se encontraron devoluciones."}
                  </td>
                </tr>
              ) : (
                pageItems.map((s, i) => (
                  <motion.tr
                    key={s.idReturn + "-" + i}
                    className="hover:bg-gray-50"
                    variants={rowVariants}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.idReturn}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.idSale}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-700">
                      {s.dateReturn}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">{s.client}</p>
                        <p className="text-xs text-gray-500">
                          {s.currentProduct.name} ({s.currentProduct.quantity} unid.)
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {s.currentProduct.reason || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(s.currentProduct.totalValue)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(
                            s.currentProduct.quantity
                              ? s.currentProduct.totalValue / s.currentProduct.quantity
                              : 0
                          )}{" "}
                          c/u
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ToggleSwitch
                          checked={annulledMap[s.idReturn] ?? s.isActive}
                          disabled={ !canAnnul || getAnnulmentMeta(s.createdAt || s.dateISO, annulledMap[s.idReturn] ?? s.isActive).isDisabled}
                          onChange={() => handleAnnulReturn(s)}
                        />
                        <span className="text-xs text-gray-500">
                          {(annulledMap[s.idReturn] ?? s.isActive) ? "Activo" : "Anulado"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <ViewDetailsButton event={() => handleViewDetails(s)} />
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
          filteredLength={filteredLength}
          goToPage={goToPage}
        />
      </div>

      {/* Modal de registro de devolución */}
      <ReturnSalesComponent
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onReturnRegistered={async () => {
          reset();
          setCurrentPage(1);
          await fetchPage(1, { force: true });
        }}
      />

      {/* Modal de detalles de devolución */}
      <DetailsClientReturn
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        returnData={selectedReturn}
      />
    </>
  );
}
