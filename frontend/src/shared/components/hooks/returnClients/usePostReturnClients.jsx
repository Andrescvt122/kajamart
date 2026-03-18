import { useState } from "react";
import axios from "axios";

const API_URL = "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api/returnClients";

export const usePostReturnClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const postReturnClients = async (payload) => {
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
      console.error("❌ Error al registrar devolución de cliente:", err);
      setError("No se pudo registrar la devolución de cliente");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { postReturnClients, loading, error, success };
};
