import { useState } from "react";
import api from "../../../../api/axiosConfig";
import { exportPurchasesToExcel } from "../../../../features/purchases/helper/exportPurchasesExcel";
import { exportPurchasesToPdf } from "../../../../features/purchases/helper/exportPurchasesPdf";

const extractArray = (payload) =>
  Array.isArray(payload) ? payload : payload?.data || payload?.purchases || [];

const uniqueKeepOrder = (values) => {
  const result = [];
  const seen = new Set();

  for (const value of values) {
    const normalized = String(value || "").trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
};

const mapPurchase = (purchase) => {
  const id = purchase?.id_compra ?? purchase?.id ?? "";

  return {
    id: String(id),
    factura:
      purchase?.numero_factura ??
      purchase?.num_factura ??
      purchase?.factura ??
      (id ? String(id).padStart(3, "0") : "—"),
    proveedor:
      purchase?.proveedores?.nombre ??
      purchase?.proveedor?.nombre ??
      purchase?.proveedor_nombre ??
      "—",
    nit:
      purchase?.proveedores?.nit ??
      purchase?.proveedor?.nit ??
      purchase?.proveedor_nit ??
      "—",
    fecha:
      purchase?.fecha_compra ??
      purchase?.fecha ??
      purchase?.created_at ??
      new Date().toISOString(),
    estado: purchase?.estado_compra ?? purchase?.estado ?? "Completada",
    total: Number(purchase?.total ?? 0),
    productos: Array.from(
      new Map(
        (purchase?.detalle_compra || []).map((detail) => {
          const productId =
            detail?.detalle_productos?.productos?.id_producto ??
            detail?.detalle_productos?.id_producto ??
            detail?.id_producto ??
            detail?.productoId ??
            detail?.detalle_productos?.productos?.nombre ??
            detail?.nombre;

          const productName =
            detail?.detalle_productos?.productos?.nombre ??
            detail?.productos?.nombre ??
            detail?.nombre ??
            "—";

          return [
            productId,
            {
              productoId: productId,
              nombre: productName,
              cantidad_paquetes:
                Number(detail?.cantidad_paquetes ?? detail?.cantidad ?? 1) || 1,
              unidades_por_paquete:
                Number(detail?.unidades_por_paquete ?? 0) || 0,
              cantidad_total_unidades:
                Number(detail?.cantidad_total_unidades ?? 0) || 0,
              precioCompra: Number(detail?.precio_unitario ?? 0) || 0,
              precioVenta: Number(detail?.precio_venta ?? 0) || 0,
              vencimientos: uniqueKeepOrder([
                detail?.detalle_productos?.fecha_vencimiento ??
                  detail?.fecha_vencimiento ??
                  "",
              ]),
              codigosBarras: uniqueKeepOrder([
                detail?.detalle_productos?.codigo_barras_producto_compra ??
                  detail?.codigo_barras_producto_compra ??
                  "",
              ]),
            },
          ];
        })
      ).values()
    ),
  };
};

const buildFilename = (name, ext) =>
  `${name}_${new Date().toISOString().slice(0, 10)}.${ext}`;

export const useExportPurchases = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllPurchases = async () => {
    const response = await api.get("/purchase/all");
    return extractArray(response.data).map(mapPurchase);
  };

  const runExport = async (runner, transform) => {
    if (loading) return;

    setLoading(true);
    try {
      const rows = await fetchAllPurchases();
      const finalRows = typeof transform === "function" ? transform(rows) : rows;
      await runner(finalRows);
    } catch (error) {
      console.error("Error exportando compras:", error);
      alert("No se pudieron exportar las compras.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    exportPurchasesExcel: ({ transform } = {}) =>
      runExport(
        (rows) => exportPurchasesToExcel(rows, buildFilename("compras", "xlsx")),
        transform
      ),
    exportPurchasesPdf: ({ transform } = {}) =>
      runExport(
        (rows) =>
          exportPurchasesToPdf({
            rows,
            filename: buildFilename("compras", "pdf"),
          }),
        transform
      ),
  };
};
