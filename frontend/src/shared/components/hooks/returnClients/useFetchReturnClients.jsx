import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/returnClients";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO");
};

const getProductName = (productNode) =>
  productNode?.productos?.nombre || productNode?.nombre_producto || "Sin producto";

const extractPayload = (payload) => ({
  data: Array.isArray(payload)
    ? payload
    : payload?.data || payload?.returnClients || [],
  meta: payload?.meta || null,
});

export const useFetchReturnClients = (options = {}) => {
  const { limit } = options;
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturnClients = async () => {
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

      const mapped = data.map((item) => {
        const venta = item.ventas || {};
        const cliente = venta.clientes || {};
        const responsable = item.usuarios || {};
        const fechaBase = item.fecha_devolucion || venta.fecha_venta;

        return {
          idReturn: item.id_devoluciones_cliente,
          idSale: item.id_venta,
          dateReturn: formatDate(fechaBase),
          dateISO: fechaBase || null,
          createdAt:
            item.fecha_creacion ||
            item.fecha_devolucion ||
            item.createdAt ||
            item.created_at ||
            null,
          isActive: Boolean(
            item.estado ?? item.activo ?? item.isActive ?? item.is_active ?? true
          ),
          client: cliente.nombre_cliente || "",
          responsable: `${responsable.nombre || ""} ${responsable.apellido || ""}`.trim(),
          totalDevolucionCliente: Number(item.total_devolucion_cliente || 0),
          totalDevolucionProducto: Number(item.total_devolucion_producto || 0),
          productsReturned: (item.devolucion_cliente_devuelto || []).map((product) => {
            const detalleVenta = product.detalle_venta || {};
            const detalleProducto = detalleVenta.detalle_productos || {};
            return {
              idProduct: product.id_devolucion_cliente_devuelto,
              name: getProductName(detalleProducto),
              quantity: Number(product.cantidad_cliente_devuelto || 0),
              totalValue: Number(product.valor_unitario || 0),
              reason: product.motivo || "",
              condition: product.condicion_producto || "",
            };
          }),
          productsDelivered: (item.devolucion_cliente_entregado || []).map((product) => {
            const detalleProducto =
              product.detalle_productos || product.detalle_producto || {};
            return {
              idProduct: product.id_devolucion_cliente_entregado,
              name: getProductName(detalleProducto),
              quantity: Number(product.cantidad_entregada || 0),
              totalValue: Number(product.valor_unitario || 0),
            };
          }),
        };
      });

      setReturns(mapped);
    } catch (err) {
      console.error("❌ Error al obtener devoluciones de clientes:", err);
      setError("No se pudieron cargar las devoluciones de clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnClients();
  }, [limit]);

  return { returns, loading, error, refetch: fetchReturnClients };
};
