// hooks/clients/useGetClientById.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/clients";

export const useGetClientById = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClientById = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/${id}`);

      const adaptedData = {
        id: response.data.id_cliente || response.data.id,
        nombre: response.data.nombre_cliente,
        tipoDocumento: response.data.tipo_docume,
        numeroDocumento: response.data.numero_doc,
        correo: response.data.correo_cliente,
        telefono: response.data.telefono_cliente,
        activo: response.data.estado_cliente,
      };

      setData(adaptedData);
    } catch (err) {
      console.error("❌ Error al obtener cliente:", err);
      setError(
        err.response?.data?.error || "Error al obtener cliente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientById();
  }, [id]);

  return { data, loading, error, refetch: fetchClientById };
};