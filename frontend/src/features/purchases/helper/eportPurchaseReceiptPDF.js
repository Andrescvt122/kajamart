// src/features/purchases/helper/exportPurchaseReceiptPDF.js
// Requiere: npm i jspdf
import jsPDF from "jspdf";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(value);
  }
};

// Normaliza productos desde tu compra
const extractItems = (purchase) => {
  const items = Array.isArray(purchase?.productos)
    ? purchase.productos
    : [];

  return items.map((p) => {
    const nombre = p?.nombre || "Sin nombre";

    const cantidad = Number(p?.cantidad_paquetes || 1);

    const precioUnitario = Number(p?.precioCompra || 0);

    const subtotal = cantidad * precioUnitario;

    return { nombre, cantidad, precioUnitario, subtotal };
  });
};

export function exportPurchaseReceiptPDF({
  purchase,
  filename = `recibo_compra_${new Date().toISOString().slice(0, 10)}.pdf`,
  empresa = "KAJAMART",
  nit = "",
  direccion = "Crr49a Num47a 122",
  telefono = "3161194195",
}) {
  if (!purchase) return;

  // Ticket tipo 80mm
  const pageWidth = 226;
  const marginX = 10;

  const factura = purchase?.factura ?? "";
  const fecha = formatDate(purchase?.fecha);

  const proveedor = purchase?.proveedor ?? "Proveedor";
  const proveedorNit = purchase?.nit ?? "";

  const items = extractItems(purchase);

  const total = Number(purchase?.total || 0);

  // Altura dinámica
  const doc = new jsPDF({
    unit: "pt",
    format: [pageWidth, 500],
  });

  let y = 16;
  const usableWidth = pageWidth - marginX * 2;

  const centerText = (txt, size = 11, bold = true) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const w = doc.getTextWidth(txt);
    doc.text(txt, (pageWidth - w) / 2, y);
    y += size + 4;
  };

  const leftText = (txt, size = 9, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(String(txt), marginX, y);
    y += size + 3;
  };

  const hr = () => {
    doc.setDrawColor(180);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 10;
  };

  // =========================
  // Header
  // =========================
  centerText(empresa, 12, true);

  if (nit) centerText(`NIT: ${nit}`, 9, false);

  centerText(direccion, 9, false);
  centerText(`Tel: ${telefono}`, 9, false);

  hr();

  leftText(`Compra: #${factura}`);
  leftText(`Fecha: ${fecha}`);

  leftText(`Proveedor: ${proveedor}`);
  leftText(`NIT: ${proveedorNit}`);

  hr();

  // =========================
  // Productos
  // =========================
  leftText("PRODUCTOS", 9, true);
  hr();

  if (!items.length) {
    leftText("Sin productos");
  } else {
    items.forEach((it) => {
      const lines = doc.splitTextToSize(it.nombre, usableWidth);
      lines.forEach((ln) => leftText(ln));

      leftText(
        `${it.cantidad} x ${formatMoney(it.precioUnitario)}`,
        8
      );

      leftText(`Subtotal: ${formatMoney(it.subtotal)}`, 8, true);

      y += 6;
    });
  }

  hr();

  // =========================
  // Total
  // =========================
  leftText("TOTAL:", 10, true);
  leftText(formatMoney(total), 10, true);

  hr();

  centerText("¡Gracias por su compra!", 9, false);
  centerText("Vuelva pronto", 9, false);

  console.log("GENERATED PDF...", filename);
  doc.save(filename);
  console.log("PDF descargado");
}
