import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

export async function exportSalesToExcel({ rows = [], filename = "ventas.xlsx" }) {
  if (!rows || rows.length === 0) {
    console.warn("No hay datos para exportar");
    return;
  }

  const data = rows.map((v) => ({
    "ID Venta": v.id,
    Fecha: v.fecha,
    Cliente: v.cliente,
    Total: formatMoney(v.total),
    "Medio de Pago": v.medioPago,
    Estado: v.estado,
  }));

  const totalCop = rows.reduce((acc, x) => acc + Number(x.total || 0), 0);

  data.push({
    "ID Venta": "",
    Fecha: "",
    Cliente: "Totales",
    Total: formatMoney(totalCop),
    "Medio de Pago": "",
    Estado: "",
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Ventas");

  worksheet.columns = [
    { header: "ID Venta", key: "ID Venta", width: 14 },
    { header: "Fecha", key: "Fecha", width: 14 },
    { header: "Cliente", key: "Cliente", width: 28 },
    { header: "Total", key: "Total", width: 16 },
    { header: "Medio de Pago", key: "Medio de Pago", width: 20 },
    { header: "Estado", key: "Estado", width: 14 },
  ];

  data.forEach((row) => worksheet.addRow(row));

  try {
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      filename
    );
  } catch (error) {
    console.error("Error exportando Excel:", error);
  }
}