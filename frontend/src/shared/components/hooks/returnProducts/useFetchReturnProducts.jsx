import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/returnProducts";

const getCategoryName = (categoria) => {
  if (Array.isArray(categoria)) {
    return categoria.find((item) => item?.nombre_categoria)?.nombre_categoria;
  }

  return categoria?.nombre_categoria || null;
};

const extractPayload = (payload) => ({
  data: Array.isArray(payload)
    ? payload
    : payload?.returnProducts || payload?.data || [],
  meta: payload?.meta || null,
});

export const useFetchReturnProducts = (options = {}) => {
  const { limit } = options;
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturnProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];

      if (limit) {
        let cursor = null;
        const visitedCursors = new Set();

        while (true) {
          const res = await axios.get(API_URL, {
            params: {
              limit,
              ...(cursor != null ? { cursor } : {}),
            },
          });
          const payload = extractPayload(res.data);
          data = data.concat(payload.data || []);

          const nextCursor = payload.meta?.nextCursor;
          if (nextCursor == null || visitedCursors.has(nextCursor)) break;

          visitedCursors.add(nextCursor);
          cursor = nextCursor;
        }
      } else {
        const res = await axios.get(API_URL);
        data = extractPayload(res.data).data;
      }

      const flattened = data.map((r) => {
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
            category:
              getCategoryName(producto?.categorias || detalle?.categorias) ||
              d.categoria ||
              d.nombre_categoria ||
              "Sin categoría",
            barcode: detalle?.codigo_barras_producto_compra || "",
            price: producto?.precio_venta ?? null,
            supplier: proveedor?.nombre || purchaseSupplierName || "Sin proveedor",
          };
        });

        // Si no hay detalles, igual mostramos la devolucion para no perderla en el listado.
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
          isActive: Boolean(
            r.estado ?? r.activo ?? r.isActive ?? r.is_active ?? true,
          ),
          responsable: r.nombre_responsable,
          numeroFactura: r.numero_factura,
          products: normalizedProducts,
        };
      });

      setReturns(flattened);
    } catch (err) {
      console.error("Error al obtener devoluciones:", err);
      setError("No se pudieron cargar las devoluciones de productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnProducts();
  }, [limit]);

  return { returns, loading, error, refetch: fetchReturnProducts };
};
