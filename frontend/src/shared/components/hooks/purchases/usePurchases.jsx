import { useEffect, useState } from "react";

export function usePurchases({ search, page, perPage }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          search: search || "",
          page: String(page),
          perPage: String(perPage),
        });

        const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/purchases?${params}`);
        const data = await resp.json();

        if (!resp.ok) throw new Error(data?.message || "Error cargando compras");

        if (!alive) return;
        setItems(data.items || []);
        setMeta(data.meta || meta);
      } catch (e) {
        if (!alive) return;
        setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, perPage]);

  return { items, meta, loading, error };
}