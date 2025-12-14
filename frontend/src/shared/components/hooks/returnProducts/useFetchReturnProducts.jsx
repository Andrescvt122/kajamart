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
      const data = res.data.returnProducts || [];

      // 🧮 Adaptar los datos al formato que usa tu tabla
      // useFetchReturnProducts.jsx
      // ...
      const flattened = data.map((r) => {
        const date = r.fecha_devolucion ? new Date(r.fecha_devolucion) : null;

        return {
          idReturn: r.id_devolucion_product,
          dateReturn: date ? date.toLocaleDateString("es-CO") : "",
          dateISO: date ? date.toISOString() : null,
          responsable: r.nombre_responsable,
          numeroFactura: r.numero_factura,
          products: (r.detalle_devolucion_producto || []).map((d) => {
            const detalle = d.detalle_productos;
            const producto = detalle?.productos;
            const proveedor = producto?.producto_proveedor?.[0]?.proveedores;

            return {
              idProduct: d.id_detalle_devolucion_productos,
              name: d.nombre_producto,
              quantity: Number(d.cantidad_devuelta) || 0,
              discount: d.es_descuento,
              reason: d.motivo,
              barcode: detalle?.codigo_barras_producto_compra || "",
              price: producto?.precio_venta ?? null,
              supplier: proveedor?.nombre || "Sin proveedor",
            };
          }),
        };
      });

      setReturns(flattened);
    } catch (err) {
      console.error("❌ Error al obtener devoluciones:", err);
      setError("No se pudieron cargar las devoluciones de productos");
    } finally {
      setLoading(false);
    }
    console.log("refetch");
  };

  useEffect(() => {
    fetchReturnProducts();
  }, []);

  return { returns, loading, error, refetch: fetchReturnProducts };
};