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
        r.fecha_creacion ||
        r.fecha_devolucion ||
        r.createdAt ||
        r.created_at ||
        null,
      isActive: Boolean(r.estado ?? r.activo ?? r.isActive ?? r.is_active ?? true),
      responsable: r.nombre_responsable,
      numeroFactura: r.numero_factura,
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

  const fetchPage = async (pageNumber) => {
    if (pageNumber < 1) return [];
    if (pageNumber > 1 && pageCursors[pageNumber] === undefined) {
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
      const payload = res.data;
      const data = Array.isArray(payload)
        ? payload
        : payload?.returnProducts || payload?.data || [];

      const mapped = data.map(mapItem);

      setPagesCache((prev) => ({ ...prev, [pageNumber]: mapped }));

      const newNext = res.data?.meta?.nextCursor ?? null;
      lastNextCursor.current = newNext;
      setMeta((prev) => ({ ...prev, nextCursor: newNext }));
      if (newNext) {
        setPageCursors((prev) => ({ ...prev, [pageNumber + 1]: newNext }));
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
