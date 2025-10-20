// shared/hooks/useDeleteCategory.js
import { useState, useCallback } from "react";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart";
const API = `${API_BASE}/api/categories`;

export function useDeleteCategory({ onDeleted, refresh } = {}) {
  const [deleting, setDeleting] = useState(false);

  const deleteCategory = useCallback(
    async (category) => {
      if (!category?.id_categoria) return;
      try {
        setDeleting(true);

        const res = await fetch(`${API}/${category.id_categoria}`, { method: "DELETE" });
        const data = await res.json();

        if (!res.ok) throw new Error(data?.error || "No se pudo eliminar la categoría.");

        if (onDeleted) onDeleted(category.id_categoria);
        else if (refresh) refresh();

        Swal.fire({
          icon: "success",
          title: "Categoría eliminada",
          text: data?.message || "✅ Eliminada correctamente",
          background: "#e8f5e9",
          color: "#1b5e20",
          timer: 1400,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("❌ useDeleteCategory:", err);
        Swal.fire("Error", err.message || "No se pudo conectar con el servidor.", "error");
        throw err;
      } finally {
        setDeleting(false);
      }
    },
    [onDeleted, refresh]
  );

  return { deleteCategory, deleting };
}
