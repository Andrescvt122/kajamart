import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/lowProducts";

const getCategoryName = (categoria) => {
  if (Array.isArray(categoria)) {
    return categoria.find((item) => item?.nombre_categoria)?.nombre_categoria;
  }

  return categoria?.nombre_categoria || null;
};

const extractPayload = (payload) => ({
  data: Array.isArray(payload)
    ? payload
    : payload?.lowProducts || payload?.data || [],
  meta: payload?.meta || null,
});

export const useGetLowProducts = (options = {}) => {
  const { limit } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLowProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let rawData = [];

      if (limit) {
        let cursor = null;
        const visitedCursors = new Set();

        while (true) {
          const response = await axios.get(API_URL, {
            params: {
              limit,
              ...(cursor != null ? { cursor } : {}),
            },
          });
          const payload = extractPayload(response.data);
          rawData = rawData.concat(payload.data || []);

          const nextCursor = payload.meta?.nextCursor;
          if (nextCursor == null || visitedCursors.has(nextCursor)) break;

          visitedCursors.add(nextCursor);
          cursor = nextCursor;
        }
      } else {
        const response = await axios.get(API_URL);
        rawData = extractPayload(response.data).data;
      }

      const adaptedData = rawData.map((low) => ({
        idLow: low.id_baja_productos,
        dateLow: new Date(low.fecha_baja).toISOString().split("T")[0],
        createdAt:
          low.fecha_creacion ||
          low.fecha_baja ||
          low.createdAt ||
          low.created_at ||
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
              name: p.nombre_producto,
              lowQuantity: Number(p.cantidad) || 0,
              reason: p.motivo,
              category:
                getCategoryName(
                  p.detalle_productos?.productos?.categorias ||
                    p.detalle_productos?.categorias
                ) ||
                p.categoria ||
                p.categoria_producto ||
                p.categoriaProducto ||
                p.nombre_categoria ||
                p.nombreCategoria ||
                p.category ||
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
      }));

      setData(adaptedData);
    } catch (err) {
      console.error("❌ Error al obtener las bajas:", err);
      setError(
        err.response?.data?.error || "Error al obtener las bajas de productos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowProducts();
  }, [limit]);

  return { data, loading, error, refetch: fetchLowProducts };
};
