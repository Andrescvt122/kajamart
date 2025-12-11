import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/lowProducts";

export const usePostLowProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const postLowProducts = async (id_responsable, products) => {
    console.log(products);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 🧮 Calcular total_producto_baja por cada producto
      const productsWithTotals = products.map((p) => ({
        id_detalle_productos: p.id,
        cantidad: p.requestedQuantity,
        motivo: p.reason,
        id_producto_traslado: p.id_producto_traslado ?? null,
        cantidad_traslado: p.cantidad_traslado ?? null,
        total_producto_baja: p.unitCost * p.requestedQuantity,
      }));

      const body = {
        id_responsable,
        products: productsWithTotals,
      };

      const res = await axios.post(API_URL, body);

      setResponseData(res.data);
      setSuccess(true);
      return res.data;
    } catch (err) {
      console.error("❌ Error al registrar baja:", err);
      setError(
        err.response?.data?.error || "Error al registrar la baja de productos."
      );
    } finally {
      setLoading(false);
    }
  };

  return { postLowProducts, loading, error, success, responseData };
};
