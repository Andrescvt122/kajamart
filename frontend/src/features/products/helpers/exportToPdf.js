// src/features/products/helpers/exportToPdf.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --------------------
// Utilidad para logo
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
// Exportar Productos a PDF
// --------------------
export const exportProductsToPDF = async (products = []) => {
  if (!products || products.length === 0) {
    alert("No hay productos para exportar.");
    return;
  }

  try {
    const doc = new jsPDF("landscape");

    const mintGreenDark = [34, 139, 34]; // verde oscuro
    const grayText = [80, 80, 80];

    // Logo
    try {
      const logoBase64 = await getBase64Image("/src/assets/logo.png"); // asegúrate que el logo esté ahí
      doc.addImage(logoBase64, "PNG", 20, 10, 30, 30);
    } catch (err) {
      console.warn("No se pudo cargar el logo:", err);
    }

    // Título
    doc.setFontSize(18);
    doc.setTextColor(...mintGreenDark);
    doc.text("Reporte de Productos", 60, 25);

    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(...grayText);
    doc.text("Generado el: " + new Date().toLocaleDateString(), 60, 35);
    doc.text("Total de registros: " + products.length, 60, 42);

    // Tabla
    const tableColumn = [
      "ID",
      "Nombre",
      "Categoría",
      "Stock Actual",
      "Stock Mínimo",
      "Stock Máximo",
      "Precio",
      "Estado",
    ];

    const tableRows = products.map((p) => [
      p.id,
      p.nombre,
      p.categoria,
      p.stockActual,
      p.stockMin,
      p.stockMax,
      `$${p.precio?.toLocaleString()}`,
      p.estado,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      styles: {
        fontSize: 9,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: mintGreenDark,
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 255, 240],
      },
      margin: { top: 55 },
    });

    // Footer con paginación
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${i} de ${pageCount}`, 260, 200); // ajusta según orientación
    }

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `productos-${dateStr}.pdf`;
    doc.save(filename);

    console.log(`[exportProductsToPDF] PDF generado: ${filename}`);
  } catch (err) {
    console.error("[exportProductsToPDF] Error:", err);
    alert("Error generando el PDF");
  }
};

export default exportProductsToPDF;
