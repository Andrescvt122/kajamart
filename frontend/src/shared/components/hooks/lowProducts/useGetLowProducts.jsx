import { useState, useMemo, useRef, useEffect } from "react";
import api from "../../../../api/axiosConfig";

const API_PATH = "/lowProducts"; // relative to baseURL in axios config

export const useGetLowProducts = (initialLimit = 6) => {
  const [pagesCache, setPagesCache] = useState({});
  const [pageCursors, setPageCursors] = useState({ 1: null });
  const [meta, setMeta] = useState({ limit: initialLimit, nextCursor: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastNextCursor = useRef(null);
  const pagesCacheRef = useRef({});
  const pageCursorsRef = useRef({ 1: null });
  const metaRef = useRef({ limit: initialLimit, nextCursor: null });

  useEffect(() => {
    pagesCacheRef.current = pagesCache;
  }, [pagesCache]);

  useEffect(() => {
    pageCursorsRef.current = pageCursors;
  }, [pageCursors]);

  useEffect(() => {
    metaRef.current = meta;
  }, [meta]);

  const mapItem = (low) => ({
    idLow: low.id_baja_productos,
    dateLow: new Date(low.fecha_baja).toISOString().split("T")[0],
    createdAt:
      low.created_at ||
      low.createdAt ||
      low.fecha_creacion ||
      low.fecha_baja ||
      null,
    isActive: Boolean(
      low.estado ?? low.activo ?? low.isActive ?? low.is_active ?? true
    ),
    responsible: low.nombre_responsable,
    total: Number(low.total_precio_baja),
    products: (() => {
      const details = low.detalle_productos_baja || [];
      if (details.length > 0) {
        return details.map((p) => ({
          id: p.id_detalle_productos,
          name:
            p.nombre_producto ||
            p.detalle_productos?.productos?.nombre ||
            "Sin producto",
          lowQuantity: Number(p.cantidad) || 0,
          reason: p.motivo,
          category:
            p.categoria ||
            p.categoria_producto ||
            p.categoriaProducto ||
            p.nombre_categoria ||
            p.nombreCategoria ||
            p.category ||
            p.detalle_productos?.productos?.categorias?.nombre_categoria ||
            "Sin categoría",
          totalValue: Number(p.total_producto_baja ?? 0),
        }));
      }

      return [
        {
          id: `low-${low.id_baja_productos}-empty`,
          name: "Sin productos asociados",
          lowQuantity: Number(low.cantida_baja) || 0,
          reason: "Sin detalle de productos",
          category: "Sin categoría",
          totalValue: Number(low.total_precio_baja ?? 0),
        },
      ];
    })(),
  });

  const getTotalPages = () => {
    const loaded = Object.keys(pagesCache).map(Number);
    const last = loaded.length ? Math.max(...loaded) : 0;
    return last + (meta.nextCursor ? 1 : 0);
  };

  const getLoadedCount = () => {
    return Object.values(pagesCache).reduce((acc, arr) => acc + arr.length, 0);
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
      const params = { limit: metaRef.current.limit };
      const cursor = pageCursorsRef.current[pageNumber];
      if (cursor) params.cursor = cursor;

      const response = await api.get(API_PATH, { params });
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.lowProducts || response.data?.data || [];

      const adaptedData = rawData.map(mapItem);

      setPagesCache((prev) => {
        const next = { ...prev, [pageNumber]: adaptedData };
        pagesCacheRef.current = next;
        return next;
      });

      const newNext = response.data?.meta?.nextCursor ?? null;
      lastNextCursor.current = newNext;
      setMeta((prev) => {
        const next = { ...prev, nextCursor: newNext };
        metaRef.current = next;
        return next;
      });
      if (newNext) {
        setPageCursors((prev) => {
          const next = { ...prev, [pageNumber + 1]: newNext };
          pageCursorsRef.current = next;
          return next;
        });
      }

      return adaptedData;
    } catch (err) {
      console.error("❌ Error al obtener las bajas:", err);
      setError(
        err.response?.data?.error || "Error al obtener las bajas de productos."
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    pagesCacheRef.current = {};
    pageCursorsRef.current = { 1: null };
    metaRef.current = { limit: initialLimit, nextCursor: null };
    lastNextCursor.current = null;
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
