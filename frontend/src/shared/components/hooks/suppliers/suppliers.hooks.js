// frontend/src/shared/components/hooks/suppliers/suppliers.hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";
const API_URL = `${API_BASE}/suppliers`;

// 🔹 Obtener todos los proveedores
export const useSuppliers = () =>
  useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return Array.isArray(data) ? data : [];
    },
  });

// 🔹 Obtener proveedor por ID (con productos y categorías)
export const useSupplier = (id) =>
  useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });

// 🔹 Crear proveedor
export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // el modal ya envía categorias como [id_categoria]
      const { data } = await axios.post(API_URL, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(["suppliers"]),
  });
};

// 🔹 Actualizar proveedor
export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }) => {
      const { data } = await axios.put(`${API_URL}/${id}`, rest);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(["suppliers"]),
  });
};

// 🔹 Eliminar proveedor
export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => qc.invalidateQueries(["suppliers"]),
  });
};
 // 👇 al final del archivo suppliers.hooks.js
export const useSupplierDetail = (id) =>
  useQuery({
    queryKey: ["supplier-detail", id],
    enabled: !!id,
    queryFn: async () => {
      // Endpoint combinado del backend: /suppliers/:id/detail
      const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";
      const API_URL = `${API_BASE}/suppliers`;
      const { data } = await axios.get(`${API_URL}/${id}/detail`);
      return data; // { ...proveedor, categorias:[...], productos:[...] }
    },
    staleTime: 60_000,
  });
