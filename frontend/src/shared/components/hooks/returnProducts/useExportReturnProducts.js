import { useState } from "react";
import api from "../../../../api/axiosConfig";
import { generateProductReturnsPDF } from "../../../../features/returns/returnProduct/helper/exportToPdf";
import { generateProductReturnsXLS } from "../../../../features/returns/returnProduct/helper/exportToXls";

const extractArray = (payload) =>
  Array.isArray(payload)
    ? payload
    : payload?.data || payload?.returnProducts || [];

const mapReturnProduct = (item) => {
  const date = item.fecha_devolucion ? new Date(item.fecha_devolucion) : null;

  return {
    idReturn: item.id_devolucion_product,
    dateReturn: date ? date.toLocaleDateString("es-CO") : "",
    dateISO: date ? date.toISOString() : null,
    createdAt:
      item.fecha_creacion ||
      item.fecha_devolucion ||
      item.createdAt ||
      item.created_at ||
      null,
    isActive: Boolean(
      item.estado ?? item.activo ?? item.isActive ?? item.is_active ?? true
    ),
    responsable: item.nombre_responsable,
    numeroFactura: item.numero_factura,
    products:
      (item.detalle_devolucion_producto || []).map((detail) => ({
        idProduct: detail.id_detalle_devolucion_productos,
        name:
          detail.nombre_producto ||
          detail?.detalle_productos?.productos?.nombre ||
          "Producto sin nombre",
        quantity: Number(detail.cantidad_devuelta) || 0,
        discount: Boolean(detail.es_descuento),
        reason: detail.motivo || "",
        category:
          detail?.detalle_productos?.productos?.categorias?.nombre_categoria ||
          "Sin categoría",
      })) || [],
  };
};

export const useExportReturnProducts = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllReturnProducts = async () => {
    const response = await api.get("/returnProducts/all");
    return extractArray(response.data).map(mapReturnProduct);
  };

  const runExport = async (exporter, transform) => {
    if (loading) return;

    setLoading(true);
    try {
      const rows = await fetchAllReturnProducts();
      const finalRows = typeof transform === "function" ? transform(rows) : rows;
      await exporter(finalRows);
    } catch (error) {
      console.error("Error exportando devoluciones de productos:", error);
      alert("No se pudieron exportar las devoluciones de productos.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    exportReturnProductsExcel: ({ transform } = {}) =>
      runExport(generateProductReturnsXLS, transform),
    exportReturnProductsPdf: ({ transform } = {}) =>
      runExport(generateProductReturnsPDF, transform),
  };
};

