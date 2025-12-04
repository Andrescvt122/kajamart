// src/features/sales/helper/exportSaleReceiptPDF.js
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

// toma el primer valor "usable"
const pick = (...vals) => {
  for (const v of vals) {
    if (v === 0) return 0;
    if (v !== null && v !== undefined && String(v).trim() !== "") return v;
  }
  return undefined;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Normaliza productos desde lo que devuelve tu API (detalle_venta con joins)
const extractItems = (sale) => {
  const det = Array.isArray(sale?.detalle_venta) ? sale.detalle_venta : null;

  if (det && det.length) {
    return det.map((d) => {
      const nombre =
        pick(
          d?.detalle_productos?.productos?.nombre,
          d?.detalle_productos?.nombre,
          d?.productos?.nombre,
          d?.producto?.nombre,
          d?.nombre
        ) || "Sin nombre";

      const cantidad = toNumber(pick(d?.cantidad, d?.cant, d?.qty));
      const precioUnitario = toNumber(
        pick(d?.precio_unitario, d?.precioUnitario, d?.precio, d?.valor_unitario, 0)
      );
      const subtotal = toNumber(pick(d?.subtotal, cantidad * precioUnitario));

      return { nombre, cantidad, precioUnitario, subtotal };
    });
  }

  const prods = Array.isArray(sale?.productos) ? sale.productos : null;
  if (prods && prods.length) {
    return prods.map((p) => {
      const nombre =
        pick(p?.nombre, p?.producto, p?.productos?.nombre) || "Sin nombre";
      const cantidad = toNumber(pick(p?.cantidad, p?.cant, p?.qty));
      const precioUnitario = toNumber(
        pick(p?.precioUnitario, p?.precio_unitario, p?.precio, 0)
      );
      const subtotal = toNumber(pick(p?.subtotal, cantidad * precioUnitario));
      return { nombre, cantidad, precioUnitario, subtotal };
    });
  }

  return [];
};

export function exportSaleReceiptPDF({
  sale,
  filename = `recibo_venta_${new Date().toISOString().slice(0, 10)}.pdf`,
  empresa = "KAJAMART",
  nit = "", // ✅ ahora sí existe
  direccion = "Crr49a Num47a 122",
  telefono = "3161194195",
}) {
  if (!sale) return;

  // Ticket ~80mm (226pt). Alto dinámico.
  const pageWidth = 226;
  const marginX = 10;

  const idVenta = pick(sale?.id_venta, sale?.id) ?? "";
  const fecha = formatDate(pick(sale?.fecha_venta, sale?.fecha, sale?.createdAt));
  const medioPago = pick(sale?.metodo_pago, sale?.medioPago, sale?.metodoPago) ?? "";
  const estado = pick(sale?.estado_venta, sale?.estado) ?? "";

  const cliente =
    pick(
      sale?.clientes?.nombre_cliente,
      sale?.clientes?.nombre,
      sale?.cliente,
      sale?.nombre_cliente
    ) || "Cliente de Caja";

  const items = extractItems(sale);
  const totalPorProductos = items.reduce((acc, it) => acc + toNumber(it.subtotal), 0);
  const total = toNumber(pick(sale?.total, totalPorProductos));

  // ✅ Altura dinámica REAL (basada en líneas)
  const tmp = new jsPDF({ unit: "pt", format: [pageWidth, 500] });
  tmp.setFont("helvetica", "normal");
  tmp.setFontSize(9);

  const usableWidth = pageWidth - marginX * 2;

  const headerLines =
    7 + // empresa + (nit?) + dir + tel + 4 líneas info + separadores aproximados
    (nit ? 1 : 0);

  const itemLines = items.length
    ? items.reduce((sum, it) => {
        const nameLines = tmp.splitTextToSize(String(it.nombre), usableWidth).length;
        return sum + nameLines + 2; // +2 por línea "cant x unit" y espacio
      }, 0)
    : 2;

  const footerLines = 6;
  const totalLines = 3;

  const lineHeight = 11;
  const padding = 70;

  const pageHeight =
    (headerLines + itemLines + totalLines + footerLines) * lineHeight + padding;

  const doc = new jsPDF({
    unit: "pt",
    format: [pageWidth, Math.max(260, pageHeight)],
  });

  let y = 16;

  const centerText = (txt, yPos, size = 11, bold = true) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const w = doc.getTextWidth(txt);
    doc.text(txt, (pageWidth - w) / 2, yPos);
  };

  const leftText = (txt, yPos, size = 9, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(String(txt), marginX, yPos);
  };

  const rightText = (txt, yPos, size = 9, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const w = doc.getTextWidth(String(txt));
    doc.text(String(txt), pageWidth - marginX - w, yPos);
  };

  const hr = () => {
    doc.setDrawColor(180);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 10;
  };

  // =========================
  // Header
  // =========================
  centerText(empresa, y, 12, true);
  y += 14;

  if (nit) {
    centerText(`NIT: ${nit}`, y, 9, false);
    y += 12;
  }
  if (direccion) {
    centerText(direccion, y, 9, false);
    y += 12;
  }
  if (telefono) {
    centerText(`Tel: ${telefono}`, y, 9, false);
    y += 12;
  }

  hr();

  leftText(`Venta: #${idVenta}`, y);
  y += 12;

  leftText(`Fecha: ${fecha}`, y);
  y += 12;

  // cliente multiline por si es largo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const clienteLines = doc.splitTextToSize(`Cliente: ${cliente}`, usableWidth);
  clienteLines.forEach((ln) => {
    leftText(ln, y, 9, false);
    y += 11;
  });

  leftText(`Pago: ${medioPago}`, y);
  y += 12;

  leftText(`Estado: ${estado}`, y);
  y += 6;

  hr();

  // =========================
  // Items
  // =========================
  leftText("PRODUCTO", y, 9, true);
  y += 11;

  leftText("Cant x Unit", y, 8, false);
  rightText("Subtotal", y, 8, false);
  y += 8;

  hr();

  if (!items.length) {
    leftText("Sin items", y);
    y += 16;
  } else {
    items.forEach((it) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const nameLines = doc.splitTextToSize(String(it.nombre), usableWidth);
      nameLines.forEach((ln) => {
        leftText(ln, y, 9, false);
        y += 11;
      });

      leftText(`${it.cantidad} x ${formatMoney(it.precioUnitario)}`, y, 8, false);
      rightText(formatMoney(it.subtotal), y, 9, true);
      y += 14;
    });
  }

  hr();

  // =========================
  // Totales
  // =========================
  leftText("TOTAL:", y, 10, true);
  rightText(formatMoney(total), y, 10, true);
  y += 16;

  hr();

  centerText("¡Gracias por su compra!", y, 9, false);
  y += 12;
  centerText("Vuelva pronto", y, 9, false);

  doc.save(filename);
}
