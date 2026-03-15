import { useEffect, useState } from "react";
import api from "../../../../api/axiosConfig";

const mapReturnProduct = (r) => {
  const date = r.fecha_devolucion ? new Date(r.fecha_devolucion) : null;
  const purchaseSupplierName =
    r?.compras?.proveedores?.nombre ||
    r?.compras?.proveedor?.nombre ||
    null;

  const productRows = (r.detalle_devolucion_producto || []).map((d) => {
    const detalle = d.detalle_productos;
    const producto = detalle?.productos;
    const proveedor = producto?.producto_proveedor?.[0]?.proveedores;
    return {
      idProduct: d.id_detalle_devolucion_productos,
      name: d.nombre_producto || producto?.nombre || "Producto sin nombre",
      quantity: Number(d.cantidad_devuelta) || 0,
      discount: Boolean(d.es_descuento),
      reason: d.motivo || "",
      barcode: detalle?.codigo_barras_producto_compra || "",
      price: producto?.precio_venta ?? null,
      supplier: proveedor?.nombre || purchaseSupplierName || "Sin proveedor",
    };
  });

  const normalizedProducts =
    productRows.length > 0
      ? productRows
      : [
          {
            idProduct: `return-${r.id_devolucion_product}-empty`,
            name: "Sin productos asociados",
            quantity: Number(r.cantidad_total) || 0,
            discount: false,
            reason: "Sin detalle de productos",
            barcode: "",
            price: null,
            supplier: purchaseSupplierName || "Sin proveedor",
          },
        ];

  return {
    idReturn: r.id_devolucion_product,
    dateReturn: date ? date.toLocaleDateString("es-CO") : "",
    dateISO: date ? date.toISOString() : null,
    createdAt:
      r.fecha_creacion ||
      r.fecha_devolucion ||
      r.createdAt ||
      r.created_at ||
      null,
    isActive: Boolean(r.estado ?? r.activo ?? r.isActive ?? r.is_active ?? true),
    responsable: r.nombre_responsable,
    numeroFactura: r.numero_factura,
    comprobante: {
      name: r.comprobante_nombre ?? null,
      type: r.comprobante_mime ?? null,
      url: r.comprobante_url ?? null,
      size: r.comprobante_size ?? null,
    },
    products: normalizedProducts,
  };
};

export const useSearchReturnProducts = (searchTerm) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const term = String(searchTerm || "").trim();
    if (!term) {
      setData([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/returnProducts/search", {
          params: { q: term },
        });
        const rows = Array.isArray(response.data)
          ? response.data
          : response.data?.returnProducts || response.data?.data || [];
        if (!ignore) setData(rows.map(mapReturnProduct));
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.error ||
            err?.message ||
            "Error al buscar devoluciones de productos."
          );
          setData([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [searchTerm]);

  return { data, loading, error };
};
