import jsPDF from 'jspdf';

const getBase64Image = (imgPath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = img.naturalHeight;
      canvas.width = img.naturalWidth;
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = imgPath;
  });
};

const truncate = (value, length = 25) => {
  const text = (value ?? '').toString();
  return text.length > length ? `${text.slice(0, length - 3)}...` : text;
};

const hasDiscount = (value) => {
  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    return normalised === 'true' || normalised === '1' || normalised === 'si' || normalised === 'sí';
  }
  return Boolean(value);
};

export const generateProductReturnsPDF = async (productsData = []) => {
  try {
    const products = Array.isArray(productsData) ? productsData : [];

    if (products.length === 0) {
      alert('No hay datos de devoluciones para exportar.');
      return;
    }

    const doc = new jsPDF();

    const mintGreen = [144, 238, 144];
    const mintGreenDark = [102, 187, 106];
    const lightMint = [240, 248, 240];

    try {
      const logoBase64 = await getBase64Image('/src/assets/logo.png');
      doc.addImage(logoBase64, 'PNG', 20, 10, 30, 30);
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    doc.setFontSize(20);
    doc.setTextColor(...mintGreenDark);
    doc.text('Reporte de Devoluciones de Productos', 60, 25);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generado el: ' + new Date().toLocaleDateString(), 60, 35);
    doc.text('Total de productos en devoluciones: ' + products.length, 60, 42);

    const headers = [
      'Devolución',
      'Fecha',
      'Producto',
      'Cantidad',
      'Descuento',
      'Motivo',
      'Categoría',
      'Responsable',
    ];

    const columnWidths = [22, 22, 40, 18, 20, 25, 25, 28];

    let yPosition = 55;
    const startX = 20;

    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(...lightMint);
    doc.rect(startX, yPosition, columnWidths.reduce((acc, w) => acc + w, 0), 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    let xPosition = startX;
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 2, yPosition + 5);
      xPosition += columnWidths[index];
    });

    yPosition += 8;

    doc.setFontSize(8);
    products.forEach((product, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;

        doc.setFillColor(...lightMint);
        doc.rect(startX, yPosition, columnWidths.reduce((acc, w) => acc + w, 0), 8, 'F');

        xPosition = startX;
        headers.forEach((header, headerIndex) => {
          doc.text(header, xPosition + 2, yPosition + 5);
          xPosition += columnWidths[headerIndex];
        });
        yPosition += 8;
      }

      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(startX, yPosition, columnWidths.reduce((acc, w) => acc + w, 0), 6, 'F');
      }

      xPosition = startX;
      const data = [
        `#${(product.idReturn ?? '').toString().padStart(4, '0')}`,
        truncate(product.dateReturn, 12),
        truncate(product.name, 30),
        (product.quantity ?? '').toString(),
        hasDiscount(product.discount) ? 'Sí' : 'No',
        truncate(product.reason, 28),
        truncate(product.category || 'Sin categoría', 28),
        truncate(product.responsable, 28),
      ];

      data.forEach((text, dataIndex) => {
        doc.text(text, xPosition + 2, yPosition + 4);
        xPosition += columnWidths[dataIndex];
      });

      yPosition += 6;
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    doc.save(`devoluciones-productos-${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error generando el PDF. Por favor, inténtalo de nuevo.');
  }
};

export default generateProductReturnsPDF;
