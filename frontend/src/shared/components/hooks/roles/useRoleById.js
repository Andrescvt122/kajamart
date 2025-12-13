import { useState, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/roles";

export const useRoleById = () => {
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRoleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/${id}`);
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
