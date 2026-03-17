import { useState } from "react";
import api from "../../../../api/axiosConfig";
import { useAuth } from "../../../../context/useAtuh";
export const useAnnulReturnClient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {payload} = useAuth();
  const annulReturnClient = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/returnClients/${id}/anular`, {id_responsable:payload.uid});
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo anular la devolución de cliente.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { annulReturnClient, loading, error };
};
