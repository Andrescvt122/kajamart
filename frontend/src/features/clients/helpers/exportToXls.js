import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToXls = async (clients = []) => {
  console.log("🔹 exportToXls llamado con", clients.length, "clientes");

  if (!Array.isArray(clients) || clients.length === 0) {
    alert("No hay clientes para exportar");
    return;
  }

  const rows = clients.map((c, index) => ({
    "#": index + 1,
    ID: c.id === 0 ? "C000" : c.id,
    Nombre: c.nombre || "",
    Documento: `${c.tipoDocumento || ""} ${c.numeroDocumento || ""}`.trim(),
    Correo: c.correo?.trim() || "N/A",
    "Teléfono": c.telefono?.trim() || "N/A",
    Estado: c.activo ? "Activo" : "Inactivo",
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Clientes");

  worksheet.columns = [
    { header: "#", key: "#", width: 8 },
    { header: "ID", key: "ID", width: 12 },
    { header: "Nombre", key: "Nombre", width: 24 },
    { header: "Documento", key: "Documento", width: 20 },
    { header: "Correo", key: "Correo", width: 30 },
    { header: "Teléfono", key: "Teléfono", width: 18 },
    { header: "Estado", key: "Estado", width: 14 },
  ];

  rows.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "clientes.xlsx");
};
