import { useEffect, useState } from "react";
import api from "../../../../api/axiosConfig";
import { formatDateOnly } from "../../../utils/dateTime";
import { toStatusFilterParam } from "../../../utils/statusFilter";

const mapLowProduct = (low) => ({
  idLow: low.id_baja_productos,
  dateLow: formatDateOnly(low.fecha_baja || low.created_at || low.createdAt),
  createdAt:
    low.created_at ||
    low.createdAt ||
    low.created_at_local ||
    low.createdAtLocal ||
    low.fecha_creacion ||
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

export const useSearchLowProducts = (searchTerm, statusFilter = "all") => {
  const apiStatus = toStatusFilterParam(statusFilter);
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
        const response = await api.get("/lowProducts/search", {
          params: {
            q: term,
            ...(apiStatus ? { status: apiStatus } : {}),
          },
        });
        const rows = Array.isArray(response.data) ? response.data : response.data?.data || [];
        if (!ignore) setData(rows.map(mapLowProduct));
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.error ||
            err?.message ||
            "Error al buscar bajas de productos."
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
  }, [searchTerm, apiStatus]);

  return { data, loading, error };
};
