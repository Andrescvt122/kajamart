// shared/hooks/useUpdateCategory.js
import { useState, useCallback } from "react";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart";
const API = `${API_BASE}/api/categories`;

export function useUpdateCategory({ onUpdated, refresh } = {}) {
  const [updating, setUpdating] = useState(false);

  const updateCategory = useCallback(
    async (payload) => {
      // payload esperado: { id_categoria, nombre, descripcion, estado ("Activo"/"Inactivo") }
      if (!payload?.id_categoria) return;

      try {
        setUpdating(true);

        const res = await fetch(`${API}/${payload.id_categoria}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre_categoria: payload.nombre,
            descripcion_categoria: payload.descripcion,
            estado: payload.estado === "Activo",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "No se pudo actualizar la categoría.");

        if (onUpdated) onUpdated(data.category);
        else if (refresh) refresh();

        Swal.fire({
          icon: "success",
          title: "✅ Categoría actualizada",
          text: data?.message || "Actualización exitosa",
          background: "#e8f5e9",
          color: "#1b5e20",
          timer: 1400,
          showConfirmButton: false,
        });

        return data.category;
      } catch (err) {
        console.error("❌ useUpdateCategory:", err);
        Swal.fire("Error", err.message || "No se pudo conectar con el servidor.", "error");
        throw err;
      } finally {
        setUpdating(false);
      }
    },
    [onUpdated, refresh]
  );

  return { updateCategory, updating };
}
