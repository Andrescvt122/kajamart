import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/users";

export const useCreateUsuario = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const createUsuario = async (nuevoUsuario) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // 🧠 Adaptamos el formulario a lo que el backend espera
    const payload = {
      nombre: nuevoUsuario.nombre.trim(),
      apellido: nuevoUsuario.apellido.trim(),
      telefono: nuevoUsuario.telefono?.trim() || null,
      documento: nuevoUsuario.documento.trim(),
      email: nuevoUsuario.correo.trim(), // backend espera "email"
      rol_id: nuevoUsuario.rol_id, // backend espera el ID numérico del rol
      estado_usuario: nuevoUsuario.estado, // backend usa "estado_usuario"
    };

    // ⚠️ Validación básica antes de enviar
    if (
      !payload.nombre ||
      !payload.apellido ||
      !payload.documento ||
      !payload.email ||
      !payload.rol_id
    ) {
      setError("Por favor completa todos los campos obligatorios.");
      setLoading(false);
      return null;
    }

    try {
      const { data } = await axios.post(API_URL, payload);
      setSuccess("Usuario creado correctamente.");
      return data;
    } catch (err) {
      console.error("Error en la creación del usuario:", err);
      setError(err.response?.data?.error || "Error al crear usuario.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createUsuario, loading, error, success };
};
