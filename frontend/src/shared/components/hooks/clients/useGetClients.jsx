// hooks/clients/useGetClients.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/clients";

export const useGetClients = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);

      // Adaptar la respuesta del backend al formato del frontend
      const adaptedData = response.data.map((client) => ({
        id: client.id_cliente || client.id,
        nombre: client.nombre_cliente,
        tipoDocumento: client.tipo_docume,
        numeroDocumento: client.numero_doc,
        correo: client.correo_cliente,
        telefono: client.telefono_cliente,
        activo: client.estado_cliente
      }));
      console.log("✅ Clientes obtenidos:", adaptedData);
      setData(adaptedData);
    } catch (err) {
      console.error("❌ Error al obtener clientes:", err);
      setError(
        err.response?.data?.error || "Error al obtener clientes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { data, loading, error, refetch: fetchClients };
};