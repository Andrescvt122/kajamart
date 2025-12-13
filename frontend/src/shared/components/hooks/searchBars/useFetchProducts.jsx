import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/search/detailsProducts";

export const useFetchProduct = (searchParam) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchParam) return; // evita llamadas vacías

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/${searchParam}`);
        setData(response.data);
      } catch (err) {
        console.error("Error al obtener el producto:", err);
        setError(err.response?.data?.error || "Error al obtener el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [searchParam]);

  return { data, loading, error };
};