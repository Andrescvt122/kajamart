// src/shared/components/hooks/sales/useUpdateSaleStatus.js
import { useCallback, useState } from "react";

const API_BASE = "http://localhost:3000/kajamart/api";

export function useUpdateSaleStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateStatus = useCallback(async (id, estado) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/sales/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || `HTTP ${res.status}`);
      }

      return data;
    } catch (e) {
      setError(e?.message || "Error actualizando estado");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStatus, loading, error };
}
