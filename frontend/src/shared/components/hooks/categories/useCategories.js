// shared/hooks/useCategories.js
import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart";
const API = `${API_BASE}/api/categories`;

const mapFromApi = (cat) => ({
  id_categoria: cat.id_categoria,
  id: `CAT${String(cat.id_categoria).padStart(3, "0")}`,
  nombre: cat.nombre_categoria,
  descripcion: cat.descripcion_categoria,
  estado: cat.estado ? "Activo" : "Inactivo",
});

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(API, { signal: controller.signal });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || "Error al cargar categorías");

      setCategories(Array.isArray(data) ? data.map(mapFromApi) : []);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("❌ useCategories:", err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchCategories();
    return () => abortRef.current?.abort();
  }, [fetchCategories]);

  // Helpers para actualizar estado local sin refetch (optimista)
  const addLocal = useCallback((created) => {
    setCategories((prev) => [mapFromApi(created), ...prev]);
  }, []);

  const updateLocal = useCallback((updated) => {
    setCategories((prev) =>
      prev.map((c) => (c.id_categoria === updated.id_categoria ? mapFromApi(updated) : c))
    );
  }, []);

  const removeLocal = useCallback((id_categoria) => {
    setCategories((prev) => prev.filter((c) => c.id_categoria !== id_categoria));
  }, []);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    addLocal,
    updateLocal,
    removeLocal,
  };
}
