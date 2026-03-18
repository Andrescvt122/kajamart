import { useEffect, useState } from "react";
import api from "../../../../api/axiosConfig";

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO");
};

const getProductName = (productNode) =>
  productNode?.productos?.nombre || productNode?.nombre_producto || "Sin producto";

const mapReturnClient = (item) => {
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
      item.created_at ||
      item.createdAt ||
      item.fecha_creacion ||
      item.fecha_devolucion ||
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
      const detalleProducto = product.detalle_productos || {};
      return {
        idProduct: product.id_devolucion_cliente_entregado,
        name: getProductName(detalleProducto),
        quantity: Number(product.cantidad_entregada || 0),
        totalValue: Number(product.valor_unitario || 0),
      };
    }),
  };
};

export const useSearchReturnClients = (searchTerm) => {
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
        const response = await api.get("/returnClients/search", {
          params: { q: term },
        });
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        if (!ignore) setData(rows.map(mapReturnClient));
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.error ||
            err?.message ||
            "Error al buscar devoluciones de clientes."
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
