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

// Limita descripción a 80 chars
const clampDesc = (s = "", max = 80) => String(s ?? "").slice(0, max);
export const getAllCategoriesForExport = async (search = "") => {

  const { data } = await axios.get(`${API}?page=1&limit=10000&search=${search}`);

  return data.data;

};
import * as XLSX from "xlsx";

export const exportCategoriesToExcel = (data) => {

  const formatted = data.map((c) => ({
    ID: c.id_categoria,
    Nombre: c.nombre_categoria,
    Descripción: c.descripcion_categoria,
    Estado: c.estado ? "Activo" : "Inactivo",
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Categorias");

  XLSX.writeFile(wb, "categorias.xlsx");

};
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportCategoriesToPDF = (data) => {

  const doc = new jsPDF();

  const tableData = data.map((c) => [
    c.id_categoria,
    c.nombre_categoria,
    c.descripcion_categoria,
    c.estado ? "Activo" : "Inactivo",
  ]);

  autoTable(doc, {
    head: [["ID", "Nombre", "Descripción", "Estado"]],
    body: tableData,
  });

  doc.save("categorias.pdf");

};

export function useCategories() {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const abortRef = useRef(null);

  // ==============================
  // GET categorías (paginadas)
  // ==============================
  const fetchCategories = useCallback(async (page = 1, limit = 6, search = "") => {
    try {

      setLoading(true);
      setError(null);

      if (abortRef.current) abortRef.current.abort();

      abortRef.current = new AbortController();

      const { data } = await axios.get(
        `${API}?page=${page}&limit=${limit}&search=${search}`,
        { signal: abortRef.current.signal }
      );
      
      setCategories(Array.isArray(data.data) ? data.data.map(mapFromApi) : []);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);

    } catch (err) {

      if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;

      console.error("❌ useCategories - fetchCategories:", err);

      setError(
        err.response?.data?.error ||
        "Error al obtener las categorías."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  // ==============================
  // Cargar al montar
  // ==============================
  useEffect(() => {

    fetchCategories(1, 6);

    return () => abortRef.current?.abort();

  }, [fetchCategories]);

  // ==============================
  // CREATE
  // ==============================
  const createCategory = useCallback(async (form) => {

    try {

      const body = {
        nombre_categoria: form.nombre?.trim(),
        descripcion_categoria: clampDesc(form.descripcion),
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

  // ==============================
  // UPDATE
  // ==============================
  const updateCategory = useCallback(async (payload) => {

    try {

      const { id_categoria, nombre, descripcion, estado } = payload;

      const body = {
        nombre_categoria: nombre?.trim(),
        descripcion_categoria: clampDesc(descripcion),
        estado: toBoolEstado(estado, true),
      };

      const { data } = await axios.put(
        `${API}/${id_categoria}`,
        body,
        { headers: { "Content-Type": "application/json" } }
      );

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

  // ==============================
  // DELETE
  // ==============================
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

  // ==============================
  // Helpers locales
  // ==============================
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

  // ==============================
  // RETURN
  // ==============================
  return {
    categories,
    totalPages,
    totalItems,
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