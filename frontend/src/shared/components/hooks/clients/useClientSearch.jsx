// frontend/src/shared/components/hooks/clients/useClientSearch.jsx
import { useState } from "react";
import { mapClientFromBackend } from "../../../components/mappers/clientMappers";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useSearchClient = () => {
  const [clients, setClients] = useState([]);   // 👈 ya en formato de FRONT
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchClient = async (q) => {
    const query = String(q || "").trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/kajamart/api/clients/search/${encodeURIComponent(query)}`
      );

      // Si el back responde 404 = no hay clientes, no lo tratamos como "error grave"
      if (res.status === 404) {
        setClients([]);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - Error al buscar clientes`);
      }

      const data = await res.json();

      // Normalizamos todos los clientes al formato del FRONT
      const normalized = Array.isArray(data)
        ? data.map(mapClientFromBackend)
        : [];

      setClients(normalized);
    } catch (err) {
      console.error("❌ Error al buscar el cliente:", err);
      setError(err.message);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const clearClients = () => setClients([]);

  return {
    clients,        // 👉 ya vienen con {id, nombre, numeroDocumento, estado, ...}
    loading,
    error,
    searchClient,
    clearClients,
  };
};

export default useSearchClient;
