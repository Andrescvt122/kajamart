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
      return Array.isArray(data) ? data : [];
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
      const { data } = await axios.delete(
        `${DETAILS_URL}/${id_detalle_producto}`
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
