// src/features/suppliers/helpers/exportToPdf.js
import jsPDF from "jspdf";

const suppliersData = [
  {
    nit: "900123456",
    nombre: "Distribuidora Alimentos S.A.",
    contacto: "Carlos Pérez",
    telefono: "3001234567",
    correo: "contacto@distribuidora.com",
    direccion: "Cra 45 #12-34, Medellín, Antioquia - Colombia",
    estado: "Activo",
    tipoPersona: "Jurídica",
    productos: [{ categoria: "Lácteos" }, { categoria: "Snacks" }],
  },
  {
    nit: "901987654",
    nombre: "Carnes del Norte",
    contacto: "Ana Torres",
    telefono: "3105556677",
    correo: "ventas@carnesnorte.com",
    direccion: "Cll 23 #45-12, Bogotá D.C.",
    estado: "Inactivo",
    tipoPersona: "Natural",
    productos: [{ categoria: "Carnes" }],
  },
];

// Logo helper
const getBase64Image = (imgPath) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imgPath;
  });

export const exportSuppliersToPDF = async () => {
  try {
    const doc = new jsPDF("p", "mm", "a4");

    const mintGreenDark = [102, 187, 106];
    const lightMint = [240, 248, 240];

    const margin = 15;
    const pageWidth = 210;
    const usableWidth = pageWidth - margin * 2;

    // Logo
    try {
      const logoBase64 = await getBase64Image("/src/assets/logo.png");
      doc.addImage(logoBase64, "PNG", margin, 10, 30, 30);
    } catch (err) {
      console.warn("Logo no cargado", err);
    }

    // Título y subtítulo
    doc.setFontSize(18);
    doc.setTextColor(...mintGreenDark);
    doc.text("Reporte de Proveedores", 60, 25);
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Generado el: " + new Date().toLocaleDateString(), 60, 35);
    doc.text("Total de registros: " + suppliersData.length, 60, 42);

    let y = 55;

    // Encabezados y anchos relativos
    const headers = ["NIT", "Nombre", "Contacto", "Teléfono", "Correo", "Dirección", "Estado", "Tipo", "Categorías"];
    const widths = [15, 25, 20, 20, 30, 35, 15, 15, 25]; // Suma 200 -> caben en 180 ajustando splitText
    const scale = usableWidth / widths.reduce((a, b) => a + b, 0);
    const scaledWidths = widths.map(w => w * scale);

    // Dibujar encabezado
    doc.setFillColor(...lightMint);
    doc.rect(margin, y, usableWidth, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    let x = margin;
    headers.forEach((h, i) => {
      doc.text(h, x + 1, y + 5);
      x += scaledWidths[i];
    });
    y += 8;

    // Filas
    suppliersData.forEach((s, index) => {
      const categorias = s.productos?.map(p => p.categoria).join(", ") || "—";
      const row = [s.nit, s.nombre, s.contacto, s.telefono, s.correo, s.direccion, s.estado, s.tipoPersona, categorias];

      // Split de texto y calcular altura máxima
      const cellLines = row.map((txt, i) => doc.splitTextToSize(txt.toString(), scaledWidths[i] - 2));
      const rowHeight = Math.max(...cellLines.map(lines => lines.length)) * 5 + 2;

      // Salto de página si excede
      if (y + rowHeight > 285) {
        doc.addPage();
        y = 20;
        // Volver a dibujar encabezados
        doc.setFillColor(...lightMint);
        doc.rect(margin, y, usableWidth, 8, "F");
        x = margin;
        headers.forEach((h, i) => {
          doc.text(h, x + 1, y + 5);
          x += scaledWidths[i];
        });
        y += 8;
      }

      // Fondo de fila
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y, usableWidth, rowHeight, "F");
      }

      // Dibujar celdas
      x = margin;
      cellLines.forEach((lines, i) => {
        doc.text(lines, x + 1, y + 5);
        x += scaledWidths[i];
      });

      y += rowHeight;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    doc.save(`proveedores-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Error generando PDF");
  }
};

export default exportSuppliersToPDF;
