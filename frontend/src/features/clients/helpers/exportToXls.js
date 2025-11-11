// helpers/exportToXls.js
import * as XLSX from "xlsx";

export const exportToXls = (clients = []) => {
  // Adaptamos la data para el Excel
  const rows = clients.map((c, index) => ({
    "#": index + 1,
    ID: c.id === 0 ? "C000" : c.id,
    Nombre: c.nombre || "",
    Documento: `${c.tipoDocumento || ""} ${c.numeroDocumento || ""}`.trim(),
    Correo: c.correo?.trim() || "N/A",
    Teléfono: c.telefono?.trim() || "N/A",
    Estado: c.activo ? "Activo" : "Inactivo",
    Fecha: c.fecha || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

  XLSX.writeFile(workbook, "clientes.xlsx");
};
