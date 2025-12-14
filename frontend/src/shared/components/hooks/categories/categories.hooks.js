import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart";
const API = `${API_BASE}/api/categories`;

// Mapper desde API → UI
const mapFromApi = (cat) => ({
  id_categoria: cat.id_categoria,
  id: `CAT${String(cat.id_categoria).padStart(3, "0")}`,
  nombre: cat.nombre_categoria,
  descripcion: cat.descripcion_categoria,
  estado: cat.estado ? "Activo" : "Inactivo",
});

// Normaliza cualquier forma de "estado" a boolean
const toBoolEstado = (v, fallback = true) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    if (s === "true" || s === "1" || s === "activo") return true;
    if (s === "false" || s === "0" || s === "inactivo") return false;
  }
  return fallback;
};

// Limita descripción a 80 chars (según schema: VarChar(80))
const clampDesc = (s = "", max = 80) => String(s ?? "").slice(0, max);

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // GET todas
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      const { data } = await axios.get(API, { signal: abortRef.current.signal });
      setCategories(Array.isArray(data) ? data.map(mapFromApi) : []);
    } catch (err) {
      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
      console.error("❌ useCategories - fetchCategories:", err);
      setError(err.response?.data?.error || "Error al obtener las categorías.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    return () => abortRef.current?.abort();
  }, [fetchCategories]);

  // CREATE
  const createCategory = useCallback(async (form) => {
    try {
      const body = {
        nombre_categoria: form.nombre?.trim(),
        descripcion_categoria: clampDesc(form.descripcion),
        // 👇 acepta boolean o string; default true
        estado: toBoolEstado(form.estado, true),
      };

      const { data } = await axios.post(API, body, {
        headers: { "Content-Type": "application/json" },
      });

      Swal.fire({
        icon: "success",
        title: "✅ Categoría creada",
        text: data.message || "Categoría creada correctamente",
        timer: 1400,
        showConfirmButton: false,
        background: "#e8f5e9",
        color: "#1b5e20",
      });

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

  // UPDATE
  const updateCategory = useCallback(async (payload) => {
    try {
      const { id_categoria, nombre, descripcion, estado } = payload;

      const body = {
        nombre_categoria: nombre?.trim(),
        descripcion_categoria: clampDesc(descripcion),
        estado: toBoolEstado(estado, true),
      };

      const { data } = await axios.put(`${API}/${id_categoria}`, body, {
        headers: { "Content-Type": "application/json" },
      });

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
      setCategories((prev) =>
        prev.map((c) => (c.id_categoria === id_categoria ? mapped : c))
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

  // DELETE
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
      setCategories((prev) => prev.filter((c) => c.id_categoria !== id_categoria));
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

  // Helpers locales
  const addLocal = useCallback((cat) => {
    setCategories((prev) => [mapFromApi(cat), ...prev]);
  }, []);

  const updateLocal = useCallback((cat) => {
    const mapped = mapFromApi(cat);
    setCategories((prev) =>
      prev.map((c) => (c.id_categoria === mapped.id_categoria ? mapped : c))
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
    createCategory,
    updateCategory,
    deleteCategory,
    addLocal,
    updateLocal,
    removeLocal,
  };
}