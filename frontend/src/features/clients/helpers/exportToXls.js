// src/pages/clients/helpers/exportToXls.js
import * as XLSX from "xlsx";

export const exportToXls = (data, fileName = "Clientes.xlsx") => {
  // Siempre genera un archivo, incluso si no hay datos
  const formatted = data.length
    ? data.map((c) => ({
        ID: c.id || "N/A",
        Nombre: c.nombre || "N/A",
        "Tipo Documento": c.tipoDocumento || "N/A",
        "Número Documento": c.numeroDocumento || "N/A",
        Correo: c.correo?.toString().trim() || "N/A",
        Teléfono: c.telefono?.toString().trim() || "N/A",
        Estado: c.estado || "N/A",
        Fecha: c.fecha || "N/A",
      }))
    : [
        {
          ID: "N/A",
          Nombre: "N/A",
          "Tipo Documento": "N/A",
          "Número Documento": "N/A",
          Correo: "N/A",
          Teléfono: "N/A",
          Estado: "N/A",
          Fecha: "N/A",
        },
      ];

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");

  // Ajustar ancho de columnas (opcional)
  const colWidths = Object.keys(formatted[0]).map((key) => ({
    wch: Math.max(10, key.length + 2),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, fileName);
};