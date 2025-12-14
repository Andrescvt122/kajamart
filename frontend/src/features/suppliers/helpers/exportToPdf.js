import jsPDF from "jspdf";

// --------------------
// Utilidad para logo (idéntica)
// --------------------
const getBase64Image = (imgPath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imgPath;
  });
};

// --------------------
// Normalizador de datos (DB -> formato PDF)
// --------------------
const normalizeSuppliers = (suppliers = []) =>
  (Array.isArray(suppliers) ? suppliers : []).map((s) => {
    const nit = s.nit ?? "";
    const nombre = s.nombre ?? "";
    const contacto = s.contacto ?? "";
    const telefono = s.telefono ?? "";
    const correo = s.correo ?? "";
    const direccion = s.direccion ?? "";
    const estado =
      typeof s.estado === "boolean" ? (s.estado ? "Activo" : "Inactivo") : s.estado ?? "";
    const tipoPersona = s.tipo_persona ?? s.tipoPersona ?? "";
    const categorias = Array.isArray(s.categorias)
      ? s.categorias
          .map((c) => c.nombre_categoria || c.nombre || "")
          .filter(Boolean)
          .join(", ")
      : "—";
    return { nit, nombre, contacto, telefono, correo, direccion, estado, tipoPersona, categorias };
  });

// --------------------
// Generar PDF (mismo estilo que el de categorías)
// --------------------
export const exportSuppliersToPDF = async (suppliers = []) => {
  try {
    const data = normalizeSuppliers(suppliers);
    const doc = new jsPDF("p", "mm", "a4");

    const mintGreenDark = [102, 187, 106];
    const lightMint = [240, 248, 240];

    // Logo
    try {
      const logoBase64 = await getBase64Image("/src/assets/logo.png");
      doc.addImage(logoBase64, "PNG", 20, 10, 30, 30);
    } catch (err) {
      console.warn("No se pudo cargar el logo:", err);
    }

    // Título
    doc.setFontSize(18);
    doc.setTextColor(...mintGreenDark);
    doc.text("Reporte de Proveedores", 60, 25);

    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Generado el: " + new Date().toLocaleDateString(), 60, 35);
    doc.text("Total de registros: " + data.length, 60, 42);

    let y = 55;

    // Encabezados
    const headers = [
      "NIT",
      "Nombre",
      "Contacto",
      "Teléfono",
      "Correo",
      "Dirección",
      "Estado",
      "Tipo",
      "Categorías",
    ];
    const widths = [18, 25, 22, 20, 30, 35, 15, 15, 25]; // ajuste proporcional
    const totalWidth = widths.reduce((a, b) => a + b, 0);
    const scale = 170 / totalWidth;
    const scaledWidths = widths.map((w) => w * scale);

    // Encabezado
    doc.setFillColor(...lightMint);
    doc.rect(20, y, 170, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    let x = 20;
    headers.forEach((h, i) => {
      doc.text(h, x + 1, y + 5);
      x += scaledWidths[i];
    });
    y += 8;

    // Filas
    data.forEach((s, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFillColor(...lightMint);
        doc.rect(20, y, 170, 8, "F");
        x = 20;
        headers.forEach((h, idx) => {
          doc.text(h, x + 1, y + 5);
          x += scaledWidths[idx];
        });
        y += 8;
      }

      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, y, 170, 6, "F");
      }

      const row = [
        s.nit,
        s.nombre,
        s.contacto,
        s.telefono,
        s.correo,
        s.direccion,
        s.estado,
        s.tipoPersona,
        s.categorias,
      ];

      x = 20;
      row.forEach((txt, idx) => {
        const text = (txt || "").toString();
        const lines = doc.splitTextToSize(text, scaledWidths[idx] - 2);
        doc.text(lines, x + 1, y + 4);
        x += scaledWidths[idx];
      });

      const maxLines = Math.max(...row.map((txt, idx) => doc.splitTextToSize((txt || "").toString(), scaledWidths[idx] - 2).length));
      y += maxLines * 5 + 2;
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
    console.error("Error generando PDF:", err);
    alert("Error generando PDF");
  }
};

export default exportSuppliersToPDF;