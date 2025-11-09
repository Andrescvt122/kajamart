import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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

  // ✅ Obtener categorías
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const { data } = await axios.get(API, {
        signal: abortRef.current.signal,
      });

      setCategories(Array.isArray(data) ? data.map(mapFromApi) : []);
    } catch (err) {
      if (err.name !== "CanceledError") {
        console.error("❌ useCategories:", err);
        setError(err.response?.data?.error || "Error al cargar categorías");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    return () => abortRef.current?.abort();
  }, [fetchCategories]);

  // ✅ Crear categoría
  const createCategory = useCallback(
    async (form) => {
      try {
        const { data } = await axios.post(API, {
          nombre_categoria: form.nombre,
          descripcion_categoria: form.descripcion,
          estado: form.estado === "Activo",
        });

        Swal.fire({
          icon: "success",
          title: "✅ Categoría creada",
          text: data.message || "Creación exitosa",
          timer: 1400,
          showConfirmButton: false,
          background: "#e8f5e9",
          color: "#1b5e20",
        });

        setCategories((prev) => [mapFromApi(data.category), ...prev]);
        return data.category;
      } catch (err) {
        console.error("❌ createCategory:", err);
        Swal.fire("Error", err.response?.data?.error || "No se pudo crear la categoría.", "error");
      }
    },
    []
  );

  // ✅ Actualizar categoría
  const updateCategory = useCallback(
    async (payload) => {
      try {
        const { data } = await axios.put(`${API}/${payload.id_categoria}`, {
          nombre_categoria: payload.nombre,
          descripcion_categoria: payload.descripcion,
          estado: payload.estado === "Activo",
        });

        Swal.fire({
          icon: "success",
          title: "✅ Categoría actualizada",
          text: data.message || "Actualización exitosa",
          timer: 1400,
          showConfirmButton: false,
          background: "#e8f5e9",
          color: "#1b5e20",
        });

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id_categoria === payload.id_categoria ? mapFromApi(data.category) : cat
          )
        );

        return data.category;
      } catch (err) {
        console.error("❌ updateCategory:", err);
        Swal.fire("Error", err.response?.data?.error || "No se pudo actualizar la categoría.", "error");
      }
    },
    []
  );

  // ✅ Eliminar categoría
  const deleteCategory = useCallback(async (id_categoria) => {
    try {
      const { data } = await axios.delete(`${API}/${id_categoria}`);

      Swal.fire({
        icon: "success",
        title: "✅ Categoría eliminada",
        text: data.message || "Eliminación exitosa",
        timer: 1400,
        showConfirmButton: false,
        background: "#e8f5e9",
        color: "#1b5e20",
      });

      setCategories((prev) => prev.filter((c) => c.id_categoria !== id_categoria));
    } catch (err) {
      console.error("❌ deleteCategory:", err);
      Swal.fire("Error", err.response?.data?.error || "No se pudo eliminar la categoría.", "error");
    }
  }, []);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
