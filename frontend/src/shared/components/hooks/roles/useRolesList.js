// Archivo: useRolesList.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api/roles";

export const useRolesList = ({ page = 1, limit = 6, search = "" } = {}) => {
  const [roles, setRoles] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRoles = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        params: { page, limit, search: search || undefined },
      });
      setRoles(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("❌ Error al obtener roles:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    getRoles();
  }, [getRoles]);

  return {
    roles,
    total,
    totalPages,
    loading,
    error,
    getRoles,
  };
};