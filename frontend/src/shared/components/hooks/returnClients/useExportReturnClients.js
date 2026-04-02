import { useState } from "react";
import api from "../../../../api/axiosConfig";
import { toStatusFilterParam } from "../../../utils/statusFilter";
import generateProductReturnsPDF from "../../../../features/returns/returnClient/helpers/exportToPdf";
import generateProductReturnsXLS from "../../../../features/returns/returnClient/helpers/exportToXls";

const extractArray = (payload) =>
  Array.isArray(payload) ? payload : payload?.data || payload?.returnClients || [];

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO");
};

const getSupplierName = (product) => {
  const relation = product?.producto_proveedor;
  if (Array.isArray(relation)) {
    return relation[0]?.proveedores?.nombre || "Sin proveedor";
  }
  return relation?.proveedores?.nombre || "Sin proveedor";
};

const mapReturnClientRows = (item) => {
  const venta = item.ventas || {};
  const cliente = venta.clientes || {};
  const responsable = item.usuarios || {};
  const fechaBase = item.fecha_devolucion || venta.fecha_venta;
  const responsableNombre = `${responsable.nombre || ""} ${responsable.apellido || ""}`.trim();
  const typeReturn =
    (item.devolucion_cliente_entregado || []).length > 0
      ? "Cambio por otro producto"
      : "Devolución";
  const total =
    Number(item.total_devolucion_cliente || 0) ||
    Number(item.total_devolucion_producto || 0);
  const baseRow = {
    idReturn: item.id_devoluciones_cliente,
    idSale: item.id_venta,
    client: cliente.nombre_cliente || "",
    responsable: responsableNombre,
    dateReturn: formatDate(fechaBase),
    typeReturn,
    total,
    isActive: Boolean(
      item.estado ?? item.activo ?? item.isActive ?? item.is_active ?? true
    ),
  };

  const returnedRows = (item.devolucion_cliente_devuelto || []).map((product) => {
    const detalleProducto = product?.detalle_venta?.detalle_productos || {};
    const producto = detalleProducto.productos || {};

    return {
      ...baseRow,
      name: producto.nombre || "Sin producto",
      quantity: Number(product.cantidad_cliente_devuelto || 0),
      price: Number(product.valor_unitario || 0),
      reason: product.motivo || "",
      supplier: getSupplierName(producto),
      discount: false,
      statusSuppliers: product.condicion_producto || "Devuelto",
    };
  });

  const deliveredRows = (item.devolucion_cliente_entregado || []).map((product) => {
    const detalleProducto = product.detalle_productos || {};
    const producto = detalleProducto.productos || {};

    return {
      ...baseRow,
      name: producto.nombre || "Sin producto",
      quantity: Number(product.cantidad_entregada || 0),
      price: Number(product.valor_unitario || 0),
      reason: "Producto entregado al cliente",
      supplier: getSupplierName(producto),
      discount: false,
      statusSuppliers: "Entregado",
    };
  });

  return [...returnedRows, ...deliveredRows];
};

export const useExportReturnClients = () => {
  const [loading, setLoading] = useState(false);

  const fetchAllReturnClients = async (statusFilter) => {
    const status = toStatusFilterParam(statusFilter);
    const response = await api.get("/returnClients/all", {
      params: status ? { status } : {},
    });
    return extractArray(response.data).flatMap(mapReturnClientRows);
  };

  const runExport = async (exporter, transform, statusFilter) => {
    if (loading) return;

    setLoading(true);
    try {
      const rows = await fetchAllReturnClients(statusFilter);
      const finalRows = typeof transform === "function" ? transform(rows) : rows;
      await exporter(finalRows);
    } catch (error) {
      console.error("Error exportando devoluciones de clientes:", error);
      alert("No se pudieron exportar las devoluciones de clientes.");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    exportReturnClientsExcel: ({ transform, statusFilter } = {}) =>
      runExport(generateProductReturnsXLS, transform, statusFilter),
    exportReturnClientsPdf: ({ transform, statusFilter } = {}) =>
      runExport(generateProductReturnsPDF, transform, statusFilter),
  };
};

