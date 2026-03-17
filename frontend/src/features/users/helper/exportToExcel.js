import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/**
 * Exporta un array de objetos a un archivo Excel.
 * @param {Array<Object>} data - El array de datos a exportar.
 * @param {string} fileName - El nombre del archivo (sin extensión).
 * @param {string} sheetName - El nombre de la hoja de cálculo.
 */
export const exportToExcel = async (data, fileName, sheetName = "Datos") => {
  if (!data || data.length === 0) {
    console.error("No hay datos para exportar a Excel.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = Object.keys(data[0]).map((key) => ({
    header: key,
    key,
    width: Math.max(14, String(key).length + 4),
  }));

  data.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${fileName}.xlsx`,
  );
};
