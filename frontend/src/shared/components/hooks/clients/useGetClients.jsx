import { useCallback, useEffect, useState } from "react";
import axios from "axios";

//Usar API_URL_DEPLOY si quieres usar la de azure.
const API_URL_DEPLOY = "http://localhost:3000/kajamart/api/clients";
const API_URL = "http://localhost:3000/kajamart/api/clients";
const DEFAULT_LIMIT = 6;

export const useGetClients = ({ initialPage = 1, limit = DEFAULT_LIMIT } = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(Number(initialPage) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchClients = useCallback(
    async (requestedPage = page) => {
      const safePage = Number(requestedPage) > 0 ? Number(requestedPage) : 1;
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_URL}?page=${safePage}&limit=${limit}`
        );

        const clients = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        const adaptedData = clients.map((client) => ({
          id: client.id_cliente || client.id,
          nombre: client.nombre_cliente ?? client.nombre ?? "",
          tipoDocumento: client.tipo_docume ?? client.tipoDocumento ?? "",
          numeroDocumento: client.numero_doc ?? client.numeroDocumento ?? "",
          correo: client.correo_cliente ?? client.correo ?? "",
          telefono: client.telefono_cliente ?? client.telefono ?? "",
          activo:
            client.estado_cliente ??
            client.activo ??
            (client.estado === "activo") ??
            false,
        }));

        setData(adaptedData);

        const remotePage = Number(response.data.pagination?.page) || safePage;
        const remoteTotal = Number(response.data.pagination?.totalPages) || 1;
        const remoteTotalItems = Number(
          response.data.pagination?.totalItems ?? response.data.pagination?.total
        ) || 0;

        setPage(remotePage);
        setTotalPages(remoteTotal);
        setTotalItems(remoteTotalItems);
      } catch (err) {
        console.error("❌ Error al obtener clientes:", err);
        setError(
          err.response?.data?.error || err.message || "Error al obtener clientes."
        );
      } finally {
        setLoading(false);
      }
    },
    [limit, page]
  );

  useEffect(() => {
    fetchClients(page);
  }, [fetchClients, page]);

  const refetch = useCallback(() => fetchClients(page), [fetchClients, page]);

  const goToPage = useCallback(
    (nextPage) => {
      const safeNext = Number(nextPage) > 0 ? Number(nextPage) : 1;
      setPage((prev) => {
        if (safeNext === prev) return prev;
        return safeNext;
      });
    },
    [setPage]
  );

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    setPage,
    goToPage,
    refetch,
  };
};