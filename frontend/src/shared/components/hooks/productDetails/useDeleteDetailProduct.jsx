// src/hooks/useDetailProducts.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/kajamart/api";

const DETAILS_URL = `${API_BASE}/detailsProducts`;

export const useAllDetailProducts = () =>
  useQuery({
    queryKey: ["detailProducts"],
    queryFn: async () => {
      const { data } = await axios.get(DETAILS_URL);
      return Array.isArray(data) ? data : [];
    },
  });

export const useDetailProductsByProduct = (id_producto) =>
  useQuery({
    queryKey: ["detailProductsByProduct", id_producto],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${DETAILS_URL}/producto/${id_producto}`);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        // Si tu backend aún responde 404 cuando no hay detalles,
        // lo convertimos a array vacío para que el usuario vea "No se encontraron detalles"
        if (err?.response?.status === 404) return [];
        throw err;
      }
    },
    enabled: !!id_producto,
  });

export const useDetailProduct = (id_detalle_producto) =>
  useQuery({
    queryKey: ["detailProduct", id_detalle_producto],
    queryFn: async () => {
      const { data } = await axios.get(`${DETAILS_URL}/${id_detalle_producto}`);
      return data;
    },
    enabled: !!id_detalle_producto,
  });

export const useCreateDetailProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axios.post(DETAILS_URL, payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["detailProducts"] });
      if (variables?.id_producto) {
        qc.invalidateQueries({
          queryKey: ["detailProductsByProduct", variables.id_producto],
        });
      }
    },
  });
};

export const useUpdateDetailProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_detalle_producto, ...rest }) => {
      const { data } = await axios.put(`${DETAILS_URL}/${id_detalle_producto}`, rest);
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

export const useDeleteDetailProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id_detalle_producto }) => {
      const { data } = await axios.delete(`${DETAILS_URL}/${id_detalle_producto}`);
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