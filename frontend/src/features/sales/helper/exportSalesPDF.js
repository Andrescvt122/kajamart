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

export function exportSalesToPDF({ rows = [], filename = "ventas.pdf" }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = {
    top: 90,
    bottom: 60,
    left: 40,
    right: 40,
  };

  // Datos de tabla
  const head = [
    ["ID Venta", "Fecha", "Cliente", "Total", "Medio de Pago", "Estado"],
  ];

  const body = rows.map((v) => [
    v.id,
    v.fecha,
    v.cliente,
    formatMoney(v.total),
    v.medioPago,
    v.estado,
  ]);

  // Total general
  const totalCop = rows.reduce((acc, x) => acc + Number(x.total || 0), 0);

  body.push([
    "",
    "",
    "Totales",
    formatMoney(totalCop),
    "",
    "",
  ]);

  doc.autoTable({
    head,
    body,
    startY: margin.top,
    margin,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 6,
      halign: "left",
      valign: "middle",
    },
    headStyles: {
      fillColor: [22, 163, 74], // verde
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [55, 65, 81], // gris oscuro
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // gris muy claro
    },
    columnStyles: {
      0: { cellWidth: 70 },  // ID Venta
      1: { cellWidth: 70 },  // Fecha
      2: { cellWidth: 140 }, // Cliente
      3: { cellWidth: 80 },  // Total
      4: { cellWidth: 90 },  // Medio de Pago
      5: { cellWidth: 70 },  // Estado
    },
    didParseCell: (data) => {
      // Última fila (totales) → resaltada
      if (data.section === "body" && data.row.index === body.length - 1) {
        data.cell.styles.fillColor = [240, 253, 244]; // verde muy claro
        data.cell.styles.fontStyle = "bold";
      }
    },
    didDrawPage: (data) => {
      // Encabezado
      doc.setFillColor(22, 163, 74); // verde
      doc.rect(0, 0, pageWidth, 60, "F");

      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("Reporte de Ventas", margin.left, 30);

      doc.setFontSize(10);
      const fechaStr = new Date().toLocaleString("es-CO");
      doc.text(`Generado: ${fechaStr}`, margin.left, 46);

      // Puedes poner aquí el nombre de la empresa, NIT, etc.
      // doc.text("Mi Empresa S.A.S - NIT 900000000", margin.left, 58);

      // Footer: número de página
      const pageStr = `Página ${data.pageNumber}`;
      doc.setFontSize(9);
      doc.setTextColor(150);
      const textWidth = doc.getTextWidth(pageStr);
      doc.text(
        pageStr,
        pageWidth - margin.right - textWidth,
        pageHeight - 20
      );
    },
  });

  doc.save(filename);
}
