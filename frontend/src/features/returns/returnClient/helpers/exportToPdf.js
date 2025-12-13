import jsPDF from "jspdf";
import logo from "../../../../assets/logo.png";
// Generar datos de ejemplo
const baseReturns = [];
for (let i = 1; i <= 44; i++) {
  const reasons = [
    "Producto dañado",
    "Producto vencido",
    "Producto incorrecto",
    "Producto no requerido",
  ];
  const reason = reasons[i % reasons.length];

  const pickStatus = (reason) => {
    if (reason === "Producto dañado") return "N/A";
    const r = Math.random();
    if (r < 0.45) return "a proveedor";
    if (r < 0.8) return "completado";
    if (r < 0.95) return "registrado";
    return "rechazado";
  };

  const statusSuppliers = pickStatus(reason);

  baseReturns.push({
    idReturn: i,
    idSale: 100 + i,
    products: [
      { idProduct: 1, name: "Producto A", quantity: 2, price: 100 },
      { idProduct: 2, name: "Producto B", quantity: 1, price: 200 },
      { idProduct: 3, name: "Producto C", quantity: 3, price: 150 },
      { idProduct: 4, name: "Producto D", quantity: 5, price: 50 },
      { idProduct: 5, name: "Producto E", quantity: 1, price: 300 },
      { idProduct: 6, name: "Producto F", quantity: 2, price: 250 },
    ],
    productsToReturn: [
      {
        idProduct: 1,
        name: "Producto A",
        quantity: 2,
        price: 100,
        reason,
        statusSuppliers,
      },
      {
        idProduct: 2,
        name: "Producto B",
        quantity: 1,
        price: 200,
        reason,
        statusSuppliers,
      },
      {
        idProduct: 3,
        name: "Producto C",
        quantity: 3,
        price: 150,
        reason,
        statusSuppliers,
      },
    ],
    dateReturn: `2023-11-${
      (i + 15) % 30 < 10 ? "0" : ""
    }${(i + 15) % 30}`,
    client: `Cliente ${i}`,
    responsable: `Empleado ${i}`,
    typeReturn: i % 3 === 0 ? "Reembolso del dinero" : "Cambio por otro producto",
    total: Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000,
  });
}

// Aplanar para tabla
const getFlattenedProducts = () =>
  baseReturns.flatMap((ret) =>
    ret.productsToReturn.map((prod) => ({
      idReturn: ret.idReturn,
      idSale: ret.idSale,
      client: ret.client,
      responsable: ret.responsable,
      dateReturn: ret.dateReturn,
      typeReturn: ret.typeReturn,
      total: ret.total,
      ...prod,
    }))
  );

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

// Función principal
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

    let y = 50;

    // Encabezados
    const headers = [
      "Devolución",
      "Venta",
      "Cliente",
      "Producto",
      "Cantidad",
      "Precio",
      "Motivo",
      "Estado Proveedor",
      "Tipo",
      "Total",
      "Responsable",
    ];
    const widths = [18, 15, 25, 25, 12, 15, 25, 25, 25, 18, 25];

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
        `#${p.idReturn}`,
        `${p.idSale}`,
        p.client.substring(0, 10),
        p.name,
        `${p.quantity}`,
        `$${p.price}`,
        p.reason.substring(0, 15),
        p.statusSuppliers,
        p.typeReturn.substring(0, 12),
        `$${p.total}`,
        p.responsable.substring(0, 10),
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

    doc.save(`devoluciones-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (err) {
    console.error("Error generando PDF:", err);
    alert("Error generando PDF");
  }
};

export default generateProductReturnsPDF;
