import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/clients";

export const useGetClients = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchClients = async (pageNumber = page) => {

    setLoading(true);
    setError(null);

    try {

      const response = await axios.get(
        `${API_URL}?page=${pageNumber}&limit=${limit}`
      );

      const clients = response.data.data;

      const adaptedData = clients.map((client) => ({
        id: client.id_cliente || client.id,
        nombre: client.nombre_cliente,
        tipoDocumento: client.tipo_docume,
        numeroDocumento: client.numero_doc,
        correo: client.correo_cliente,
        telefono: client.telefono_cliente,
        activo: client.estado_cliente
      }));

      setData(adaptedData);
      setTotalPages(response.data.pagination.totalPages);
      setPage(response.data.pagination.page);

      console.log("✅ Clientes obtenidos:", adaptedData);

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
    fetchClients(1);
  }, []);

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    setPage,
    refetch: fetchClients
  };
};