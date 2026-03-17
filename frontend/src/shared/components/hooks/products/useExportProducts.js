import { useState } from "react";
import api from "../../../../api/axiosConfig";
import { exportProductsToExcel } from "../../../../features/products/helpers/exportToXls";
import { exportProductsToPDF } from "../../../../features/products/helpers/exportToPdf";

const extractArray = (payload) =>
  Array.isArray(payload) ? payload : payload?.data || payload?.products || [];

const mapProduct = (product) => ({
  id: product.id_producto ?? product.id ?? "",
  nombre: product.nombre ?? "",
  descripcion: product.descripcion ?? "",
  categoria:
    product.categoria ||
    product?.categorias?.nombre_categoria ||
    product?.categorias?.nombre ||
    "—",
  stockActual: Number(product.stock_actual ?? 0),
  stockMin: Number(product.stock_minimo ?? 0),
  stockMax: Number(product.stock_maximo ?? 0),
  precio: Number(product.precio_venta ?? 0),
  estado: product.estado ? "Activo" : "Inactivo",
});

export const useExportProducts = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllProducts = async () => {
    const response = await api.get("/products");
    return extractArray(response.data).map(mapProduct);
  };

  const runExport = async (exporter, transform) => {
    if (loading) return;

    setLoading(true);
    try {
      const rows = await fetchAllProducts();
      const finalRows = typeof transform === "function" ? transform(rows) : rows;
      await exporter(finalRows);
    } catch (error) {
      console.error("Error exportando productos:", error);
      alert("No se pudieron exportar los productos.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    exportProductsExcel: ({ transform } = {}) =>
      runExport(exportProductsToExcel, transform),
    exportProductsPdf: ({ transform } = {}) =>
      runExport(exportProductsToPDF, transform),
  };
};
