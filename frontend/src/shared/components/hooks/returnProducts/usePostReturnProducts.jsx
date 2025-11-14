import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/returnProducts";

export const usePostReturnProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Ahora recibe el payload completo ya armado en el modal
  const postReturnProducts = async (payload) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await axios.post(API_URL, payload, {
        headers: { "Content-Type": "application/json" },
      });
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
