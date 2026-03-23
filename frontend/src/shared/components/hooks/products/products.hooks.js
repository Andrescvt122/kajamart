// frontend/src/shared/components/hooks/products/products.hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api";
const API_URL = `${API_BASE}/products`;

// 🔹 Obtener todos los productos sin paginación
export const useAllProducts = () =>
  useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/all`);
      return Array.isArray(data) ? data : [];
    },
  });

// 🔹 Obtener todos los productos
export const useProducts = (page = 1, limit = 6) =>
  useQuery({
    queryKey: ["products", page],
    queryFn: async () => {

      const { data } = await axios.get(
        `${API_URL}?page=${page}&limit=${limit}`
      );

      return data;

    },
    keepPreviousData: true
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
      if (payload instanceof FormData) {
        const { data } = await axios.post(API_URL, payload);
        return data;
      }
      const { data } = await axios.post(API_URL, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(["products"]),
  });
};

// 🔹 Actualizar producto (acepta JSON o FormData)
export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { id, data, ...rest } = payload;
      const body = data ?? rest;

      if (body instanceof FormData) {
        const { data: resp } = await axios.put(`${API_URL}/${id}`, body);
        return resp;
      }
      const { data: resp } = await axios.put(`${API_URL}/${id}`, body);
      return resp;
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