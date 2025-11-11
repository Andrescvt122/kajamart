// frontend/src/shared/components/hooks/products/products.hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";
const API_URL = `${API_BASE}/products`;

// 🔹 Obtener todos los productos
export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return Array.isArray(data) ? data : [];
    },
  });

// 🔹 Obtener producto por ID
export const useProduct = (id) =>
  useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });

// 🔹 Crear producto (acepta JSON o FormData)
export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // Si es FormData (viene con imagen), NO tocamos headers
      if (payload instanceof FormData) {
        const { data } = await axios.post(API_URL, payload);
        return data;
      }

      // JSON normal
      const { data } = await axios.post(API_URL, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(["products"]),
  });
};

// 🔹 Actualizar producto
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }) => {
      const { data } = await axios.put(`${API_URL}/${id}`, rest);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(["products"]),
  });
};

// 🔹 Eliminar producto
export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => qc.invalidateQueries(["products"]),
  });
};
