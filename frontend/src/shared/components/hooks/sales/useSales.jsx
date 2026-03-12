import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/sales";

export const useSales = () => {

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  const fetchSales = async (pageNumber = page) => {

    setLoading(true);
    setError(null);

    try {

      const response = await axios.get(
        `${API_URL}?page=${pageNumber}&limit=${limit}`
      );

      setSales(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setPage(response.data.pagination.page);

    } catch (err) {

      console.error("❌ Error obteniendo ventas:", err);

      setError(
        err.response?.data?.message || "Error al obtener ventas"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales(1);
  }, []);

  return {
    sales,
    loading,
    error,
    page,
    totalPages,
    setPage: fetchSales, // 👈 cambiar página
    refetch: fetchSales
  };
};
