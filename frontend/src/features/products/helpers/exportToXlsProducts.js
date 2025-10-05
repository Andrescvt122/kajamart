import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
      worksheet.addRow({
        id: p.id,
        barcode: p.barcode,
        vencimiento: p.vencimiento,
        cantidad: p.cantidad,
        consumido: p.consumido,
        precio: p.precio,
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
