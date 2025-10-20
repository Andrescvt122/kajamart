// clients/helpers/exportToPdf.js
import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToPdf = (data, fileName = "Clientes.pdf") => {
  if (!data || !data.length) return;

  const doc = new jsPDF();

  const rows = data.map((c) => [
    c.id,
    c.nombre,
    c.tipoDocumento || "N/A",
    c.numeroDocumento || "N/A",
    c.correo?.trim() || "N/A",
    c.telefono?.trim() || "N/A",
    c.estado,
    c.fecha,
  ]);

  doc.autoTable({
    head: [
      [
        "ID",
        "Nombre",
        "Tipo Documento",
        "Número Documento",
        "Correo",
        "Teléfono",
        "Estado",
        "Fecha",
      ],
    ],
    body: rows,
    startY: 20,
    theme: "grid",
    headStyles: { fillColor: [46, 204, 113] },
  });

  doc.save(fileName);
};
