import jsPDF from "jspdf";

// --------------------
// Utilidad para logo (sin cambios)
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
// Normalizador de datos (DB -> diseño actual)
// --------------------
const normalizeCategories = (categories = []) =>
  (Array.isArray(categories) ? categories : []).map((c) => {
    const id =
      c.id ??
      (c.id_categoria != null
        ? `CAT${String(c.id_categoria).padStart(3, "0")}`
        : "");
    const nombre = c.nombre ?? c.nombre_categoria ?? "";
    const descripcion = c.descripcion ?? c.descripcion_categoria ?? "";
    const estado =
      typeof c.estado === "boolean"
        ? c.estado
          ? "Activo"
          : "Inactivo"
        : c.estado ?? "";
    return { id, nombre, descripcion, estado };
  });

// --------------------
// Generar PDF (DISEÑO IGUAL; solo cambia la fuente de datos)
// --------------------
export const exportCategoriesToPDF = async (categories = []) => {
  try {
    const data = normalizeCategories(categories);
    const doc = new jsPDF();

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
    doc.text("Reporte de Categorías", 60, 25);

    // Subtítulo
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("Generado el: " + new Date().toLocaleDateString(), 60, 35);
    doc.text("Total de registros: " + data.length, 60, 42);

    let y = 55;

    // Encabezados (mismos)
    const headers = ["ID", "Nombre", "Descripción", "Estado"];
    const widths = [20, 40, 80, 30];

    doc.setFillColor(...lightMint);
    doc.rect(20, y, 170, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    let x = 20;
    headers.forEach((h, i) => {
      doc.text(h, x + 1, y + 5);
      x += widths[i];
    });
    y += 8;

    // Filas (mismo layout; ahora con datos reales)
    data.forEach((c, i) => {
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
        c.id || "",
        c.nombre || "",
        (c.descripcion || "").substring(0, 40),
        c.estado || "",
      ];

      x = 20;
      row.forEach((txt, idx) => {
        doc.text(txt.toString(), x + 1, y + 4);
        x += widths[idx];
      });
      y += 6;
    });

    // Footer (igual)
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    doc.save(`categorias-${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (err) {
    console.error("Error generando PDF:", err);
    alert("Error generando PDF");
  }
};

export default exportCategoriesToPDF;