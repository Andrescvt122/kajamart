import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return `$${amount.toLocaleString("es-CO")}`;
};

const mapRows = (rows = []) =>
  rows.map((row) => ({
    Devolución: `#${(row.idReturn ?? "").toString().padStart(4, "0")}`,
    Venta: row.idSale ?? "",
    Cliente: row.client || "",
    Producto: row.name || "",
    Cantidad: row.quantity ?? "",
    Precio: formatMoney(row.price),
    Motivo: row.reason || "",
    Proveedor: row.supplier || "Sin proveedor",
    Responsable: row.responsable || "",
    Fecha: row.dateReturn || "",
  }));

export const generateProductReturnsXLS = async (rows = []) => {
  try {
    const products = mapRows(rows);

    if (products.length === 0) {
      alert("No hay datos de devoluciones para exportar.");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Devoluciones");
    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    sheet.mergeCells("A1:J1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Devoluciones de Clientes";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: mintGreenDark },
    };
    sheet.getRow(1).height = 25;

    sheet.mergeCells("A2:J2");
    sheet.getCell("A2").value =
      `Generado el: ${new Date().toLocaleDateString()} - Total registros: ${products.length}`;
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
      const row = sheet.addRow(Object.values(product));
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

    sheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, value.length);
      });
      column.width = maxLength < 12 ? 12 : maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `devoluciones-clientes-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  } catch (error) {
    console.error("Error generando XLS:", error);
    alert("Error generando el archivo Excel. Por favor, inténtalo de nuevo.");
  }
};

export default generateProductReturnsXLS;
