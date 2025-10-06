import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --------------------
// Datos quemados
// --------------------
const categoriesData = [
  { id: "CAT001", nombre: "Lácteos", descripcion: "Productos derivados de la leche como queso, yogurt y mantequilla.", estado: "Activo" },
  { id: "CAT002", nombre: "Carnes", descripcion: "Variedad de cortes de res, cerdo y pollo frescos.", estado: "Inactivo" },
  { id: "CAT003", nombre: "Bebidas", descripcion: "Jugos, aguas minerales, refrescos y bebidas energéticas.", estado: "Activo" },
  { id: "CAT004", nombre: "Snacks", descripcion: "Papas fritas, galletas, dulces y otros productos empacados.", estado: "Activo" },
];

// --------------------
// Generar Excel
// --------------------
export const exportCategoriesToExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Categorías");

    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    // Título
    sheet.mergeCells("A1:D1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Categorías";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: mintGreenDark },
    };
    sheet.getRow(1).height = 25;

    // Subtítulo
    sheet.mergeCells("A2:D2");
    sheet.getCell("A2").value = `Generado el: ${new Date().toLocaleDateString()} - Total registros: ${categoriesData.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados
    const headers = ["ID", "Nombre", "Descripción", "Estado"];
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
    categoriesData.forEach((c, idx) => {
      const row = sheet.addRow([c.id, c.nombre, c.descripcion, c.estado]);
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

    // Ajustar ancho columnas
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
    saveAs(new Blob([buffer]), `categorias-${new Date().toISOString().split("T")[0]}.xlsx`);
  } catch (err) {
    console.error("Error generando XLS:", err);
    alert("Error generando Excel");
  }
};

export default exportCategoriesToExcel;
