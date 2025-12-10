import { useState, useCallback } from "react";
import axios from "axios";

export function useDeleteDetailProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [success, setSuccess] = useState(null);

  const deleteDetailProduct = useCallback(async (idDetalleProducto) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(
        "http://localhost:3000/kajamart/api/detailsProducts/delete",
        {
          params: { q: idDetalleProducto }, // ?q=<id_detalle_producto>
        }
      );

      setSuccess(response.data?.message || "Detalle eliminado correctamente");
      return response.data;
    } catch (err) {
      console.error("Error al eliminar detalle:", err);
      const message =
        err.response?.data?.message || "Error al eliminar detalle";
      setError(message);
      throw err; // por si el componente que lo usa quiere capturar
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteDetailProduct,
    loading,
    error,
    success,
  };
}
