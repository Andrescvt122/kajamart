// src/features/sales/helper/exportSalesExcel.js
// Requiere: npm i xlsx file-saver
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export function exportSalesToExcel({ rows = [], filename = "ventas.xlsx" }) {
  const data = rows.map((v) => ({
    "ID Venta": v.id,
    Fecha: v.fecha,
    Cliente: v.cliente,
    Total: formatMoney(v.total),
    "Medio de Pago": v.medioPago,
    Estado: v.estado,
  }));

  // Totales (solo del total en COP)
  const totalCop = rows.reduce((acc, x) => acc + Number(x.total || 0), 0);

  data.push({
    "ID Venta": "",
    Fecha: "",
    Cliente: "Totales",
    Total: formatMoney(totalCop),
    "Medio de Pago": "",
    Estado: "",
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
}
