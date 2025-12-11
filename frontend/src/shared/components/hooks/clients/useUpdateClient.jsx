// hooks/clients/useClientUpdate.jsx
import { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/clients";

export const useClientUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateClient = async (idCliente, formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const clientData = {
        nombre_cliente: formData.nombre.trim(),
        tipo_docume: formData.tipoDocumento,
        numero_doc: formData.numeroDocumento.trim(),
        correo_cliente:
          formData.correo && formData.correo.toString().trim() !== ""
            ? formData.correo.toString().trim()
            : "N/A",
        telefono_cliente:
          formData.telefono && formData.telefono.toString().trim() !== ""
            ? formData.telefono.toString().trim()
            : "N/A",
        estado_cliente: formData.activo ? "Activo" : "Inactivo",
      };

      const response = await axios.put(
        `${API_URL}/${idCliente}`,
        clientData
      );

      const client = response.data.client || {};

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
      console.error("❌ Error al actualizar cliente:", err);
      setError(err.response?.data?.error || "Error al actualizar cliente.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateClient, loading, error, success };
};
