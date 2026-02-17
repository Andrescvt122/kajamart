// src/pages/purchases/helper/exportPurchasesPdf.js
import jsPDF from "jspdf";
import "jspdf-autotable";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const onlyDate = (v) => (v ? String(v).slice(0, 10) : "—");

export function exportPurchasesToPdf({
  rows = [],
  filename = "compras.pdf",
} = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = {
    top: 90,
    bottom: 60,
    left: 40,
    right: 40,
  };

  const head = [["N° Factura", "Fecha", "Proveedor", "NIT", "Total", "Estado"]];

  const body = rows.map((p) => [
    p.factura ?? "—",
    onlyDate(p.fecha),
    p.proveedor ?? "—",
    p.nit ?? "—",
    formatMoney(p.total),
    p.estado ?? "—",
  ]);

  // Total general
  const totalCop = rows.reduce((acc, x) => acc + Number(x.total || 0), 0);

  body.push(["", "", "Totales", "", formatMoney(totalCop), ""]);

  doc.autoTable({
    head,
    body,
    startY: margin.top,
    margin,
    theme: "grid",

    styles: {
      fontSize: 9,
      cellPadding: 6,
      valign: "middle",
    },

    // ✅ HEADER (verde con texto blanco)
    headStyles: {
      fillColor: [22, 163, 74],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },

    // ✅ BODY (texto oscuro, visible)
    bodyStyles: {
      textColor: [55, 65, 81], // gris oscuro ✔
    },

    alternateRowStyles: {
      fillColor: [248, 250, 252], // gris claro
    },

    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 70 },
      2: { cellWidth: 160 },
      3: { cellWidth: 90 },
      4: { cellWidth: 90, halign: "right" },
      5: { cellWidth: 70 },
    },

    didParseCell: (data) => {
      // Fila de totales resaltada
      if (data.section === "body" && data.row.index === body.length - 1) {
        data.cell.styles.fillColor = [240, 253, 244];
        data.cell.styles.fontStyle = "bold";
      }
    },

    didDrawPage: (data) => {
      // Header verde
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, pageWidth, 60, "F");

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte de Compras", margin.left, 30);

      doc.setFontSize(10);
      doc.text(
        `Generado: ${new Date().toLocaleString("es-CO")}`,
        margin.left,
        46
      );

      // Footer
      const pageStr = `Página ${data.pageNumber}`;
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        pageStr,
        pageWidth - margin.right - doc.getTextWidth(pageStr),
        pageHeight - 20
      );
    },
  });

  doc.save(filename);
}
