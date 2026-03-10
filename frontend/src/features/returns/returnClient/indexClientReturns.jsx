import React, { useEffect, useMemo, useState } from "react";
import {
  ExportExcelButton,
  ExportPDFButton,
  ViewDetailsButton,
} from "../../../shared/components/buttons";
import { Search } from "lucide-react";
import ondas from "../../../assets/ondasHorizontal.png";
import Paginator from "../../../shared/components/paginator";
import { motion } from "framer-motion";
import ReturnSalesComponent from "./modals/registerClientReturn/returnSaleComponent";
import DetailsClientReturn from "./modals/detailsClientReturn/detailsClientReturn";
import generateProductReturnsPDF from "./helpers/exportToPdf";
import generateProductReturnsXLS from "./helpers/exportToXls";
import { useAuth } from "../../../context/useAtuh";
import { useFetchReturnClients } from "../../../shared/components/hooks/returnClients/useFetchReturnClients";
import Swal from "sweetalert2";
import { useAnnulReturnClient } from "../../../shared/components/hooks/returnClients/useAnnulReturnClient";
import { useAnnulmentWindow } from "../../../shared/components/hooks/useAnnulmentWindow";
import StatusFilterDropdown from "../../../shared/components/StatusFilterDropdown";

export default function IndexClientReturns() {
  const perPage = 6;
  const { returns, loading, error, refetch } = useFetchReturnClients({ limit: perPage });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Estado para el modal de detalles
  const [selectedReturn, setSelectedReturn] = useState(null); // Estado para la devolución seleccionada
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [annulledMap, setAnnulledMap] = useState({});
  const {hasPermission} = useAuth();
  const canCreate = hasPermission('Crear devolucion clientes');
  const { annulReturnClient, loading: annulling } = useAnnulReturnClient();
  const { getAnnulmentMeta } = useAnnulmentWindow();

  // Función para abrir el modal de detalles
  const handleViewDetails = (rowData) => {
    const found = returns.find((returnItem) => returnItem.idReturn === rowData.idReturn);
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

  const formattedRows = useMemo(() => {
    return returns.flatMap((returnItem) => {
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
      return [...returnedRows, ...deliveredRows];
    });
  }, [returns]);

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    const match = (val) => normalizeText(String(val ?? "")).includes(s);
    const byStatus = formattedRows.filter((row) => {
      const isActive = annulledMap[row.idReturn] ?? row.isActive;
      if (statusFilter === "active") return isActive === true;
      if (statusFilter === "inactive") return isActive === false;
      return true;
    });

    if (!s) return byStatus;

    return byStatus.filter((row) => {
      const topMatch = Object.entries(row).some(([, v]) => {
        if (Array.isArray(v)) return false;
        return match(v);
      });
      const productMatch = Object.values(row.currentProduct || {}).some((val) => match(val));
      return topMatch || productMatch;
    });
  }, [formattedRows, searchTerm, statusFilter, annulledMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
          await refetch?.();
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
      <div className="relative z-10 text-gray-900">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold">Devoluciones de clientes</h2>
            <p className="text-sm text-gray-500 mt-1">
              Administrador de tienda
            </p>
          </div>
        </div>

        {/* Barra de búsqueda + botones */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
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
            className="w-full sm:w-[220px]"
          />

          <div className="flex gap-2 flex-shrink-0">
            <ExportExcelButton event={generateProductReturnsXLS}>Excel</ExportExcelButton>
            <ExportPDFButton event={generateProductReturnsPDF}>PDF</ExportPDFButton>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
              hidden={!canCreate}
            >
              Registrar nueva devolución
            </button>
          </div>
        </div>

        {/* Tabla con animación */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
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
              {loading ? (
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
                    {error || "No se encontraron devoluciones."}
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
                          disabled={getAnnulmentMeta(s.createdAt || s.dateISO, annulledMap[s.idReturn] ?? s.isActive).isDisabled}
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
          filteredLength={filtered.length}
          goToPage={goToPage}
        />
      </div>

      {/* Modal de registro de devolución */}
      <ReturnSalesComponent
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onReturnRegistered={refetch}
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
