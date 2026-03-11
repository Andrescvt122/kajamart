import { useEffect, useState, useMemo, useRef } from "react";
import api from "../../../../api/axiosConfig";

const API_PATH = "/returnClients"; // relative to baseURL in axios config

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO");
};

const getProductName = (productNode) =>
  productNode?.productos?.nombre || productNode?.nombre_producto || "Sin producto";

export const useFetchReturnClients = (initialLimit = 6) => {
  const [pagesCache, setPagesCache] = useState({}); // { pageNumber: [items] }
  const [pageCursors, setPageCursors] = useState({ 1: null }); // cursor used to fetch each page
  const [meta, setMeta] = useState({ limit: initialLimit, nextCursor: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastNextCursor = useRef(null);

  const mapItem = (item) => {
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

  const getTotalPages = () => {
    const loaded = Object.keys(pagesCache).map(Number);
    const last = loaded.length ? Math.max(...loaded) : 0;
    return last + (meta.nextCursor ? 1 : 0);
  };

  const getLoadedCount = () => {
    return Object.values(pagesCache).reduce((acc, arr) => acc + arr.length, 0);
  };

  const fetchPage = async (pageNumber) => {
    if (pageNumber < 1) return [];

    // ensure cursors up to requested page exist by loading previous pages sequentially
    if (
      pageNumber > 1 &&
      pageCursors[pageNumber] === undefined // we don't have cursor for this page
    ) {
      await fetchPage(pageNumber - 1);
    }

    if (pagesCache[pageNumber]) {
      return pagesCache[pageNumber];
    }

    setLoading(true);
    setError(null);
    try {
      const params = { limit: meta.limit };
      const cursor = pageCursors[pageNumber];
      if (cursor) params.cursor = cursor;

      const res = await api.get(API_PATH, { params });
      const raw = res.data?.data || [];
      const mapped = raw.map(mapItem);

      setPagesCache((prev) => ({ ...prev, [pageNumber]: mapped }));

      const newNext = res.data?.meta?.nextCursor ?? null;
      lastNextCursor.current = newNext;
      setMeta((prev) => ({ ...prev, nextCursor: newNext }));
      if (newNext) {
        setPageCursors((prev) => ({ ...prev, [pageNumber + 1]: newNext }));
      }

      return mapped;
    } catch (err) {
      console.error("❌ Error al obtener devoluciones de clientes:", err);
      setError("No se pudieron cargar las devoluciones de clientes");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPagesCache({});
    setPageCursors({ 1: null });
    setMeta({ limit: initialLimit, nextCursor: null });
    setError(null);
  };

  const allItems = useMemo(() => Object.values(pagesCache).flat(), [pagesCache]);

  const fetchAll = async () => {
    reset();
    let page = 1;
    let acc = [];
    // iterate until no next cursor is discovered
    do {
      const pageData = await fetchPage(page);
      acc = acc.concat(pageData || []);
      if (!lastNextCursor.current) break;
      page += 1;
    } while (true);
    return acc;
  };

  return {
    fetchPage,
    pagesCache,
    pageCursors,
    meta,
    loading,
    error,
    reset,
    getTotalPages,
    getLoadedCount,
    allItems,
    fetchAll,
  };
};
