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
      const productsWithTotals = products.map((p) => {
        const cantidadOrigen = Number(p.requestedQuantity) || 0;
        const cantidadTraslado = Number(p.cantidad_traslado) || 0;
        const factorConversion =
          cantidadOrigen > 0 ? cantidadTraslado / cantidadOrigen : null;

        const lowProduct = {
          id_detalle_productos: p.id,
          cantidad: cantidadOrigen,
          motivo: p.reason,
          total_producto_baja: p.unitCost * cantidadOrigen,
        };

        if (p.reason === "venta unitaria") {
          lowProduct.id_detalle_destino = p.id_producto_traslado ?? null;
          lowProduct.cantidad_traslado = cantidadTraslado;
          lowProduct.factor_conversion =
            factorConversion && factorConversion > 0 ? factorConversion : null;
        }

        return lowProduct;
      });

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
