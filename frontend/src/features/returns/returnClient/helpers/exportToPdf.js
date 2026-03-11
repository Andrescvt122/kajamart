import jsPDF from "jspdf";

const getBase64Image = (imgPath) =>
  new Promise((resolve, reject) => {
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

const truncate = (value, maxLength = 20) => {
  const text = String(value ?? "");
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const formatMoney = (value) => `$${Number(value || 0).toLocaleString("es-CO")}`;

export const generateProductReturnsPDF = async (rows = []) => {
  try {
    const products = Array.isArray(rows) ? rows : [];

    if (products.length === 0) {
      alert("No hay datos de devoluciones para exportar.");
      return;
    }

    const doc = new jsPDF("landscape");
    const mintGreenDark = [102, 187, 106];
    const lightMint = [240, 248, 240];

    try {
      const logoBase64 = await getBase64Image("/src/assets/logo.png");
      doc.addImage(logoBase64, "PNG", 20, 10, 30, 30);
    } catch (error) {
      console.warn("No se pudo cargar el logo:", error);
    }

    doc.setFontSize(18);
    doc.setTextColor(...mintGreenDark);
    doc.text("Reporte de Devoluciones de Clientes", 60, 25);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 60, 35);
    doc.text(`Total de registros: ${products.length}`, 60, 42);

    const headers = [
      "Devolución",
      "Venta",
      "Cliente",
      "Producto",
      "Cantidad",
      "Precio",
      "Motivo",
      "Tipo",
      "Responsable",
    ];
    const widths = [22, 18, 35, 35, 18, 22, 48, 35, 35];

    let y = 55;
    const startX = 20;
    const totalWidth = widths.reduce((acc, width) => acc + width, 0);

    const drawHeader = () => {
      doc.setFillColor(...lightMint);
      doc.rect(startX, y, totalWidth, 8, "F");
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      let x = startX;
      headers.forEach((header, index) => {
        doc.text(header, x + 1, y + 5);
        x += widths[index];
      });
      y += 8;
    };

    drawHeader();

    products.forEach((product, index) => {
      if (y > 185) {
        doc.addPage();
        y = 20;
        drawHeader();
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(startX, y, totalWidth, 6, "F");
      }

      const row = [
        `#${product.idReturn ?? ""}`,
        `${product.idSale ?? ""}`,
        truncate(product.client, 22),
        truncate(product.name, 22),
        `${product.quantity ?? ""}`,
        formatMoney(product.price),
        truncate(product.reason, 30),
        truncate(product.typeReturn, 24),
        truncate(product.responsable, 22),
      ];

      let x = startX;
      row.forEach((text, indexColumn) => {
        doc.text(String(text), x + 1, y + 4);
        x += widths[indexColumn];
      });
      y += 6;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${page} de ${pageCount}`, 260, 200);
    }

    doc.save(`devoluciones-clientes-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generando PDF:", error);
    alert("Error generando PDF");
  }
};

export default generateProductReturnsPDF;
