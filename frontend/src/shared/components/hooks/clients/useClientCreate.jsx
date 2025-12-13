// hooks/clients/useClientCreate.jsx
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/clients";

export const useClientCreate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // helper para campos opcionales
  const toNullable = (value) => {
    if (value === undefined || value === null) return null;
    const v = value.toString().trim();
    return v === "" ? null : v;
  };

  const createClient = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Adaptar los campos del formulario al formato que espera el backend
      const clientData = {
        nombre_cliente: formData.nombre.trim(),
        tipo_docume: formData.tipoDocumento,
        numero_doc: formData.numeroDocumento.trim(),

        // 👇 AHORA correo y teléfono son opcionales: si vienen vacíos mandamos null
        correo_cliente: toNullable(formData.correo),
        telefono_cliente: toNullable(formData.telefono),

        // texto, acorde a lo que devuelve el backend ("Activo"/"Inactivo")
        estado_cliente: formData.activo ? "Activo" : "Inactivo",
      };

      const response = await axios.post(API_URL, clientData);

      const client = response.data.client || {};

      // Adaptar la respuesta del backend al formato de frontend
      const adaptedData = {
        id: client.id_cliente ?? client.id,
        nombre_cliente: client.nombre_cliente,
        tipo_docume: client.tipo_docume,
        numero_doc: client.numero_doc,
        correo_cliente: client.correo_cliente,
        telefono_cliente: client.telefono_cliente,
        estado_cliente: client.estado_cliente,
      };

      setSuccess(true);
      return adaptedData;
    } catch (err) {
      console.error("❌ Error al crear cliente:", err);
      setError(err.response?.data?.error || "Error al crear cliente.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createClient, loading, error, success };
};