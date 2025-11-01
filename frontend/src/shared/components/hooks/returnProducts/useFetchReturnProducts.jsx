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
      const flattened = data.flatMap((r) =>({
        idReturn: r.id_devolucion_product,
        dateReturn: new Date(r.fecha_devolucion).toLocaleDateString("es-CO"),
        responsable: r.nombre_responsable,
        products : (r.detalle_devolucion_producto || []).map((d) => ({
          idProduct: d.id_detalle_producto,
          name: d.nombre_producto,
          quantity: d.cantidad_devuelta,
          discount: d.es_descuento,
          reason: d.motivo,
        }))
      })
      );
      console.log(flattened);

      setReturns(flattened);
    } catch (err) {
      console.error("❌ Error al obtener devoluciones:", err);
      setError("No se pudieron cargar las devoluciones de productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnProducts();
  }, []);

  return { returns, loading, error, refetch:fetchReturnProducts };
};
