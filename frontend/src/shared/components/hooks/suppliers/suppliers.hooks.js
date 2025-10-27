// frontend/src/shared/components/hooks/suppliers/suppliers.hooks.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "http://localhost:3000/kajamart/api/suppliers";

export const useSuppliers = () =>
  useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data } = await axios.get(API_URL);
      return Array.isArray(data) ? data : [];
    },
  });

export const useSupplier = (id) =>
  useQuery({
    queryKey: ["supplier", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useCreateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      // payload debe incluir: {nombre, nit, telefono, direccion, estado:boolean, categoriaIds:number[], ...extras}
      const { data } = await axios.post(API_URL, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries(["suppliers"]),
  });
};

export const useUpdateSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      // data idem create
      const res = await axios.put(`${API_URL}/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries(["suppliers"]),
  });
};

export const useDeleteSupplier = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => qc.invalidateQueries(["suppliers"]),
  });
};
