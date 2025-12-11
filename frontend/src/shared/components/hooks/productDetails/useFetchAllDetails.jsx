import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:3000/kajamart/api/detailsProducts";

export function useFetchAllDetails() {
  const [details, setDetails] = useState([]);   // datos de la API
  const [loading, setLoading] = useState(false); // indicador de carga
  const [error, setError] = useState(null);      // error si algo falla

  const fetchDetails = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL, signal ? { signal } : undefined);

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Si quieres convertir la fecha a objeto Date, podrías hacerlo aquí:
        // const parsed = data.map((item) => ({
        //   ...item,
        //   fecha_vencimiento: item.fecha_vencimiento
        //     ? new Date(item.fecha_vencimiento)
        //     : null,
        // }));

        setDetails(data);
      } catch (err) {
        // Ignoramos si el error fue por abortar la petición
        if (err.name === "AbortError") return;
        console.error("❌ Error al obtener detalles:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Llamada inicial al montar el componente
  useEffect(() => {
    const controller = new AbortController();

    fetchDetails(controller.signal);

    return () => {
      // Cancelar request si el componente se desmonta
      controller.abort();
    };
  }, [fetchDetails]);

  // Permite volver a cargar los datos manualmente
  const refetch = useCallback(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    details,
    loading,
    error,
    refetch,
  };
}
