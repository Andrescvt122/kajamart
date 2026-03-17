import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:3000/kajamart/api";

export function useFetchSales(searchTerm) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const term = (searchTerm || "").trim();

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
          `${BASE_URL}/search/sale/${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error(`Error HTTP: ${res.status}`);
        }

        const json = await res.json();
        const list = Array.isArray(json?.sale) ? json.sale : [];
        setData(list);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e?.message || "Ocurrió un error consultando ventas.");
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
