// usePurchases.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const PURCHASES_URL = "http://localhost:3000/kajamart/api/purchase";
//KAROL, NO LO MODIFIQUE, ES NECESARIO PARA DEVOLUCION DE PRODUTOS Y TAMBIEN SERVIRA PARA LISTAR COMPRAS EN EL FUTURO.
/**
 * Hook para obtener todas las compras.
 *
 * @returns {{
 *   purchases: Compra[] | null,
 *   loading: boolean,
 *   error: string | null,
 *   refetch: () => Promise<void>
 * }}
 */
export function useFetchPurchases() {
  const [purchases, setPurchases] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(PURCHASES_URL);
      // El backend responde: { purchase: [...] }
      setPurchases(response.data.purchase || []);
    } catch (err) {
      console.error("Error al obtener las compras", err);
      setError("Error al obtener las compras");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    refetch: fetchPurchases,
  };
}