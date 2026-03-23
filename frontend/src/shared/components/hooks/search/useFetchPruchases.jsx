import { useEffect, useState } from "react";

const BASE_URL = "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api";

export function useFetchPurchases(searchTerm) {
  const [data, setData] = useState([]); // aquí guardamos el array purchase
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const term = (searchTerm || "").trim();

    // Si está vacío, limpiamos resultados (mismo patrón típico de search)
    if (!term) {
      setData([]);
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${BASE_URL}/search/purchase/${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }

        const json = await res.json();

        // Tu API retorna { purchase: [...] }
        const list = Array.isArray(json?.purchase) ? json.purchase : [];
        setData(list);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e?.message || "Ocurrió un error consultando compras.");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    run();
    return () => controller.abort();
  }, [searchTerm]);

  return { data, loading, error };
}
