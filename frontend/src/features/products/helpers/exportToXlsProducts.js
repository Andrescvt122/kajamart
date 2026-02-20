import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const priceCellValue = (val) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return "";           // o "—"
  if (n === 1001) return "aun no asignado";
  return n; // número real para que Excel lo formatee como moneda
};
/**
 * Exportar productos a Excel
 * @param {Array} products - Lista de productos filtrados
 */
export const exportProductsToExcel = async (products = []) => {
  try {
    console.log("[exportProductsToExcel] invocado, productos:", products);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Productos");

    // Encabezados
    worksheet.columns = [
      { header: "ID Detalle", key: "id", width: 15 },
      { header: "Código de Barras", key: "barcode", width: 25 },
      { header: "Fecha Vencimiento", key: "vencimiento", width: 20 },
      { header: "Cantidad", key: "cantidad", width: 15 },
      { header: "Stock Consumido", key: "consumido", width: 20 },
      { header: "Precio", key: "precio", width: 15 },
    ];

    // Estilos encabezados
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF66BB6A" }, // Verde menta
      };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Agregar filas
    products.forEach((p) => {
      const row = worksheet.addRow({
        id: p.id,
        barcode: p.barcode,
        vencimiento: p.vencimiento,
        cantidad: p.cantidad,
        consumido: p.consumido,
        precio: priceCellValue(p.precio),
      });
    
      // Columna "Precio" = 6
      const priceCell = row.getCell(6);
    
      if (typeof priceCell.value === "number") {
        priceCell.numFmt = '"$"#,##0;[Red]-"$"#,##0';
      } else {
        // opcional: que se vea como texto "suave"
        priceCell.alignment = { vertical: "middle", horizontal: "center" };
        // priceCell.font = { italic: true, color: { argb: "FF888888" } };
      }
    
      // (Opcional) bordes y alineación para toda la fila
      row.eachCell((cell) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Descargar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `productos-${new Date().toISOString().split("T")[0]}.xlsx`);

    console.log("[exportProductsToExcel] Excel generado ✅");
  } catch (err) {
    console.error("Error generando Excel:", err);
    alert("Error generando Excel");
  }
};
