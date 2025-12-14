import jsPDF from "jspdf";
import autoTable, { applyPlugin } from "jspdf-autotable";

// Aplica el plugin a la clase jsPDF
applyPlugin(jsPDF);

/**
 * Exporta un array de objetos a un archivo PDF.
 * @param {Array<Object>} data - El array de datos a exportar.
 * @param {Array<string>} headers - Un array con los nombres de las columnas.
 * @param {string} title - El título del documento.
 * @param {string} fileName - El nombre del archivo (sin extensión).
 */
export const exportToPdf = (data, headers, title, fileName) => {
  
  if (!data || data.length === 0) {
    console.error("No hay datos para exportar a PDF.");
    return;
  }

  const doc = new jsPDF();

  // Usar las cabeceras proporcionadas y mapear el cuerpo de los datos
  const head = [headers];
  const body = data.map((row) => Object.values(row));

  // Añadir título
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Añadir tabla
  doc.autoTable({
    startY: 30,
    head: head,
    body: body,
  });

  // Guardar el PDF
  doc.save(`${fileName}.pdf`);
  
};