import { useState, useCallback } from "react";
import api from "../../../../api/axiosConfig";

const API_URL = "/roles";

export const useRoleById = () => {
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRoleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Obteniendo rol con ID:", id);
      const { data } = await api.get(`${API_URL}/${id}`);
      setRol(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || "Error al obtener el rol";
      setError(msg);
      console.error("❌ Error en getRoleById:", msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { rol, loading, error, getRoleById };
};
