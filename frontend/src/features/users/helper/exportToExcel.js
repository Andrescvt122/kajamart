import * as XLSX from "xlsx";

/**
 * Exporta un array de objetos a un archivo Excel.
 * @param {Array<Object>} data - El array de datos a exportar.
 * @param {string} fileName - El nombre del archivo (sin extensión).
 * @param {string} sheetName - El nombre de la hoja de cálculo.
 */
export const exportToExcel = (data, fileName, sheetName = "Datos") => {
  if (!data || data.length === 0) {
    console.error("No hay datos para exportar a Excel.");
    return;
  }

  // Crear una hoja de trabajo a partir de los datos
  const worksheet = XLSX.utils.json_to_sheet(data);
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();
  // Añadir la hoja de trabajo al libro
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  // Escribir y descargar el archivo
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};