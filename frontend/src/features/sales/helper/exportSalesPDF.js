// src/features/sales/helper/exportSalesPDF.js
// Requiere: npm i jspdf jspdf-autotable
import jsPDF from "jspdf";
import "jspdf-autotable";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatPercent = (part, whole) => {
  const p = Number(part);
  const w = Number(whole);
  if (!w || isNaN(p) || isNaN(w)) return "0%";
  const pct = (p / w) * 100;
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pct) + "%";
};

export function exportSalesToPDF({ rows = [], filename = "ventas.pdf" }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Título
  doc.setFontSize(16);
  doc.text("Reporte de Ventas", 40, 40);

  // Cabecera y cuerpo
  const head = [[
    "ID Venta",
    "Fecha",
    "Cliente",
    "Total",
    "Medio de Pago",
    "IVA (%)",
    "ICU (%)",
    "Estado",
  ]];

  const body = rows.map((v) => [
    v.id,
    v.fecha,
    v.cliente,
    formatMoney(v.total),
    v.medioPago,
    formatPercent(v.iva, v.total),
    formatPercent(v.icu, v.total),
    v.estado,
  ]);

  // Totales (opcional)
  const totalCop = rows.reduce((acc, x) => acc + Number(x.total || 0), 0);
  const totalIva = rows.reduce((acc, x) => acc + Number(x.iva || 0), 0);
  const totalIcu = rows.reduce((acc, x) => acc + Number(x.icu || 0), 0);

  body.push([
    "",
    "",
    "Totales",
    formatMoney(totalCop),
    "",
    rows.length ? formatPercent(totalIva, totalCop) : "0%",
    rows.length ? formatPercent(totalIcu, totalCop) : "0%",
    "",
  ]);

  doc.autoTable({
    head,
    body,
    startY: 60,
    styles: { fontSize: 9, cellPadding: 6, halign: "left", valign: "middle" },
    headStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 70 },
      2: { cellWidth: 120 },
      3: { cellWidth: 80 },
      4: { cellWidth: 90 },
      5: { cellWidth: 60 },
      6: { cellWidth: 60 },
      7: { cellWidth: 70 },
    },
  });

  doc.save(filename);
}
