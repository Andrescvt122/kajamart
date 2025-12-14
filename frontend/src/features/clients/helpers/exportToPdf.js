import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPdf = (clients = []) => {
  console.log("🔹 exportToPdf llamado con", clients.length, "clientes");

  if (!Array.isArray(clients) || clients.length === 0) {
    alert("No hay clientes para exportar");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Listado de clientes", 14, 18);

  const head = [
    ["ID", "Nombre", "Documento", "Correo", "Teléfono", "Estado"],
  ];

  const body = clients.map((c) => [
    c.id === 0 ? "C000" : c.id,
    c.nombre || "",
    `${c.tipoDocumento || ""} ${c.numeroDocumento || ""}`.trim(),
    c.correo?.trim() || "N/A",
    c.telefono?.trim() || "N/A",
    c.activo ? "Activo" : "Inactivo",
  ]);

  autoTable(doc, {
    startY: 24,
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [22, 163, 74], textColor: 255 },
  });

  doc.save("clientes.pdf");
};