import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --------------------
// Utilidades
// --------------------
const formatDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toISOString().split("T")[0];
};

const flattenProductLows = (lows = []) => {
  if (!Array.isArray(lows)) return [];

  return lows.flatMap((low) => {
    const baseInfo = {
      idLow: low?.idLow ?? "",
      dateLow: formatDate(low?.dateLow),
      responsible: low?.responsible ?? "",
    };

    if (low?.currentProduct) {
      const product = low.currentProduct;
      return [
        {
          ...baseInfo,
          productName: product?.name ?? "",
          lowQuantity: product?.lowQuantity ?? "",
          reason: product?.reason ?? "",
        },
      ];
    }

    if (Array.isArray(low?.products) && low.products.length > 0) {
      return low.products.map((product) => ({
        ...baseInfo,
        productName: product?.name ?? "",
        lowQuantity: product?.lowQuantity ?? "",
        reason: product?.reason ?? "",
      }));
    }

    return [
      {
        ...baseInfo,
        productName: "",
        lowQuantity: "",
        reason: "",
      },
    ];
  });
};

// --------------------
// Función principal
// --------------------
export const generateProductLowsXLS = async (lows = []) => {
  try {
    const products = flattenProductLows(lows);

    if (products.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Crear libro y hoja
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Bajas");

    // ---- Colores estilo PDF ----
    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    // Título
    sheet.mergeCells("A1:F1");
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
    sheet.mergeCells("A2:F2");
    sheet.getCell("A2").value = `Generado el: ${new Date().toLocaleDateString()} - Total registros: ${products.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados
    const headers = [
      "ID Baja",
      "Fecha",
      "Producto",
      "Cant. Baja",
      "Motivo",
      "Responsable",
    ];
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
      const row = sheet.addRow([
        `#${product.idLow}`,
        product.dateLow,
        product.productName,
        product.lowQuantity,
        product.reason,
        product.responsible,
      ]);
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
