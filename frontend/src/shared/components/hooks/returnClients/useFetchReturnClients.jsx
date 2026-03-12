import { useState, useMemo, useRef } from "react";
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
  const [pagesCache, setPagesCache] = useState({});
  const [pageCursors, setPageCursors] = useState({ 1: null });
  const [meta, setMeta] = useState({
    page: 1,
    limit: initialLimit,
    totalItems: 0,
    totalPages: 1,
    nextCursor: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pagesCacheRef = useRef({});
  const pageCursorsRef = useRef({ 1: null });
  const metaRef = useRef({
    page: 1,
    limit: initialLimit,
    totalItems: 0,
    totalPages: 1,
    nextCursor: null,
  });

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
    if (Number(meta.totalPages) > 0) {
      return Math.max(1, Number(meta.totalPages));
    }

    const loadedPages = Object.keys(pagesCache).map(Number);
    const lastLoadedPage = loadedPages.length ? Math.max(...loadedPages) : 0;
    return Math.max(1, lastLoadedPage + (meta.nextCursor ? 1 : 0));
  };

  const getLoadedCount = () => {
    return Number(meta.totalItems) || 0;
  };

  const fetchPage = async (pageNumber, options = {}) => {
    const { force = false } = options;
    if (pageNumber < 1) return [];

    if (pageNumber > 1 && pageCursorsRef.current[pageNumber] === undefined) {
      await fetchPage(pageNumber - 1, options);
    }

    if (!force && pagesCacheRef.current[pageNumber]) {
      return pagesCacheRef.current[pageNumber];
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(API_PATH, {
        params: {
          limit: metaRef.current.limit,
          ...(pageCursorsRef.current[pageNumber]
            ? { cursor: pageCursorsRef.current[pageNumber] }
            : {}),
        },
      });
      const payload = res.data;
      const raw = Array.isArray(payload)
        ? payload
        : payload?.returnClients || payload?.data || [];
      const mapped = raw.map(mapItem);

      setPagesCache((prev) => {
        const next = { ...prev, [pageNumber]: mapped };
        pagesCacheRef.current = next;
        return next;
      });

      const responseMeta = res.data?.meta || {};
      const nextMeta = {
        page: Number(responseMeta.page) || pageNumber,
        limit: Number(responseMeta.limit) || metaRef.current.limit,
        totalItems: Number(responseMeta.totalItems) || mapped.length,
        totalPages: Number(responseMeta.totalPages) || 0,
        nextCursor: responseMeta.nextCursor ?? null,
      };

      metaRef.current = nextMeta;
      setMeta(nextMeta);

      if (nextMeta.nextCursor) {
        setPageCursors((prev) => {
          const next = { ...prev, [pageNumber + 1]: nextMeta.nextCursor };
          pageCursorsRef.current = next;
          return next;
        });
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
    pagesCacheRef.current = {};
    pageCursorsRef.current = { 1: null };
    metaRef.current = {
      page: 1,
      limit: initialLimit,
      totalItems: 0,
      totalPages: 1,
      nextCursor: null,
    };
    setPagesCache({});
    setPageCursors({ 1: null });
    setMeta({
      page: 1,
      limit: initialLimit,
      totalItems: 0,
      totalPages: 1,
      nextCursor: null,
    });
    setError(null);
  };

  const allItems = useMemo(() => Object.values(pagesCache).flat(), [pagesCache]);

  const fetchAll = async () => {
    reset();
    const firstPage = await fetchPage(1, { force: true });
    const totalPages = Math.max(1, Number(metaRef.current.totalPages) || 1);
    let acc = [...firstPage];

    for (let page = 2; page <= totalPages; page += 1) {
      const pageData = await fetchPage(page, { force: true });
      acc = acc.concat(pageData || []);
    }

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
