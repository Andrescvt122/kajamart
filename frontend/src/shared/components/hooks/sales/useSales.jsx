import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/sales";

export const useSales = () => {
  const limit = 6;

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage, setPerPage] = useState(limit);

  const fetchSales = async (pageNumber = page) => {

    setLoading(true);
    setError(null);

    try {

      const response = await axios.get(
        `${API_URL}?page=${pageNumber}&limit=${limit}`
      );

      setSales(response.data.data);
      setTotalPages(response.data.pagination.totalPages ?? 1);
      setPage(response.data.pagination.page ?? pageNumber);
      setTotalItems(response.data.pagination.total ?? 0);
      setPerPage(response.data.pagination.limit ?? limit);

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
    totalItems,
    perPage,
    setPage: fetchSales, // 👈 cambiar página
    refetch: fetchSales
  };
};
