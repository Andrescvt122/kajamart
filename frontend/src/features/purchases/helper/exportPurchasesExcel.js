import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const onlyDate = (v) => (v ? String(v).slice(0, 10) : "—");
const moneyNumber = (v) => Number(v || 0);

export async function exportPurchasesToExcel(purchases, filename = "compras.xlsx") {
  const data = (purchases || []).map((p) => ({
    "N° Factura": p.factura ?? "—",
    Proveedor: p.proveedor ?? "—",
    NIT: p.nit ?? "—",
    Total: moneyNumber(p.total),
    Fecha: onlyDate(p.fecha),
    Estado: p.estado ?? "—",
    "Cantidad ítems": Array.isArray(p.productos) ? p.productos.length : 0,
  }));

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Compras");

  worksheet.columns = [
    { header: "N° Factura", key: "N° Factura", width: 16 },
    { header: "Proveedor", key: "Proveedor", width: 28 },
    { header: "NIT", key: "NIT", width: 16 },
    { header: "Total", key: "Total", width: 14 },
    { header: "Fecha", key: "Fecha", width: 12 },
    { header: "Estado", key: "Estado", width: 14 },
    { header: "Cantidad ítems", key: "Cantidad ítems", width: 14 },
  ];

  data.forEach((row) => worksheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, filename);
}
