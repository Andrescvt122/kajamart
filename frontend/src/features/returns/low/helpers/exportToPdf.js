import jsPDF from "jspdf";

// --------------------
// Utilidades
// --------------------
const formatDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toISOString().split("T")[0];
};

const flattenProductLows = (lows = []) => {
  if (!Array.isArray(lows)) return [];

  return lows.flatMap((low) => {
    const baseInfo = {
      idLow: low?.idLow ?? "",
      dateLow: formatDate(low?.dateLow),
      responsible: low?.responsible ?? "",
    };

    if (low?.currentProduct) {
      const product = low.currentProduct;
      return [
        {
          ...baseInfo,
          productName: product?.name ?? "",
          lowQuantity: product?.lowQuantity ?? "",
          reason: product?.reason ?? "",
        },
      ];
    }

    if (Array.isArray(low?.products) && low.products.length > 0) {
      return low.products.map((product) => ({
        ...baseInfo,
        productName: product?.name ?? "",
        lowQuantity: product?.lowQuantity ?? "",
        reason: product?.reason ?? "",
      }));
    }

    return [
      {
        ...baseInfo,
        productName: "",
        lowQuantity: "",
        reason: "",
      },
    ];
  });
};

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
export const generateProductLowsPDF = async (lows = []) => {
  try {
    const doc = new jsPDF();
    const products = flattenProductLows(lows);

    if (products.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

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
      "Fecha",
      "Producto",
      "Cant. Baja",
      "Motivo",
      "Responsable",
    ];
    const widths = [25, 25, 35, 25, 35, 25];

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
        p.dateLow,
        p.productName?.toString().substring(0, 20) ?? "",
        `${p.lowQuantity}`,
        p.reason?.toString().substring(0, 30) ?? "",
        p.responsible?.toString().substring(0, 15) ?? "",
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
