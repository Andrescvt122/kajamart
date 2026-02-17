import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const onlyDate = (v) => (v ? String(v).slice(0, 10) : "—");
const moneyNumber = (v) => Number(v || 0);

export function exportPurchasesToExcel(purchases, filename = "compras.xlsx") {
  const data = (purchases || []).map((p) => ({
    "N° Factura": p.factura ?? "—",
    Proveedor: p.proveedor ?? "—",
    NIT: p.nit ?? "—",
    Total: moneyNumber(p.total),
    Fecha: onlyDate(p.fecha),
    Estado: p.estado ?? "—",
    "Cantidad ítems": Array.isArray(p.productos) ? p.productos.length : 0,
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  ws["!cols"] = [
    { wch: 16 }, // factura
    { wch: 28 }, // proveedor
    { wch: 16 }, // nit
    { wch: 14 }, // total
    { wch: 12 }, // fecha
    { wch: 14 }, // estado
    { wch: 14 }, // items
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Compras");

  const arrayBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
}
