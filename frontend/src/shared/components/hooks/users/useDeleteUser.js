import { useState } from "react";
import axios from "axios";
const API_URL = "http://localhost:3000/users";

export const useDeleteUsuario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteUsuario = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.delete(`${API_URL}/${id}`);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  };

  return { deleteUsuario, loading, error };
};
