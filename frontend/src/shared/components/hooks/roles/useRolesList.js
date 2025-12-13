// Archivo: useRolesList.js
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/roles";

export const useRolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Obtener lista completa de roles desde el backend
  const getRoles = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      setRoles(data);
    } catch (err) {
      console.error("❌ Error al obtener roles:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Agregar un nuevo rol sin recargar la página
  const addRole = (newRole) => {
    setRoles((prev) => {
      // Evita duplicados por ID
      const exists = prev.some((r) => r.rol_id === newRole.rol_id);
      return exists ? prev : [...prev, newRole];
    });
  };

  // 🔹 Actualizar un rol en el estado local
  const updateRoleInState = (updated) => {
    setRoles((prev) =>
      prev.map((r) => (r.rol_id === updated.rol_id ? updated : r))
    );
  };

  // 🔹 Eliminar un rol del estado local
  const deleteRoleInState = (id) => {
    setRoles((prev) => prev.filter((r) => r.rol_id !== id));
  };

  // 🔹 Cargar roles al iniciar
  useEffect(() => {
    getRoles();
  }, []);

  return {
    roles,
    loading,
    error,
    getRoles,
    addRole,
    updateRoleInState,
    deleteRoleInState,
  };
};