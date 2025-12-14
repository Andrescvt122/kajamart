import jsPDF from "jspdf";

/**
 * Convierte imagen a base64
 */
const getBase64Image = (imgPath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = imgPath;
  });
};

/**
 * Exportar productos a PDF
 * @param {Array} products - Lista de productos filtrados
 */
export const exportProductsToPDF = async (products = []) => {
  try {
    console.log("[exportProductsToPDF] invocado, productos:", products);

    const doc = new jsPDF("p", "mm", "a4");
    const mintGreen = [102, 187, 106];
    const lightBg = [240, 248, 240];

    // Logo
    try {
      const logoBase64 = await getBase64Image("/src/assets/logo.png");
      doc.addImage(logoBase64, "PNG", 15, 10, 25, 25);
    } catch (err) {
      console.warn("No se pudo cargar el logo:", err);
    }

    // Título
    doc.setFontSize(18);
    doc.setTextColor(...mintGreen);
    doc.text("Reporte de Productos", 60, 25);

    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 60, 35);
    doc.text(`Total de registros: ${products.length}`, 60, 42);

    let y = 55;

    // Encabezados
    const headers = ["ID", "Código de barras", "Vencimiento", "Cantidad", "Consumido", "Precio"];
    const widths = [20, 40, 35, 25, 25, 25];

    doc.setFillColor(...lightBg);
    doc.rect(20, y, 170, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    let x = 20;
    headers.forEach((h, i) => {
      doc.text(h, x + 2, y + 6);
      x += widths[i];
    });
    y += 10;

    // Filas
    products.forEach((p, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, y - 4, 170, 8, "F");
      }

      const row = [
        p.id,
        p.barcode,
        p.vencimiento,
        p.cantidad?.toString(),
        p.consumido?.toString(),
        `$${p.precio?.toLocaleString()}`,
      ];

      x = 20;
      row.forEach((txt, idx) => {
        doc.text(txt.toString(), x + 2, y);
        x += widths[idx];
      });
      y += 8;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    doc.save(`productos-${new Date().toISOString().split("T")[0]}.pdf`);

    console.log("[exportProductsToPDF] PDF generado ✅");
  } catch (err) {
    console.error("Error generando PDF:", err);
    alert("Error generando PDF");
  }
};
