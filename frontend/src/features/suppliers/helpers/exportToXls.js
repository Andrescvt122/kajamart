// src/features/suppliers/helpers/exportToXls.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --------------------
// Datos quemados
// --------------------
const suppliersData = [
  {
    nit: "900123456",
    nombre: "Distribuidora Alimentos S.A.",
    contacto: "Carlos Pérez",
    telefono: "3001234567",
    correo: "contacto@distribuidora.com",
    direccion: "Cra 45 #12-34",
    estado: "Activo",
    tipoPersona: "Jurídica",
    productos: [
      { categoria: "Lácteos" },
      { categoria: "Snacks" },
    ],
  },
  {
    nit: "901987654",
    nombre: "Carnes del Norte",
    contacto: "Ana Torres",
    telefono: "3105556677",
    correo: "ventas@carnesnorte.com",
    direccion: "Cll 23 #45-12",
    estado: "Inactivo",
    tipoPersona: "Natural",
    productos: [
      { categoria: "Carnes" },
    ],
  },
];

// --------------------
// Generar Excel
// --------------------
export const exportSuppliersToExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Proveedores");

    const mintGreenDark = "66BB6A";
    const lightMint = "F0FFF0";

    // Título
    sheet.mergeCells("A1:I1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Reporte de Proveedores";
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
    sheet.getCell("A2").value = `Generado el: ${new Date().toLocaleDateString()} - Total registros: ${suppliersData.length}`;
    sheet.getCell("A2").font = { italic: true, color: { argb: "555555" } };
    sheet.getCell("A2").alignment = { horizontal: "center" };

    // Encabezados
    const headers = [
      "NIT",
      "Nombre",
      "Contacto",
      "Teléfono",
      "Correo",
      "Dirección",
      "Estado",
      "Tipo Persona",
      "Categorías",
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
    suppliersData.forEach((s, idx) => {
      const categorias = Array.isArray(s.productos)
        ? [...new Set(s.productos.map((p) => p.categoria))].join(", ")
        : "—";

      const row = sheet.addRow([
        s.nit,
        s.nombre,
        s.contacto,
        s.telefono,
        s.correo,
        s.direccion,
        s.estado,
        s.tipoPersona,
        categorias,
      ]);

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
    saveAs(
      new Blob([buffer]),
      `proveedores-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  } catch (err) {
    console.error("Error generando XLS:", err);
    alert("Error generando Excel");
  }
};

export default exportSuppliersToExcel;
