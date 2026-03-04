import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/returnProducts";

export const useFetchReturnProducts = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturnProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL);
      const payload = res.data;
      const data = Array.isArray(payload)
        ? payload
        : payload?.returnProducts || payload?.data || [];

      const flattened = data.map((r) => {
        const date = r.fecha_devolucion ? new Date(r.fecha_devolucion) : null;
        const purchaseSupplierName =
          r?.compras?.proveedores?.nombre ||
          r?.compras?.proveedor?.nombre ||
          null;
          console.log("Procesando devolución:", r);
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
              console.log("productRows:", productRows);

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
  }, []);

  return { returns, loading, error, refetch: fetchReturnProducts };
};
