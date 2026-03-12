import { useEffect, useState } from "react";
import api from "../../../../api/axiosConfig";

const mapCategory = (cat) => ({
  id_categoria: cat.id_categoria,
  id: `CAT${String(cat.id_categoria).padStart(3, "0")}`,
  nombre: cat.nombre_categoria,
  descripcion: cat.descripcion_categoria,
  estado: cat.estado ? "Activo" : "Inactivo",
});

export const useSearchCategories = (searchTerm) => {
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
        const response = await api.get("/categories/search", {
          params: { q: term },
        });
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        if (!ignore) setData(rows.map(mapCategory));
      } catch (err) {
        if (!ignore) {
          setError(
            err?.response?.data?.message ||
            err?.message ||
            "Error al buscar categorías."
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
