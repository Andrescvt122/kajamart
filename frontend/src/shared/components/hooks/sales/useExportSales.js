import { useState } from "react";
import api from "../../../../api/axiosConfig";
import { exportSalesToExcel } from "../../../../features/sales/helper/exportSalesExcel";
import { exportSalesToPDF } from "../../../../features/sales/helper/exportSalesPDF";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().slice(0, 10);
};

const extractArray = (payload) =>
  Array.isArray(payload) ? payload : payload?.data || payload?.sales || payload?.ventas || [];

const mapSale = (sale) => {
  const idVenta = sale.id_venta ?? sale.id ?? "";
  const idCliente = sale?.id_cliente ?? null;
  const cliente =
    sale?.clientes?.nombre_cliente ??
    sale?.clientes?.nombre ??
    sale?.cliente ??
    (idCliente ? `Cliente #${idCliente}` : "Cliente de Caja");

  return {
    id: String(idVenta),
    fecha: formatDate(sale.fecha_venta ?? sale.fecha ?? ""),
    cliente,
    total: Number(sale.total || 0),
    medioPago: sale.metodo_pago ?? sale.medioPago ?? sale.metodoPago ?? "",
    estado: sale.estado_venta ?? sale.estado ?? "",
  };
};

const buildFilename = (prefix, ext) =>
  `${prefix}_${new Date().toISOString().slice(0, 10)}.${ext}`;

export const useExportSales = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllSales = async () => {
    const response = await api.get("/sales/all");
    return extractArray(response.data).map(mapSale);
  };

  const runExport = async (exporter, prefix, ext, transform) => {
    if (loading) return;

    setLoading(true);
    try {
      const rows = await fetchAllSales();
      const finalRows = typeof transform === "function" ? transform(rows) : rows;
      await exporter({
        rows: finalRows,
        filename: buildFilename(prefix, ext),
      });
    } catch (error) {
      console.error("Error exportando ventas:", error);
      alert("No se pudieron exportar las ventas.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    exportSalesExcel: ({ transform } = {}) =>
      runExport(exportSalesToExcel, "ventas", "xlsx", transform),
    exportSalesPdf: ({ transform } = {}) =>
      runExport(exportSalesToPDF, "ventas", "pdf", transform),
  };
};
