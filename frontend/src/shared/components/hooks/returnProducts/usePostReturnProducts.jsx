import { useState } from "react";
import api from "../../../../api/axiosConfig";

export const usePostReturnProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const postReturnProducts = async ({ jsonPayload, comprobanteFile }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(jsonPayload));

      if (comprobanteFile) {
        formData.append("comprobante", comprobanteFile);
      }

      const response = await api.post("/returnProducts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      return response.data;
    } catch (err) {
      console.error("❌ Error al registrar devolución:", err);
      console.error("❌ Respuesta del backend:", err?.response?.data);
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Error al registrar la devolución"
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { postReturnProducts, loading, error, success };
};
