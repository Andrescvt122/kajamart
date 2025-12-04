// src/features/sales/indexSales.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { exportSalesToExcel } from "./helper/exportSalesExcel";
import { exportSalesToPDF } from "./helper/exportSalesPDF";
import { useSales } from "../../shared/components/hooks/sales/useSales";
import { useUpdateSaleStatus } from "../../shared/components/hooks/sales/useUpdateSaleStatus";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const normalizeText = (text) =>
  String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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

export default function IndexSales() {
  const navigate = useNavigate();
  const { sales, loading, error, refetch } = useSales();
  const { updateStatus } = useUpdateSaleStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;

  const [selectedSale, setSelectedSale] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const normalizedSales = useMemo(() => {
    return (sales || []).map((v) => ({
      raw: v,

      id_ui: v.id_venta ?? v.id ?? "",
      fecha_ui: formatDate(v.fecha_venta ?? v.fecha ?? ""),

      cliente_ui:
        v?.clientes?.nombre_cliente ??
        v?.clientes?.nombre ??
        v?.cliente ??
        "",

      medioPago_ui: v.metodo_pago ?? v.medioPago ?? v.metodoPago ?? "",
      estado_ui: v.estado_venta ?? v.estado ?? "",

      total_ui: Number(v.total || 0),

      productos_ui: v.detalle_venta ?? v.productos ?? [],
    }));
  }, [sales]);

  const filtered = useMemo(() => {
    const s = normalizeText(searchTerm.trim());
    if (!s) return normalizedSales;

    return normalizedSales.filter((v) => {
      const target = normalizeText(
        `${v.id_ui} ${v.fecha_ui} ${v.cliente_ui} ${v.medioPago_ui} ${v.estado_ui} ${v.total_ui}`
      );
      return target.includes(s);
    });
  }, [normalizedSales, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage]);

  const goToPage = (n) => {
    const p = Math.min(Math.max(1, n), totalPages);
    setCurrentPage(p);
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
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
    return filtered.map((v) => ({
      id: v.id_ui,
      fecha: v.fecha_ui,
      cliente: v.cliente_ui,
      total: v.total_ui,
      medioPago: v.medioPago_ui,
      estado: v.estado_ui,
    }));
  }, [filtered]);

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

  // ✅ Anular (no cancelar)
  const handleAnnulSale = async (saleRaw) => {
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
      html: `Se anulará la venta <b>#${id}</b>.`,
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

      // ✅ backend: PUT /sales/:id/status  body: { estado }
      await updateStatus(id, "Anulada");

      await refetch();

      if ((selectedSale?.id_venta ?? selectedSale?.id) === id) {
        setSelectedSale(null);
      }

      await Swal.fire({
        icon: "success",
        title: "Venta anulada",
        text: `La venta #${id} fue anulada correctamente.`,
        confirmButtonColor: "#16a34a",
      });
    } catch (e) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo anular",
        text: e?.message || "Error actualizando estado",
        confirmButtonColor: "#16a34a",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
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

      <div className="relative z-10 min-h-screen flex flex-col p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-3xl font-semibold">Ventas</h2>
            <p className="text-sm text-gray-500 mt-1">Historial de ventas</p>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-500 mb-3">Cargando ventas...</p>}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar ventas..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-4 py-3 w-full rounded-full border border-gray-200 bg-gray-50 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <ExportExcelButton event={handleExportExcel}>Excel</ExportExcelButton>
            <ExportPDFButton event={handleExportPDF}>PDF</ExportPDFButton>
            <button
              onClick={() => navigate("/app/sales/register")}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700"
            >
              Registrar Nueva Venta
            </button>
          </div>
        </div>

        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          <table key={currentPage} className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="px-6 py-4">ID Venta</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Medio de Pago</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>

            <motion.tbody className="divide-y divide-gray-100" variants={tableVariants}>
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No se encontraron ventas.
                  </td>
                </tr>
              ) : (
                pageItems.map((v, i) => {
                  const rawId = v.raw?.id_venta ?? v.raw?.id;
                  const isUpdating = updatingId === rawId;
                  const isAnnulled = v.estado_ui === "Anulada";

                  return (
                    <motion.tr
                      key={v.id_ui + "-" + i}
                      className="hover:bg-gray-50"
                      variants={rowVariants}
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">{v.id_ui}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{v.fecha_ui}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {v.cliente_ui || "Cliente de Caja"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatMoney(v.total_ui)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{v.medioPago_ui}</td>

                      {/* ✅ onClick con event */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleAnnulSale(v.raw);
                          }}
                          disabled={isUpdating || isAnnulled}
                          title={isAnnulled ? "Esta venta ya está anulada" : "Click para anular"}
                          className={`inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full transition
                            ${
                              isAnnulled
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }
                            ${
                              isUpdating || isAnnulled
                                ? "opacity-60 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
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
        </motion.div>

        <Paginator
          currentPage={currentPage}
          perPage={perPage}
          totalPages={totalPages}
          filteredLength={filtered.length}
          goToPage={goToPage}
        />

        <SaleDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      </div>
    </>
  );
}
