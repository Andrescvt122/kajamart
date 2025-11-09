// frontend/src/shared/components/hooks/categories/categories.hooks.js
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart";
const API = `${API_BASE}/api/categories`;

// Mapea la categoría que viene del backend a la forma que usas en el front
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

  // 🔹 Obtener todas las categorías
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
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      console.error("❌ useCategories - fetchCategories:", err);
      setError(
        err.response?.data?.error || "Error al obtener las categorías."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    return () => abortRef.current?.abort();
  }, [fetchCategories]);

  // 🔹 Crear categoría (POST /api/categories)
  const createCategory = useCallback(async (form) => {
    try {
      const payload = {
        nombre_categoria: form.nombre,
        descripcion_categoria: form.descripcion,
        estado: form.estado === "Activo",
      };

      const { data } = await axios.post(API, payload);

      Swal.fire({
        icon: "success",
        title: "✅ Categoría creada",
        text: data.message || "Categoría creada correctamente",
        timer: 1400,
        showConfirmButton: false,
        background: "#e8f5e9",
        color: "#1b5e20",
      });

      // Agregar al estado local
      setCategories((prev) => [mapFromApi(data.category), ...prev]);

      return data.category;
    } catch (err) {
      console.error("❌ useCategories - createCategory:", err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al crear la categoría.",
        "error"
      );
      throw err;
    }
  }, []);

  // 🔹 Actualizar categoría (PUT /api/categories/:id)
  const updateCategory = useCallback(async (payload) => {
    try {
      const { id_categoria, nombre, descripcion, estado } = payload;

      const body = {
        nombre_categoria: nombre,
        descripcion_categoria: descripcion,
        estado: estado === "Activo",
      };

      const { data } = await axios.put(`${API}/${id_categoria}`, body);

      Swal.fire({
        icon: "success",
        title: "✅ Categoría actualizada",
        text: data.message || "Categoría actualizada correctamente",
        timer: 1400,
        showConfirmButton: false,
        background: "#e8f5e9",
        color: "#1b5e20",
      });

      const mapped = mapFromApi(data.category);

      // Actualizar en el estado local
      setCategories((prev) =>
        prev.map((c) =>
          c.id_categoria === id_categoria ? mapped : c
        )
      );

      return data.category;
    } catch (err) {
      console.error("❌ useCategories - updateCategory:", err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al actualizar la categoría.",
        "error"
      );
      throw err;
    }
  }, []);

  // 🔹 Eliminar categoría (DELETE /api/categories/:id)
  const deleteCategory = useCallback(async (id_categoria) => {
    try {
      const { data } = await axios.delete(`${API}/${id_categoria}`);

      Swal.fire({
        icon: "success",
        title: "✅ Categoría eliminada",
        text: data.message || "Categoría eliminada correctamente",
        timer: 1400,
        showConfirmButton: false,
        background: "#e8f5e9",
        color: "#1b5e20",
      });

      // Quitar del estado local
      setCategories((prev) =>
        prev.filter((c) => c.id_categoria !== id_categoria)
      );
    } catch (err) {
      console.error("❌ useCategories - deleteCategory:", err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "Error al eliminar la categoría.",
        "error"
      );
      throw err;
    }
  }, []);

  // 🔹 Helpers opcionales para manipular localmente desde el Index
  const addLocal = useCallback((cat) => {
    setCategories((prev) => [mapFromApi(cat), ...prev]);
  }, []);

  const updateLocal = useCallback((cat) => {
    const mapped = mapFromApi(cat);
    setCategories((prev) =>
      prev.map((c) =>
        c.id_categoria === mapped.id_categoria ? mapped : c
      )
    );
  }, []);

  const removeLocal = useCallback((id_categoria) => {
    setCategories((prev) =>
      prev.filter((c) => c.id_categoria !== id_categoria)
    );
  }, []);

  return {
    categories,
    loading,
    error,
    // recargar desde el backend
    refresh: fetchCategories,

    // CRUD contra API
    createCategory,
    updateCategory,
    deleteCategory,

    // helpers locales (por si ya los usabas en el Index)
    addLocal,
    updateLocal,
    removeLocal,
  };
}
