import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/detailsProducts";

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

      const res = await axios.post(API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Registro de detalle creado:", res.data);
      setSuccess(true);
      setData(res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Error al registrar detalle:", err.response?.data || err.message);
      setError("Error al registrar el detalle del producto");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { postDetailProduct, loading, error, success,data };
};
