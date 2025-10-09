// clients/helpers/exportToXls.js
import * as XLSX from "xlsx";

export const exportToXls = (data, fileName = "Clientes.xlsx") => {
  if (!data || !data.length) return;

  // Formatear datos: reemplazar campos vacíos por "N/A"
  const formatted = data.map((c) => ({
    ID: c.id,
    Nombre: c.nombre,
    "Tipo Documento": c.tipoDocumento || "N/A",
    "Número Documento": c.numeroDocumento || "N/A",
    Correo: c.correo?.trim() || "N/A",
    Teléfono: c.telefono?.trim() || "N/A",
    Estado: c.estado,
    Fecha: c.fecha,
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");

  XLSX.writeFile(wb, fileName);
};
