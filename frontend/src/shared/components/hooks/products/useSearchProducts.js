import { useEffect, useState } from "react";
import api from "../../../../api/axiosConfig";

export const useSearchProducts = (searchTerm) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const term = String(searchTerm || "").trim();
    if (!term) {
      setData([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let ignore = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/products/search", {
          params: { q: term },
        });
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        if (!ignore) setData(rows);
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            "Error al buscar productos."
          );
          setData([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    run();

    return () => {
      ignore = true;
    };
  }, [searchTerm]);

  return { data, loading, error };
};
