import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const normaliseValue = (value) => {
  if (value === null || value === undefined) return "";
  return value;
};

const hasDiscount = (value) => {
  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();
    return normalised === "true" || normalised === "1" || normalised === "si" || normalised === "sí";
  }
  return Boolean(value);
};

const mapProducts = (productsData = []) => {
  if (!Array.isArray(productsData)) return [];

  return productsData.map((product) => ({
    Devolución: `#${(product.idReturn ?? "").toString().padStart(4, "0")}`,
    Fecha: product.dateReturn || "",
    Producto: product.name || "",
    Cantidad: product.quantity ?? "",
    Descuento: hasDiscount(product.discount) ? "Sí" : "No",
    Motivo: product.reason || "",
    Categoría: product.category || "Sin categoría",
    Responsable: product.responsable || "",
  }));
};

export const generateProductReturnsXLS = async (productsData = []) => {
  try {
    const products = mapProducts(productsData);

    if (products.length === 0) {
      alert("No hay datos de devoluciones para exportar.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Devoluciones");

    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    sheet.mergeCells("A1:H1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Devoluciones de Productos";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: mintGreenDark } };
    sheet.getRow(1).height = 25;

    sheet.mergeCells("A2:H2");
    sheet.getCell("A2").value =
      `Generado el: ${new Date().toLocaleDateString()} - Total productos: ${products.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    const headers = Object.keys(products[0]);
    sheet.addRow(headers);

    const headerRow = sheet.getRow(3);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: mintGreenDark },
      };
    });

    products.forEach((product, index) => {
      const rowValues = Object.values(product).map((value) => normaliseValue(value));
      const row = sheet.addRow(rowValues);
      row.alignment = { vertical: "middle", horizontal: "left" };

      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: lightMint },
          };
        });
      }
    });

    sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = maxLength < 12 ? 12 : maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `devoluciones-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  } catch (err) {
    console.error("Error generando XLS:", err);
    alert("Error generando XLS");
  }
};

export default generateProductReturnsXLS;
