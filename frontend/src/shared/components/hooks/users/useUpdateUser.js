import { useState } from "react";
import axios from "axios";
const API_URL = "http://localhost:3000/users";

export const useUpdateUsuario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUsuario = async (id, usuarioActualizado) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.put(`${API_URL}/${id}`, usuarioActualizado);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  return { updateUsuario, loading, error };
};
