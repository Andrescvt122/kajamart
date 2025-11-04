import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/returnProducts";

export const useFetchReturnProducts = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReturnProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL);
      const data = res.data.returnProducts || [];

      // 🧮 Adaptar los datos al formato que usa tu tabla
      const flattened = data.flatMap((r) => {
        const date = r.fecha_devolucion ? new Date(r.fecha_devolucion) : null;

        return {
          idReturn: r.id_devolucion_product,
          dateReturn: date ? date.toLocaleDateString("es-CO") : "",
          dateISO: date ? date.toISOString() : null,
          responsable: r.nombre_responsable,
          products:
            (r.detalle_devolucion_producto || []).map((d) => ({
              idProduct: d.id_detalle_producto,
              name: d.nombre_producto,
              quantity: Number(d.cantidad_devuelta) || 0,
              discount: d.es_descuento,
              reason: d.motivo,
              category:
                d.categoria ||
                d.categoria_producto ||
                d.categoriaProducto ||
                d.nombre_categoria ||
                d.nombreCategoria ||
                d.category ||
                "Sin categoría",
            })) || [],
        };
      });

      setReturns(flattened);
    } catch (err) {
      console.error("❌ Error al obtener devoluciones:", err);
      setError("No se pudieron cargar las devoluciones de productos");
    } finally {
      setLoading(false);
    }
    console.log("refetch");
  };

  useEffect(() => {
    fetchReturnProducts();
  }, []);

  return { returns, loading, error, refetch: fetchReturnProducts };
};
