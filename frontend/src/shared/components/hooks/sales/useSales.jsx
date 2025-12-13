// src/shared/components/hooks/sales/useSales.jsx
import { useCallback, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ENDPOINT = `${API_BASE}/kajamart/api/sales`;

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(ENDPOINT);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error cargando ventas");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  return { sales, loading, error, refetch: fetchSales };
}
