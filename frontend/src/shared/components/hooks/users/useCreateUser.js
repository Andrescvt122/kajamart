import { useState } from "react";
import axios from "axios";
const API_URL = "http://localhost:3000/kajamart/api/users";

export const useCreateUsuario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUsuario = async (nuevoUsuario) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(API_URL, nuevoUsuario);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return { createUsuario, loading, error };
};
