// shared/hooks/useCreateCategory.js
import { useState, useCallback } from "react";
import Swal from "sweetalert2";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart";
const API = `${API_BASE}/api/categories`;

export function useCreateCategory({ onCreated, refresh } = {}) {
  const [creating, setCreating] = useState(false);

  const createCategory = useCallback(
    async (form) => {
      try {
        setCreating(true);
        const res = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre_categoria: form.nombre,
            descripcion_categoria: form.descripcion,
            estado: form.estado === "Activo",
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "No se pudo registrar la categoría.");

        Swal.fire({
          icon: "success",
          title: "✅ Categoría registrada",
          text: data?.message || "Creación exitosa",
          background: "#e8f5e9",
          color: "#1b5e20",
          timer: 1400,
          showConfirmButton: false,
        });

        // Notificar arriba (optimista) o refrescar
        if (onCreated) onCreated(data.category);
        else if (refresh) refresh();

        return data.category;
      } catch (err) {
        console.error("❌ useCreateCategory:", err);
        Swal.fire("Error", err.message || "No se pudo conectar con el servidor.", "error");
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [onCreated, refresh]
  );

  return { createCategory, creating };
}
