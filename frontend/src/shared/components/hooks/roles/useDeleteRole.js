import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/roles";

export const useDeleteRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRole = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.delete(`${API_URL}/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el rol");
    } finally {
      setLoading(false);
    }
  };

  return { deleteRole, loading, error };
};
