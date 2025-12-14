import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Exporta categorías a un archivo Excel usando los datos reales del hook.
 * @param {Array} categories - Array de objetos { id_categoria, nombre, descripcion, estado }
 */
export const exportCategoriesToExcel = async (categories = []) => {
  try {
    // Validar datos
    if (!Array.isArray(categories) || categories.length === 0) {
      alert("No hay datos disponibles para exportar.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Categorías");

    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    // ────────────── ENCABEZADO ──────────────
    sheet.mergeCells("A1:D1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Categorías";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: mintGreenDark },
    };
    sheet.getRow(1).height = 25;

    // Subtítulo con fecha y total
    sheet.mergeCells("A2:D2");
    sheet.getCell("A2").value = `Generado el: ${new Date().toLocaleDateString()} - Total registros: ${categories.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // ────────────── CABECERAS ──────────────
    const headers = ["ID", "Nombre", "Descripción", "Estado"];
    sheet.addRow(headers);
    const headerRow = sheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: mintGreenDark },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "DDDDDD" } },
        left: { style: "thin", color: { argb: "DDDDDD" } },
        bottom: { style: "thin", color: { argb: "DDDDDD" } },
        right: { style: "thin", color: { argb: "DDDDDD" } },
      };
    });

    // ────────────── DATOS ──────────────
    categories.forEach((c, idx) => {
      const id = c.id_categoria || c.id || "";
      const nombre = c.nombre || "";
      const descripcion = c.descripcion || "";
      const estado = c.estado || "";
      const row = sheet.addRow([id, nombre, descripcion, estado]);

      // Fondo alterno para filas pares
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: lightMint },
          };
        });
      }
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      });
    });

    // ────────────── AJUSTE DE COLUMNAS ──────────────
    sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = Math.max(12, maxLength + 2);
    });

    // ────────────── EXPORTAR ──────────────
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `categorias_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  } catch (err) {
    console.error("Error generando Excel:", err);
    alert("Error generando Excel. Consulta la consola para más detalles.");
  }
};

export default exportCategoriesToExcel;