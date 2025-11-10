import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --------------------
// Normalizador (backend -> front -> Excel)
// --------------------
const normalizeSuppliers = (suppliers = []) =>
  (Array.isArray(suppliers) ? suppliers : []).map((s) => {
    const nit = s.nit ?? "";
    const nombre = s.nombre ?? "";
    const contacto = s.contacto ?? "";
    const telefono = s.telefono ?? "";
    const correo = s.correo ?? "";
    const direccion = s.direccion ?? "";
    const estado =
      typeof s.estado === "boolean" ? (s.estado ? "Activo" : "Inactivo") : (s.estado ?? "");
    const tipoPersona = s.tipo_persona ?? s.tipoPersona ?? "";

    // Categorías: soporta [{nombre_categoria}] o [{nombre}]
    const categorias = Array.isArray(s.categorias)
      ? [...new Set(s.categorias
          .map((c) => c?.nombre_categoria || c?.nombre || "")
          .filter(Boolean))]
          .join(", ")
      : "—";

    return { nit, nombre, contacto, telefono, correo, direccion, estado, tipoPersona, categorias };
  });

// --------------------
// Generar Excel con datos reales
// --------------------
export const exportSuppliersToExcel = async (suppliers = []) => {
  try {
    const data = normalizeSuppliers(suppliers);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Proveedores");

    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    // Título
    sheet.mergeCells("A1:I1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Proveedores";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: mintGreenDark } };
    sheet.getRow(1).height = 25;

    // Subtítulo
    sheet.mergeCells("A2:I2");
    sheet.getCell("A2").value = `Generado el: ${new Date().toLocaleDateString()} - Total registros: ${data.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados
    const headers = [
      "NIT",
      "Nombre",
      "Contacto",
      "Teléfono",
      "Correo",
      "Dirección",
      "Estado",
      "Tipo Persona",
      "Categorías",
    ];
    sheet.addRow(headers);
    const headerRow = sheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: mintGreenDark } };
      cell.border = {
        top: { style: "thin", color: { argb: "DDDDDD" } },
        left: { style: "thin", color: { argb: "DDDDDD" } },
        bottom: { style: "thin", color: { argb: "DDDDDD" } },
        right: { style: "thin", color: { argb: "DDDDDD" } },
      };
    });

    // Datos
    data.forEach((s, idx) => {
      // escribe como string para no perder ceros a la izquierda
      const row = sheet.addRow([
        String(s.nit ?? ""),
        String(s.nombre ?? ""),
        String(s.contacto ?? ""),
        String(s.telefono ?? ""),
        String(s.correo ?? ""),
        String(s.direccion ?? ""),
        String(s.estado ?? ""),
        String(s.tipoPersona ?? ""),
        String(s.categorias ?? "—"),
      ]);

      // wrap y bordes suaves
      row.eachCell((cell) => {
        cell.alignment = { vertical: "top", wrapText: true };
        cell.border = {
          top: { style: "thin", color: { argb: "EEEEEE" } },
          left: { style: "thin", color: { argb: "EEEEEE" } },
          bottom: { style: "thin", color: { argb: "EEEEEE" } },
          right: { style: "thin", color: { argb: "EEEEEE" } },
        };
      });

      // Cebrado
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: lightMint } };
        });
      }
    });

    // Auto ancho columnas (con mínimo)
    sheet.columns.forEach((col) => {
      let maxLength = 10;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = Math.min(Math.max(maxLength + 2, 12), 50);
    });

    // Fila de filtros (opcional)
    sheet.autoFilter = {
      from: "A3",
      to: "I3",
    };

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `proveedores-${new Date().toISOString().split("T")[0]}.xlsx`);
  } catch (err) {
    console.error("Error generando XLS:", err);
    alert("Error generando Excel");
  }
};


export default exportSuppliersToExcel;