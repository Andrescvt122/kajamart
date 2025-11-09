// src/pages/clients/helpers/exportToPdf.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPdf = (data, fileName = "Clientes.pdf") => {
  const doc = new jsPDF();

  const headers = [
    "ID",
    "Nombre",
    "Tipo Documento",
    "Número Documento",
    "Correo",
    "Teléfono",
    "Estado",
    "Fecha",
  ];

  const rows = data.length
    ? data.map((c) => [
        c.id || "N/A",
        c.nombre || "N/A",
        c.tipoDocumento || "N/A",
        c.numeroDocumento || "N/A",
        c.correo?.toString().trim() || "N/A",
        c.telefono?.toString().trim() || "N/A",
        c.estado || "N/A",
        c.fecha || "N/A",
      ])
    : [["N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"]];

  doc.setFontSize(16);
  doc.text("Listado de Clientes", 14, 15);

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 25,
    theme: "grid",
    headStyles: {
      fillColor: [46, 204, 113], // Verde suave
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 20 }, // ID
      1: { cellWidth: 35 }, // Nombre
      2: { cellWidth: 25 }, // Tipo Doc
      3: { cellWidth: 30 }, // Número Doc
      4: { cellWidth: 35 }, // Correo
      5: { cellWidth: 25 }, // Teléfono
      6: { cellWidth: 20 }, // Estado
      7: { cellWidth: 25 }, // Fecha
    },
    styles: {
      halign: "center",
    },
    headStyles: {
      halign: "center",
    },
  });

  doc.save(fileName);
};