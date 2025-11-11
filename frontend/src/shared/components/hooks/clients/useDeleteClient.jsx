// hooks/clients/useClientDelete.jsx
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/clients";

export const useClientDelete = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteClient = async (id) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.delete(`${API_URL}/${id}`);
      setSuccess(true);
      return true;
    } catch (err) {
      console.error("❌ Error al eliminar cliente:", err);
      setError(
        err.response?.data?.error || "Error al eliminar cliente."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteClient, loading, error, success };
};