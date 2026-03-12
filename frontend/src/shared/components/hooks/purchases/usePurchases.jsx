import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/purchases";

export const usePurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 6;

  const fetchPurchases = async (pageNumber = page) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_URL}?page=${pageNumber}&limit=${limit}`
      );

      setPurchases(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setPage(response.data.pagination.page);
    } catch (err) {
      console.error("❌ Error obteniendo compras:", err);

      setError(
        err.response?.data?.message || "Error al obtener compras"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases(1);
  }, []);

  return {
    purchases,
    loading,
    error,
    page,
    totalPages,
    setPage: fetchPurchases,
    refetch: fetchPurchases,
  };
};
