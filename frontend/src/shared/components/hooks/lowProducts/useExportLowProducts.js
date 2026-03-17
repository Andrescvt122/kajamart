import { useState } from "react";
import api from "../../../../api/axiosConfig";
import generateProductLowsPDF from "../../../../features/returns/low/helpers/exportToPdf";
import generateProductLowsXLS from "../../../../features/returns/low/helpers/exportToXls";

const extractArray = (payload) =>
  Array.isArray(payload) ? payload : payload?.data || payload?.lowProducts || [];

const mapLow = (low) => ({
  idLow: low.id_baja_productos,
  dateLow: new Date(low.fecha_baja).toISOString().split("T")[0],
  createdAt:
    low.fecha_creacion ||
    low.fecha_baja ||
    low.createdAt ||
    low.created_at ||
    null,
  isActive: Boolean(low.estado ?? low.activo ?? low.isActive ?? low.is_active ?? true),
  responsible: low.nombre_responsable,
  total: Number(low.total_precio_baja),
  products: (() => {
    const details = low.detalle_productos_baja || [];
    if (details.length > 0) {
      return details.map((product) => ({
        id: product.id_detalle_productos,
        name: product.nombre_producto,
        lowQuantity: Number(product.cantidad) || 0,
        reason: product.motivo,
        category:
          product.categoria ||
          product.categoria_producto ||
          product.categoriaProducto ||
          product.nombre_categoria ||
          product.nombreCategoria ||
          product.category ||
          "Sin categoría",
        totalValue: Number(product.total_producto_baja ?? 0),
      }));
    }

    return [
      {
        id: `low-${low.id_baja_productos}-empty`,
        name: "Sin productos asociados",
        lowQuantity: Number(low.cantida_baja) || 0,
        reason: "Sin detalle de productos",
        category: "Sin categoría",
        totalValue: Number(low.total_precio_baja ?? 0),
      },
    ];
  })(),
});

export const useExportLowProducts = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllLows = async () => {
    const response = await api.get("/lowProducts/all");
    return extractArray(response.data).map(mapLow);
  };

  const runExport = async (exporter, transform) => {
    if (loading) return;

    setLoading(true);
    try {
      const rows = await fetchAllLows();
      const finalRows = typeof transform === "function" ? transform(rows) : rows;
      await exporter(finalRows);
    } catch (error) {
      console.error("Error exportando bajas:", error);
      alert("No se pudieron exportar las bajas de productos.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    exportLowProductsExcel: ({ transform } = {}) =>
      runExport(generateProductLowsXLS, transform),
    exportLowProductsPdf: ({ transform } = {}) =>
      runExport(generateProductLowsPDF, transform),
  };
};

