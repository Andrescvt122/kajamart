import { useState, useEffect } from "react";
import axios from "axios";

// Ajusta la ruta base al prefijo real del backend
const API_URL = "http://localhost:3000/kajamart/api/users";

export const useUsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(API_URL);
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.error || "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  // Devolvemos también setUsuarios para permitir actualizaciones locales (optimistas)
  return { usuarios, setUsuarios, loading, error, getUsuarios };
};
