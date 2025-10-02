import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// Datos de prueba
const baseReturns = [];
for (let i = 1; i <= 44; i++) {
  const reasons = [
    "Producto dañado",
    "Producto vencido",
    "Producto incorrecto",
    "Producto no requerido",
  ];
  const reason = reasons[i % reasons.length];

  const pickStatus = (reason) => {
    if (reason === "Producto dañado") return "N/A";
    const r = Math.random();
    if (r < 0.45) return "a proveedor";
    if (r < 0.8) return "completado";
    if (r < 0.95) return "registrado";
    return "rechazado";
  };

  const statusSuppliers = pickStatus(reason);

  baseReturns.push({
    idReturn: i,
    idSale: 100 + i,
    productsToReturn: [
      { idProduct: 1, name: "Producto A", quantity: 2, price: 100, reason, statusSuppliers },
      { idProduct: 2, name: "Producto B", quantity: 1, price: 200, reason, statusSuppliers },
      { idProduct: 3, name: "Producto C", quantity: 3, price: 150, reason, statusSuppliers },
    ],
    dateReturn: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
    client: `Cliente ${i}`,
    responsable: `Empleado ${i}`,
    typeReturn: i % 3 === 0 ? "Reembolso del dinero" : "Cambio por otro producto",
    total: Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000,
  });
}

const getFlattenedProducts = () =>
  baseReturns.flatMap((ret) =>
    ret.productsToReturn.map((prod) => ({
      Devolución: `#${ret.idReturn.toString().padStart(4, "0")}`,
      Venta: ret.idSale,
      Cliente: ret.client,
      Producto: prod.name,
      Cantidad: prod.quantity,
      Precio: `$${prod.price}`,
      Motivo: prod.reason,
      EstadoProveedor: prod.statusSuppliers,
      Tipo: ret.typeReturn,
      Total: `$${ret.total}`,
      Responsable: ret.responsable,
      Fecha: ret.dateReturn,
    }))
  );

// Función principal
export const generateProductReturnsXLS = async () => {
  try {
    const products = getFlattenedProducts();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Devoluciones");

    // Colores estilo PDF
    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    // Título
    sheet.mergeCells("A1:L1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Devoluciones de Productos";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: mintGreenDark } };
    sheet.getRow(1).height = 25;

    // Subtítulo
    sheet.mergeCells("A2:L2");
    sheet.getCell("A2").value =
      `Generado el: ${new Date().toLocaleDateString()} - Total productos: ${products.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados
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

    // Filas con datos
    products.forEach((product, index) => {
      const row = sheet.addRow(Object.values(product));
      row.alignment = { vertical: "middle", horizontal: "left" };

      // Alternar filas
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
