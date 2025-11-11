import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/roles";

export const useUpdateRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateRole = async (id, rolActualizado) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(`${API_URL}/${id}`, rolActualizado);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el rol");
    } finally {
      setLoading(false);
    }
  };

  return { updateRole, loading, error };
};
