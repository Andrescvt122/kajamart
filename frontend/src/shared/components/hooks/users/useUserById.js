import { useState } from "react";
import axios from "axios";
const API_URL = "http://localhost:3000/users";

export const useUsuarioById = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsuarioById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/${id}`);
      setUsuario(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al obtener usuario");
    } finally {
      setLoading(false);
    }
  };

  return { usuario, loading, error, getUsuarioById };
};
