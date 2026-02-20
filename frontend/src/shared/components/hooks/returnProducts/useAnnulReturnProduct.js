import { useState } from "react";
import api from "../../../../api/axiosConfig";

export const useAnnulReturnProduct = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const annulReturnProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/returnProducts/${id}/anular`, {});
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo anular la devolución de producto.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { annulReturnProduct, loading, error };
};
