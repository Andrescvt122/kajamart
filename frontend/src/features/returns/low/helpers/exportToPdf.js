import jsPDF from "jspdf";

// --------------------
// Datos de ejemplo
// --------------------
const baseLows = [];
for (let i = 1; i <= 44; i++) {
  baseLows.push({
    idLow: i,
    idDetailProduct: 100 + i,
    dateLow: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
    type: i % 3 === 0 ? "Reembolso del dinero" : "Cambio por otro producto",
    responsible: i % 3 === 0 ? "Arturo" : "Federico",
    cantidad: Math.floor(Math.random() * (5 - 1 + 1)) + 1,
    products: [
      {
        id: 1,
        name: "Producto A",
        lowQuantity: 2,
        quantity: 5,
        reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",
      },
      {
        id: 2,
        name: "Producto B",
        lowQuantity: 1,
        quantity: 3,
        reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",
      },
      {
        id: 3,
        name: "Producto C",
        lowQuantity: 4,
        quantity: 1,
        reason: i % 2 === 0 ? "Producto dañado" : "Supero fecha de vencimiento limite",
      },
    ],
  });
}

// --------------------
// Aplanar para tabla
// --------------------
const getFlattenedProducts = () =>
  baseLows.flatMap((low) =>
    low.products.map((prod) => ({
      idLow: low.idLow,
      idDetailProduct: low.idDetailProduct,
      dateLow: low.dateLow,
      type: low.type,
      responsible: low.responsible,
      productName: prod.name,
      lowQuantity: prod.lowQuantity,
      stockQuantity: prod.quantity,
      reason: prod.reason,
    }))
  );

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
// Generar PDF
// --------------------
export const generateProductLowsPDF = async () => {
  try {
    const doc = new jsPDF();
    const products = getFlattenedProducts();

    // Colores
    const mintGreenDark = [102, 187, 106];
    const lightMint = [240, 248, 240];

    // Logo
    try {
      const logoBase64 = await getBase64Image("/src/assets/logo.png");
      doc.addImage(logoBase64, "PNG", 20, 10, 30, 30);
    } catch (error) {
      console.warn("No se pudo cargar el logo:", error);
    }

    // Título
    doc.setFontSize(18);
    doc.setTextColor(...mintGreenDark);
    doc.text("Reporte de Bajas de Productos", 60, 25);

    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Generado el: " + new Date().toLocaleDateString(), 60, 35);
    doc.text("Total de registros: " + products.length, 60, 42);

    let y = 55;

    // Encabezados
    const headers = [
      "ID Baja",
      "ID Detalle",
      "Fecha",
      "Tipo",
      "Responsable",
      "Producto",
      "Cant. Baja",
      "Stock",
      "Motivo",
    ];
    const widths = [15, 20, 20, 25, 25, 25, 20, 15, 35];

    doc.setFillColor(...lightMint);
    doc.rect(20, y, 170, 8, "F");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    let x = 20;
    headers.forEach((h, i) => {
      doc.text(h, x + 1, y + 5);
      x += widths[i];
    });
    y += 8;

    // Filas
    products.forEach((p, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFillColor(...lightMint);
        doc.rect(20, y, 170, 8, "F");
        x = 20;
        headers.forEach((h, idx) => {
          doc.text(h, x + 1, y + 5);
          x += widths[idx];
        });
        y += 8;
      }

      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, y, 170, 6, "F");
      }

      const row = [
        `#${p.idLow}`,
        `${p.idDetailProduct}`,
        p.dateLow,
        p.type.substring(0, 12),
        p.responsible.substring(0, 12),
        p.productName.substring(0, 15),
        `${p.lowQuantity}`,
        `${p.stockQuantity}`,
        p.reason.substring(0, 20),
      ];

      x = 20;
      row.forEach((txt, idx) => {
        doc.text(txt.toString(), x + 1, y + 4);
        x += widths[idx];
      });
      y += 6;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    doc.save(`bajas-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (err) {
    console.error("Error generando PDF:", err);
    alert("Error generando PDF");
  }
};

export default generateProductLowsPDF;
