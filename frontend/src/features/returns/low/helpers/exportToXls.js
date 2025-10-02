import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --------------------
// Datos de ejemplo
// --------------------
const baseLows = [];
for (let i = 1; i <= 44; i++) {
  baseLows.push({
    idLow: i,
    idDetailProduct: 100 + i,
    dateLow: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
    type: i % 3 === 0 ? "Reembolso del dinero" : "Cambio por otro producto",
    responsible: i % 3 === 0 ? "Arturo" : "Federico",
    cantidad: Math.floor(Math.random() * (5 - 1 + 1)) + 1,
    products: [
      {
        id: 1,
        name: "Producto A",
        lowQuantity: 2,
        quantity: 5,
        reason:
          i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",
      },
      {
        id: 2,
        name: "Producto B",
        lowQuantity: 1,
        quantity: 3,
        reason:
          i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",
      },
      {
        id: 3,
        name: "Producto C",
        lowQuantity: 4,
        quantity: 1,
        reason:
          i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",
      },
    ],
  });
}

// --------------------
// Aplanar para tabla
// --------------------
const getFlattenedProducts = () =>
  baseLows.flatMap((low) =>
    low.products.map((prod) => ({
      "ID Baja": `#${low.idLow}`,
      "ID Detalle": low.idDetailProduct,
      Fecha: low.dateLow,
      Tipo: low.type,
      Responsable: low.responsible,
      Producto: prod.name,
      "Cant. Baja": prod.lowQuantity,
      Stock: prod.quantity,
      Motivo: prod.reason,
    }))
  );

// --------------------
// Función principal
// --------------------
export const generateProductLowsXLS = async () => {
  try {
    const products = getFlattenedProducts();

    // Crear libro y hoja
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bajas");

    // ---- Colores estilo PDF ----
    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    // Título
    sheet.mergeCells("A1:I1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Bajas de Productos";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: mintGreenDark },
    };
    sheet.getRow(1).height = 25;

    // Subtítulo
    sheet.mergeCells("A2:I2");
    sheet.getCell("A2").value = `Generado el: ${new Date().toLocaleDateString()} - Total registros: ${products.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados
    const headers = Object.keys(products[0]);
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
    });

    // Datos
    products.forEach((product, idx) => {
      const row = sheet.addRow(Object.values(product));
      row.alignment = { vertical: "middle", horizontal: "left" };

      // Alternar color de filas
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: lightMint },
          };
        });
      }
    });

    // Ajustar ancho de columnas
    sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = maxLength < 12 ? 12 : maxLength + 2;
    });

    // Exportar
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `bajas-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  } catch (error) {
    console.error("Error generando XLS:", error);
    alert("Error generando el archivo Excel. Por favor, inténtalo de nuevo.");
  }
};

export default generateProductLowsXLS;
