import { useCallback, useState } from "react";

const API_URL = "http://localhost:3000/kajamart/api/sales";

export default function useCreateSale() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createSale = useCallback(async (payload) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      return data;
    } catch (e) {
      setError(e.message || "Error creando venta");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createSale, loading, error };
}
