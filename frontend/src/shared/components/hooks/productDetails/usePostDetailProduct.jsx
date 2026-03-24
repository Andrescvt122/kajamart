import { useState } from "react";
import api from "../../../../api/axiosConfig";

export const usePostDetailProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const postDetailProduct = async (productData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 🧾 Estructura esperada por el controlador
      const payload = {
        id_producto: productData.id_producto || productData.productos?.id_producto,
        codigo_barras: productData.registeredBarcode,
        fecha_vencimiento: productData.registeredExpiry || null,
        stock_producto: Number(productData.registeredQuantity),
      };
      console.log(productData);
      console.log("📦 Enviando payload:", payload);

      const res = await api.post("/detailsProducts", payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Registro de detalle creado:", res.data);
      setSuccess(true);
      setData(res.data);
      return res.data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al registrar el detalle del producto";
      console.error("❌ Error al registrar detalle:", err.response?.data || err.message);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return { postDetailProduct, loading, error, success,data };
};
