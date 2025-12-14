// src/shared/components/hooks/sales/useSales.jsx
import { useCallback, useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const ENDPOINT = `${API_BASE}/kajamart/api/sales`;

function extractArray(json) {
  if (Array.isArray(json)) return json;

  // soporta wrappers comunes
  const candidates = [
    json?.sales,
    json?.ventas,
    json?.data,
    json?.results,
    json?.items,
  ];

  const arr = candidates.find(Array.isArray);
  return arr || [];
}

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
        let msg = "";
        try {
          const j = await res.json();
          msg = j?.message || j?.error || JSON.stringify(j);
        } catch {
          msg = await res.text();
        }
        throw new Error(msg || `HTTP ${res.status}`);
      }

      const json = await res.json();

      // 👇 Debug rápido (temporal)
      console.log("GET /sales response:", json);

      setSales(extractArray(json));
    } catch (e) {
      setError(e?.message || "Error cargando ventas");
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
