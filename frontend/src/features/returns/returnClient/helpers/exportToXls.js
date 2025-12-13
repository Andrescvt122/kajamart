import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Datos de prueba (igual que en PDF)
const baseReturns = [];
for (let i = 1; i <= 44; i++) {
  baseReturns.push({
    idReturn: i,
    products: [
      { idProduct: 1, name: "Producto A", quantity: 2, price: 100, discount: true, reason: "Cerca de vencer", supplier: "Proveedor A" },
      { idProduct: 2, name: "Producto B", quantity: 1, price: 200, discount: false, reason: "Vencido", supplier: "Proveedor B" },
      { idProduct: 3, name: "Producto C", quantity: 3, price: 150, discount: true, reason: "Cerca de vencer", supplier: "Proveedor C" },
      { idProduct: 4, name: "Producto D", quantity: 5, price: 50, discount: false, reason: "Vencido", supplier: "Proveedor D" },
      { idProduct: 5, name: "Producto E", quantity: 1, price: 300, discount: true, reason: "Cerca de vencer", supplier: "Proveedor E" },
      { idProduct: 6, name: "Producto F", quantity: 2, price: 250, discount: false, reason: "Vencido", supplier: "Proveedor F" },
    ],
    dateReturn: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
    responsable: `Empleado ${i}`,
  });
}

const getFlattenedProducts = () =>
  baseReturns.flatMap((returnItem) =>
    returnItem.products.map((product) => ({
      Devolución: `#${returnItem.idReturn.toString().padStart(4, "0")}`,
      Producto: product.name,
      Cantidad: product.quantity,
      Precio: `$${product.price}`,
      Descuento: product.discount ? "Sí" : "No",
      Motivo: product.reason,
      Proveedor: product.supplier,
      Responsable: returnItem.responsable,
      Fecha: returnItem.dateReturn,
    }))
  );

// Función principal
export const generateProductReturnsXLS = async () => {
  try {
    const products = getFlattenedProducts();

    // Crear libro y hoja
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Devoluciones");

    // ---- Colores estilo PDF ----
    const mintGreen = "90EE90";     // verde menta claro
    const mintGreenDark = "66BB6A"; // verde menta oscuro
    const lightMint = "F0FFF0";     // verde menta muy claro

    // Título grande
    sheet.mergeCells("A1:I1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Devoluciones de Productos";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: mintGreenDark },
    };
    sheet.getRow(1).height = 25;

    // Subtítulo con info
    sheet.mergeCells("A2:I2");
    sheet.getCell("A2").value =
      `Generado el: ${new Date().toLocaleDateString()} - Total productos: ${products.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados de tabla
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

    // Filas con datos
    products.forEach((product, index) => {
      const row = sheet.addRow(Object.values(product));
      row.alignment = { vertical: "middle", horizontal: "left" };

      // Filas alternadas en verde claro
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

    // Ajustar ancho de columnas
    sheet.columns.forEach((col, i) => {
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
      `devoluciones-productos-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  } catch (error) {
    console.error("Error generando XLS:", error);
    alert("Error generando el archivo Excel. Por favor, inténtalo de nuevo.");
  }
};

export default generateProductReturnsXLS;
