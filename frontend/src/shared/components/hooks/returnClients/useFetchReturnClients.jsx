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

export const useFetchReturnClients = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturnClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL);
      const data = res.data.returnClients || [];

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
            const detalleProducto = product.detalle_producto || {};
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
  }, []);

  return { returns, loading, error, refetch: fetchReturnClients };
};
