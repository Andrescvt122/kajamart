import { useState, useEffect, useMemo, useRef } from "react";
import api from "../../../../api/axiosConfig";

const API_PATH = "/returnProducts"; // relative to baseURL in axios config

export const useFetchReturnProducts = (initialLimit = 6) => {
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

  const mapItem = (r) => {
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
        barcode: detalle?.codigo_barras_producto_compra || "",
        price: producto?.precio_venta ?? null,
        supplier: proveedor?.nombre || purchaseSupplierName || "Sin proveedor",
      };
    });

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
      r.created_at ||
      r.createdAt ||
      r.fecha_creacion ||
      r.fecha_devolucion ||
      null,
    isActive: Boolean(r.estado ?? r.activo ?? r.isActive ?? r.is_active ?? true),
    responsable: r.nombre_responsable,
    numeroFactura: r.numero_factura,
    comprobante: {
      name: r.comprobante_nombre ?? null,
      type: r.comprobante_mime ?? null,
      url: r.comprobante_url ?? null,
      size: r.comprobante_size ?? null,
    },
    products: normalizedProducts,
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

      const res = await api.get(API_PATH, { params });
      const payload = res.data;
      const data = Array.isArray(payload)
        ? payload
        : payload?.returnProducts || payload?.data || [];

      const mapped = data.map(mapItem);

      setPagesCache((prev) => {
        const next = { ...prev, [pageNumber]: mapped };
        pagesCacheRef.current = next;
        return next;
      });

      const newNext = res.data?.meta?.nextCursor ?? null;
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

      return mapped;
    } catch (err) {
      console.error("Error al obtener devoluciones:", err);
      setError("No se pudieron cargar las devoluciones de productos");
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

  // convenience getter to flatten all cached pages
  const allItems = useMemo(() => {
    return Object.values(pagesCache).flat();
  }, [pagesCache]);

  // fetch every page until there is no nextCursor
  const fetchAll = async () => {
    reset();
    let page = 1;
    let accumulated = [];
    while (true) {
      const pageData = await fetchPage(page);
      accumulated = accumulated.concat(pageData || []);
      if (!meta.nextCursor) break;
      page += 1;
    }
    return accumulated;
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
