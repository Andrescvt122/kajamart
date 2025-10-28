import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/lowProducts";

export const useGetLowProducts = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLowProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);

      const adaptedData = response.data.map((low) => ({
        idLow: low.id_baja_productos,
        dateLow: new Date(low.fecha_baja).toISOString().split("T")[0],
        responsible: low.nombre_responsable,
        total: Number(low.total_precio_baja),
        products:
          low.detalle_productos_baja?.map((p) => ({
            id: p.id_detalle_productos,
            name: p.nombre_producto,
            lowQuantity: Number(p.cantidad) || 0,
            reason: p.motivo,
            category:
              p.categoria ||
              p.categoria_producto ||
              p.categoriaProducto ||
              p.nombre_categoria ||
              p.nombreCategoria ||
              p.category ||
              "Sin categoría",
            totalValue: Number(p.total_producto_baja ?? 0),
          })) || [],
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
  }, []);

  return { data, loading, error, refetch: fetchLowProducts };
};
