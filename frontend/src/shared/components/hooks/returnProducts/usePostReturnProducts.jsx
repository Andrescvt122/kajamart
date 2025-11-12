import { useState } from "react";
import axios from "axios";
import { useFetchReturnProducts } from "./useFetchReturnProducts";

const API_URL = "http://localhost:3000/kajamart/api/returnProducts";

export const usePostReturnProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const postReturnProducts = async (id_responsable, selectedProducts) => {
    setLoading(true);
    setError(null);
    setSuccess(false)
    try {
      // 🧾 Adaptar los datos al formato del backend
      console.log(selectedProducts);
      console.log(selectedProducts[0].returnReason);
      console.log(selectedProducts[0].es_devolucion);
      const payload = {
        id_responsable,
        products: selectedProducts.map((p) => ({
          id_detalle_producto: p.id_detalle_producto,
          cantidad: p.returnQuantity || 1,
          nombre_producto: p.productos.nombre,
          es_descuento: p.es_devolucion, // booleano según acción seleccionada
          motivo: selectedProducts[0].returnReason,
          es_devolucion: selectedProducts[0].es_devolucion,
        })),
      };

      const response = await axios.post(API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Devolución registrada:", response.data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      console.error("❌ Error al registrar devolución:", err);
      setError("Error al registrar la devolución");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { postReturnProducts, loading, error, success };
};
