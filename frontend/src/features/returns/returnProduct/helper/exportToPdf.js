import jsPDF from 'jspdf';

// Datos quemados para demo (igual que en el componente)
const baseReturns = [];
for (let i = 1; i <= 44; i++) {
  baseReturns.push({
    idReturn: i,
    products: [
      { idProduct: 1, name: "Producto A", quantity: 2, price: 100, discount: true, reason: "Cerca de vencer", supplier: "Proveedor A" },
      { idProduct: 2, name: "Producto B", quantity: 1, price: 200, discount: false, reason: "Vencido", supplier: "Proveedor B" },
      { idProduct: 3, name: "Producto C", quantity: 3, price: 150, discount: true, reason: "Cerca de vencer", supplier: "Proveedor C" },
      { idProduct: 4, name: "Producto D", quantity: 5, price: 50, discount: false, reason: "Vencido", supplier: "Proveedor D" },
      { idProduct: 5, name: "Producto E", quantity: 1, price: 300, discount: true, reason: "Cerca de vencer", supplier: "Proveedor E" },
      { idProduct: 6, name: "Producto F", quantity: 2, price: 250, discount: false, reason: "Vencido", supplier: "Proveedor F" },
    ],
    dateReturn: `2023-11-${(i + 15) % 30 < 10 ? "0" : ""}${(i + 15) % 30}`,
    responsable: `Empleado ${i}`,
  });
}

// Función para aplanar los datos (igual que en el componente)
const getFlattenedProducts = () => {
  return baseReturns.flatMap(returnItem =>
    returnItem.products.map(product => ({
      idReturn: returnItem.idReturn,
      dateReturn: returnItem.dateReturn,
      responsable: returnItem.responsable,
      ...product
    }))
  );
};

// Función para convertir imagen a base64
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

// Función principal para generar el PDF
export const generateProductReturnsPDF = async () => {
  try {
    const doc = new jsPDF();
    const products = getFlattenedProducts();

    // Colores verde menta
    const mintGreen = [144, 238, 144]; // Verde menta claro
    const mintGreenDark = [102, 187, 106]; // Verde menta más oscuro
    const lightMint = [240, 248, 240]; // Verde menta muy claro para fondo

    // Logo
    try {
      const logoBase64 = await getBase64Image('/src/assets/logo.png');
      doc.addImage(logoBase64, 'PNG', 20, 10, 30, 30);
    } catch (error) {
      console.warn('No se pudo cargar el logo:', error);
    }

    // Título
    doc.setFontSize(20);
    doc.setTextColor(...mintGreenDark);
    doc.text('Reporte de Devoluciones de Productos', 60, 25);

    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Generado el: ' + new Date().toLocaleDateString(), 60, 35);
    doc.text('Total de productos en devoluciones: ' + products.length, 60, 42);

    let yPosition = 55;

    // Verificar si necesitamos nueva página para la tabla
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Encabezados de la tabla
    doc.setFillColor(...lightMint);
    doc.rect(20, yPosition, 170, 8, 'F');

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    const headers = ['Devolución', 'Producto', 'Cantidad', 'Precio', 'Descuento', 'Motivo', 'Proveedor', 'Responsable'];
    const columnWidths = [20, 35, 15, 20, 18, 25, 25, 25];

    let xPosition = 20;
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 2, yPosition + 5);
      xPosition += columnWidths[index];
    });

    yPosition += 8;

    // Datos de la tabla
    doc.setFontSize(8);
    products.forEach((product, index) => {
      // Nueva página si es necesario
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;

        // Reimprimir encabezados en nueva página
        doc.setFillColor(...lightMint);
        doc.rect(20, yPosition, 170, 8, 'F');

        xPosition = 20;
        headers.forEach((header, headerIndex) => {
          doc.text(header, xPosition + 2, yPosition + 5);
          xPosition += columnWidths[headerIndex];
        });
        yPosition += 8;
      }

      // Color de fondo alternado
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition, 170, 6, 'F');
      }

      // Datos del producto
      doc.setTextColor(0, 0, 0);
      xPosition = 20;

      const discountText = product.discount ? 'Sí' : 'No';
      const data = [
        `#${product.idReturn.toString().padStart(4, '0')}`,
        product.name.substring(0, 15) + (product.name.length > 15 ? '...' : ''),
        product.quantity.toString(),
        `$${product.price}`,
        discountText,
        product.reason.substring(0, 12) + (product.reason.length > 12 ? '...' : ''),
        product.supplier.substring(0, 12) + (product.supplier.length > 12 ? '...' : ''),
        product.responsable.substring(0, 12) + (product.responsable.length > 12 ? '...' : '')
      ];

      data.forEach((text, dataIndex) => {
        doc.text(text, xPosition + 2, yPosition + 4);
        xPosition += columnWidths[dataIndex];
      });

      yPosition += 6;
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    // Descargar el PDF
    doc.save(`devoluciones-productos-${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error generando el PDF. Por favor, inténtalo de nuevo.');
  }
};

export default generateProductReturnsPDF;