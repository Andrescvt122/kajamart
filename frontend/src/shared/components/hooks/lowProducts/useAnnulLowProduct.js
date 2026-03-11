import { useState } from "react";
import api from "../../../../api/axiosConfig";

export const useAnnulLowProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const annulLowProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/lowProducts/${id}/anular`, {});
      return true;
    } catch (err) {
      const payload = err?.response?.data ?? {};
      setError(payload.error || payload.message || "No se pudo anular la baja de producto.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { annulLowProduct, loading, error };
};
