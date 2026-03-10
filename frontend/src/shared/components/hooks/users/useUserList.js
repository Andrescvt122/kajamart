import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/users";

export const useUsuariosList = ({ page = 1, limit = 6, search = "" } = {}) => {
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(API_URL, {
        params: { page, limit, search: search || undefined },
      });
      setUsuarios(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.response?.data?.error || "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const getAllUsuariosForExport = async (currentSearch) => {
    try {
      const { data } = await axios.get(API_URL, {
        params: { limit: total > 0 ? total : 10000, search: currentSearch || undefined },
      });
      return data.data || [];
    } catch (err) {
      console.error("Error fetching all users for export", err);
      return [];
    }
  };

  useEffect(() => {
    getUsuarios();
  }, [getUsuarios]);

  return { usuarios, setUsuarios, total, totalPages, loading, error, getUsuarios, getAllUsuariosForExport };
};
