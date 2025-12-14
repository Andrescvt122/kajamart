// src/features/products/helpers/exportToXls.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Exporta productos a Excel con estilos
 * @param {Array} products
 */
export async function exportProductsToExcel(products = []) {
  if (!products || products.length === 0) {
    alert("No hay productos para exportar.");
    return;
  }

  try {
    console.log("[exportProductsToExcel] invocado, productos:", products);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Productos");

    // Estilo título
    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Reporte de Productos";
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "228B22" }, // verde
    };

    // Encabezados
    const headerRow = worksheet.addRow([
      "ID",
      "Nombre",
      "Categoría",
      "Stock Actual",
      "Stock Mínimo",
      "Stock Máximo",
      "Precio",
      "Estado",
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "228B22" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Filas con datos
    products.forEach((p, i) => {
      const row = worksheet.addRow([
        p.id,
        p.nombre,
        p.categoria,
        p.stockActual,
        p.stockMin,
        p.stockMax,
        p.precio,
        p.estado,
      ]);

      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Filas alternas con color
      if (i % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F0FFF0" }, // verde clarito
          };
        });
      }

      // Columna precio formato moneda
      row.getCell(7).numFmt = '"$"#,##0;[Red]-"$"#,##0';
    });

    worksheet.columns = [
      { key: "id", width: 12 },
      { key: "nombre", width: 25 },
      { key: "categoria", width: 20 },
      { key: "stockActual", width: 15 },
      { key: "stockMin", width: 15 },
      { key: "stockMax", width: 15 },
      { key: "precio", width: 15 },
      { key: "estado", width: 15 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `productos-${dateStr}.xlsx`;

    saveAs(new Blob([buffer]), filename);
    console.log(`[exportProductsToExcel] Excel generado: ${filename}`);
  } catch (err) {
    console.error("[exportProductsToExcel] Error:", err);
    alert("Error generando el Excel");
  }
}

export default exportProductsToExcel;
