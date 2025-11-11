// helpers/exportToPdf.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPdf = (clients = []) => {
  const doc = new jsPDF();

  // Título
  doc.setFontSize(16);
  doc.text("Listado de clientes", 14, 18);

  // Cabeceras de tabla
  const head = [
    ["ID", "Nombre", "Documento", "Correo", "Teléfono", "Estado", "Fecha"],
  ];

  // Filas
  const body = clients.map((c) => [
    c.id === 0 ? "C000" : c.id,
    c.nombre || "",
    `${c.tipoDocumento || ""} ${c.numeroDocumento || ""}`.trim(),
    c.correo?.trim() || "N/A",
    c.telefono?.trim() || "N/A",
    c.activo ? "Activo" : "Inactivo",
    c.fecha || "",
  ]);

  doc.autoTable({
    startY: 24,
    head,
    body,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      // verde suave tipo tu app
      fillColor: [22, 163, 74],
    },
  });

  doc.save("clientes.pdf");
};
