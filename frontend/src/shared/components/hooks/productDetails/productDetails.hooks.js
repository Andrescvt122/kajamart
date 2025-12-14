// src/hooks/useDetailProducts.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";

// 👇 ruta según tu backend: /kajamart/api/detailsProducts/...
const DETAILS_URL = `${API_BASE}/detailsProducts`;

// 🔵 Traer TODOS los detalles (opcional, para listados globales)
export const useAllDetailProducts = () =>
  useQuery({
    queryKey: ["detailProducts"],
    queryFn: async () => {
      const { data } = await axios.get(DETAILS_URL);

      // ✅ soporta respuestas tipo: [] | {data: []} | {rows: []} | {results: []}
      const arr =
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.rows) && data.rows) ||
        (Array.isArray(data?.results) && data.results) ||
        [];

      return arr;
    },
  });


// 🟣 Traer detalles de un producto específico (por id_producto)
export const useDetailProductsByProduct = (id_producto) =>
  useQuery({
    queryKey: ["detailProductsByProduct", id_producto],
    queryFn: async () => {
      const { data } = await axios.get(
        `${DETAILS_URL}/producto/${id_producto}`
      );
      return Array.isArray(data) ? data : [];
    },
    enabled: !!id_producto,
  });

// 🟠 Traer un detalle individual (por id_detalle_producto)
export const useDetailProduct = (id_detalle_producto) =>
  useQuery({
    queryKey: ["detailProduct", id_detalle_producto],
    queryFn: async () => {
      const { data } = await axios.get(
        `${DETAILS_URL}/${id_detalle_producto}`
      );
      return data;
    },
    enabled: !!id_detalle_producto,
  });

// 🟢 Crear un nuevo detalle de producto
// body esperado (ejemplo):
// {
//   id_producto,
//   codigo_barras,
//   fecha_vencimiento, // string "YYYY-MM-DD" o null
//   stock_producto,
//   es_devolucion
// }
export const useCreateDetailProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axios.post(DETAILS_URL, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      // variables.id_producto se puede usar para refetch de ese producto
      qc.invalidateQueries({ queryKey: ["detailProducts"] });
      if (variables?.id_producto) {
        qc.invalidateQueries({
          queryKey: ["detailProductsByProduct", variables.id_producto],
        });
      }
    },
  });
};

// 🟡 Actualizar detalle existente
export const useUpdateDetailProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    // payload: { id_detalle_producto, ...restoCampos }
    mutationFn: async ({ id_detalle_producto, ...rest }) => {
      const { data } = await axios.put(
        `${DETAILS_URL}/${id_detalle_producto}`,
        rest
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["detailProducts"] });
      qc.invalidateQueries({
        queryKey: ["detailProduct", variables.id_detalle_producto],
      });
      if (variables?.id_producto) {
        qc.invalidateQueries({
          queryKey: ["detailProductsByProduct", variables.id_producto],
        });
      }
    },
  });
};
// 🔴 Eliminar detalle
export const useDeleteDetailProduct = () => {
  const qc = useQueryClient();

  return useMutation({
    // payload: { id_detalle_producto, id_producto? }
    mutationFn: async ({ id_detalle_producto }) => {
      const { data } = await axios.delete(`${DETAILS_URL}/${id_detalle_producto}`);
      return data;
    },

    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["detailProducts"] });
      qc.invalidateQueries({ queryKey: ["detailProduct", variables.id_detalle_producto] });

      if (variables?.id_producto) {
        qc.invalidateQueries({
          queryKey: ["detailProductsByProduct", variables.id_producto],
        });
      }
    },

    // ✅ (opcional) deja el error “limpio” para mostrarlo en alertas
    onError: (err) => {
      // Esto NO impide que el componente lo capture con try/catch,
      // solo asegura que el error tenga un mensaje claro en consola
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al eliminar el detalle";

      console.error(`❌ Delete detail failed (${status ?? "sin status"}):`, msg, err?.response?.data);
    },
  });
};
